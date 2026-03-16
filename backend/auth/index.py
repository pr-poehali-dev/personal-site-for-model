"""
Auth endpoint: register, login, get current user.
Action передаётся через queryStringParameters: ?action=register | login | me
"""
import json
import os
import hashlib
import hmac
import base64
import time
import urllib.request
import psycopg2


def get_db():
    return psycopg2.connect(dsn=os.environ["DATABASE_URL"])


def get_schema():
    return os.environ.get("MAIN_DB_SCHEMA", "public")


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    h = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(password: str, stored: str) -> bool:
    parts = stored.split(":")
    if len(parts) != 2:
        return False
    salt, h = parts
    return hmac.compare_digest(h, hashlib.sha256(f"{salt}{password}".encode()).hexdigest())


def make_token(user_id: int, role: str) -> str:
    secret = os.environ["JWT_SECRET"].encode()
    header = base64.urlsafe_b64encode(b'{"alg":"HS256","typ":"JWT"}').rstrip(b"=").decode()
    exp = int(time.time()) + 60 * 60 * 24 * 30
    payload_data = json.dumps({"sub": user_id, "role": role, "exp": exp}).encode()
    payload = base64.urlsafe_b64encode(payload_data).rstrip(b"=").decode()
    sig_input = f"{header}.{payload}".encode()
    sig = base64.urlsafe_b64encode(
        hmac.new(secret, sig_input, hashlib.sha256).digest()
    ).rstrip(b"=").decode()
    return f"{header}.{payload}.{sig}"


def verify_token(token: str):
    secret = os.environ["JWT_SECRET"].encode()
    parts = token.split(".")
    if len(parts) != 3:
        return None
    header, payload, sig = parts
    sig_input = f"{header}.{payload}".encode()
    expected = base64.urlsafe_b64encode(
        hmac.new(secret, sig_input, hashlib.sha256).digest()
    ).rstrip(b"=").decode()
    if not hmac.compare_digest(sig, expected):
        return None
    padding = 4 - len(payload) % 4
    data = json.loads(base64.urlsafe_b64decode(payload + "=" * padding))
    if data.get("exp", 0) < int(time.time()):
        return None
    return data


def get_subscription(user_id: int, schema: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        f"SELECT tier, status, expires_at FROM {schema}.subscriptions "
        f"WHERE user_id = %s AND status = 'active' ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {"tier": row[0], "status": row[1], "expires_at": str(row[2])}


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
}


def ok(data: dict, status: int = 200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data)}


def err(msg: str, status: int = 400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    schema = get_schema()
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # ── ME ──────────────────────────────────────────────────────────────
    if action == "me":
        auth = (event.get("headers") or {}).get("X-Authorization", "") or \
               (event.get("headers") or {}).get("Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        payload = verify_token(token)
        if not payload:
            return err("Unauthorized", 401)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, email, name, role FROM {schema}.users WHERE id = %s",
            (payload["sub"],)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return err("User not found", 404)
        return ok({
            "id": row[0], "email": row[1], "name": row[2], "role": row[3],
            "subscription": get_subscription(row[0], schema)
        })

    # ── REGISTER ────────────────────────────────────────────────────────
    if action == "register":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        name = (body.get("name") or "").strip()
        if not email or not password:
            return err("Email and password are required")
        if len(password) < 6:
            return err("Password must be at least 6 characters")
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {schema}.users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return err("Email already registered")
        ph = hash_password(password)
        cur.execute(
            f"INSERT INTO {schema}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, role",
            (email, ph, name or None)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        user_id, role = row
        token = make_token(user_id, role)
        return ok({
            "token": token,
            "user": {"id": user_id, "email": email, "name": name, "role": role, "subscription": None}
        }, 201)

    # ── LOGIN ────────────────────────────────────────────────────────────
    if action == "login":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        if not email or not password:
            return err("Email and password are required")
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, password_hash, name, role FROM {schema}.users WHERE email = %s",
            (email,)
        )
        row = cur.fetchone()
        conn.close()
        if not row or not verify_password(password, row[1]):
            return err("Invalid email or password", 401)
        user_id, _, name, role = row
        token = make_token(user_id, role)
        return ok({
            "token": token,
            "user": {
                "id": user_id, "email": email, "name": name, "role": role,
                "subscription": get_subscription(user_id, schema)
            }
        })

    # ── GOOGLE ───────────────────────────────────────────────────────────
    if action == "google":
        google_token = body.get("token") or ""
        if not google_token:
            return err("Google token required", 400)
        req = urllib.request.Request(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={google_token}"
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                info = json.loads(resp.read())
        except Exception:
            return err("Invalid Google token", 401)
        if info.get("aud") != os.environ.get("GOOGLE_CLIENT_ID", ""):
            return err("Invalid Google token audience", 401)
        email = (info.get("email") or "").strip().lower()
        name = info.get("name") or info.get("given_name") or ""
        if not email:
            return err("Google account has no email", 400)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, name, role FROM {schema}.users WHERE email = %s", (email,))
        row = cur.fetchone()
        if row:
            user_id, db_name, role = row
        else:
            cur.execute(
                f"INSERT INTO {schema}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, role",
                (email, "google:oauth", name or None)
            )
            ins = cur.fetchone()
            conn.commit()
            user_id, role = ins
            db_name = name
        conn.close()
        token = make_token(user_id, role)
        return ok({
            "token": token,
            "user": {
                "id": user_id, "email": email, "name": db_name, "role": role,
                "subscription": get_subscription(user_id, schema)
            }
        })

    return err("Unknown action. Use ?action=register|login|me|google", 404)
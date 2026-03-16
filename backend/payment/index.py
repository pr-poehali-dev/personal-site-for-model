"""
Payment + Webhook endpoint.
POST /?action=create  — создать ссылку на оплату (требует JWT)
GET  /?action=status  — проверить подписку пользователя (требует JWT)
POST /?action=webhook — вебхук от Lava.top, выдаёт подписку после оплаты
"""
import hashlib
import json
import os
import urllib.request
import urllib.error
import psycopg2
import base64
import hmac
import time
from datetime import datetime, timedelta, timezone

LAVA_API = "https://gate.lava.top/api/v3/invoice"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
}


def ok(data: dict, status: int = 200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data)}


def err(msg: str, status: int = 400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def get_db():
    return psycopg2.connect(dsn=os.environ["DATABASE_URL"])


def get_schema():
    return os.environ.get("MAIN_DB_SCHEMA", "public")


def verify_token(token: str):
    if not token:
        return None
    secret = os.environ.get("JWT_SECRET", "").encode()
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


def get_current_user(event: dict):
    auth = (event.get("headers") or {}).get("X-Authorization", "") or \
           (event.get("headers") or {}).get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    return verify_token(token)


def get_tier_from_offer(offer_id: str) -> str:
    if offer_id == os.environ.get("LAVA_OFFER_VIP", "___"):
        return "vip"
    return "photo"


def grant_subscription(user_id: int, tier: str, schema: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE {schema}.subscriptions SET status = 'expired' WHERE user_id = %s AND status = 'active'",
        (user_id,)
    )
    expires_at = datetime.now(timezone.utc) + timedelta(days=31)
    cur.execute(
        f"INSERT INTO {schema}.subscriptions (user_id, tier, status, expires_at) VALUES (%s, %s, 'active', %s)",
        (user_id, tier, expires_at)
    )
    conn.commit()
    conn.close()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    # ── CREATE INVOICE ─────────────────────────────────────────────────
    if action == "create":
        payload = get_current_user(event)
        if not payload:
            return err("Unauthorized", 401)

        body = json.loads(event.get("body") or "{}")
        tier = body.get("tier", "photo")
        currency = body.get("currency", "USD")

        offer_id = os.environ.get("LAVA_OFFER_VIP" if tier == "vip" else "LAVA_OFFER_PHOTO", "")
        if not offer_id:
            return err("Offer not configured", 500)

        schema = get_schema()
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT email FROM {schema}.users WHERE id = %s", (payload["sub"],))
        row = cur.fetchone()
        conn.close()
        if not row:
            return err("User not found", 404)
        email = row[0]

        invoice_payload = json.dumps({
            "email": email,
            "offerId": offer_id,
            "currency": currency,
            "periodicity": "MONTHLY",
            "buyerLanguage": "EN",
        }).encode("utf-8")

        req = urllib.request.Request(
            LAVA_API,
            data=invoice_payload,
            headers={"Content-Type": "application/json", "X-Api-Key": os.environ["LAVA_API_KEY"]},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp_data = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            body_err = e.read().decode()
            return err(f"Lava error: {body_err}", 502)

        payment_url = resp_data.get("paymentUrl") or resp_data.get("url") or resp_data.get("invoiceUrl")
        invoice_id = resp_data.get("id") or resp_data.get("invoiceId")
        return ok({"paymentUrl": payment_url, "invoiceId": invoice_id, "tier": tier})

    # ── STATUS ─────────────────────────────────────────────────────────
    if action == "status":
        payload = get_current_user(event)
        if not payload:
            return err("Unauthorized", 401)

        schema = get_schema()
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT tier, status, expires_at FROM {schema}.subscriptions "
            f"WHERE user_id = %s AND status = 'active' ORDER BY created_at DESC LIMIT 1",
            (payload["sub"],)
        )
        row = cur.fetchone()
        conn.close()

        if not row:
            return ok({"active": False, "subscription": None})
        return ok({"active": True, "subscription": {"tier": row[0], "status": row[1], "expires_at": str(row[2])}})

    # ── WEBHOOK (called by Lava.top after payment) ──────────────────────
    if action == "webhook":
        # Verify Basic Auth
        auth_header = (event.get("headers") or {}).get("Authorization", "") or \
                      (event.get("headers") or {}).get("authorization", "")
        expected_login = os.environ.get("WEBHOOK_LOGIN", "")
        expected_password = os.environ.get("WEBHOOK_PASSWORD", "")
        if expected_login and expected_password:
            expected_b64 = base64.b64encode(f"{expected_login}:{expected_password}".encode()).decode()
            provided = auth_header.replace("Basic ", "").strip()
            if not hmac.compare_digest(provided, expected_b64):
                return err("Unauthorized", 401)

        raw = event.get("body") or ""
        if not raw:
            return err("Empty body", 400)

        try:
            data = json.loads(raw)
        except Exception:
            return err("Invalid JSON", 400)

        event_type = data.get("eventType", "")
        status_val = data.get("status", "")

        if event_type not in ("payment.success", "subscription.active") and status_val != "success":
            return ok({"skipped": True, "eventType": event_type})

        buyer = data.get("buyer") or {}
        buyer_email = (buyer.get("email") or data.get("buyerEmail") or data.get("email") or "").lower().strip()
        offer_id = data.get("offerId") or (data.get("offer") or {}).get("id") or ""

        if not buyer_email:
            return err("No buyer email", 422)

        tier = get_tier_from_offer(offer_id)
        schema = get_schema()

        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {schema}.users WHERE email = %s", (buyer_email,))
        row = cur.fetchone()

        if row:
            user_id = row[0]
        else:
            salt = os.urandom(16).hex()
            ph = f"{salt}:{hashlib.sha256(f'{salt}{os.urandom(16).hex()}'.encode()).hexdigest()}"
            cur.execute(
                f"INSERT INTO {schema}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
                (buyer_email, ph, buyer_email.split("@")[0])
            )
            user_id = cur.fetchone()[0]
            conn.commit()

        conn.close()
        grant_subscription(user_id, tier, schema)

        return ok({"granted": True, "user_id": user_id, "tier": tier})

    return err("Unknown action. Use ?action=create|status|webhook", 404)
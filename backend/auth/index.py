"""
Auth + Admin endpoint.
?action=register | login | me | google — для пользователей
?action=admin_stats | admin_users | admin_subscriptions | admin_media | admin_media_upload | admin_media_delete | admin_media_update — только для admin
"""
import json
import os
import hashlib
import hmac
import base64
import time
import random
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
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
}


def ok(data, status: int = 200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}


def err(msg: str, status: int = 400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def get_token_payload(event):
    auth = (event.get("headers") or {}).get("X-Authorization", "") or \
           (event.get("headers") or {}).get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    return verify_token(token)


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    schema = get_schema()
    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # ── ME ──────────────────────────────────────────────────────────────
    if action == "me":
        payload = get_token_payload(event)
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
        email = (body.get("email") or "").strip()
        password = body.get("password") or ""
        if not email or not password:
            return err("Email and password are required")
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, password_hash, name, role FROM {schema}.users WHERE lower(email) = lower(%s)",
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

    # ── SET PASSWORD (внутренний, защищён секретом) ──────────────────────
    if action == "set_password":
        secret_key = (params.get("key") or "")
        if secret_key != os.environ.get("ADMIN_SETUP_KEY", ""):
            return err("Forbidden", 403)
        email = body.get("email", "")
        password = body.get("password", "")
        role = body.get("role", "subscriber")
        if not email or not password:
            return err("email and password required")
        ph = hash_password(password)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {schema}.users SET password_hash=%s, role=%s WHERE email=%s RETURNING id",
            (ph, role, email)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        if not row:
            return err("User not found", 404)
        return ok({"updated": True, "id": row[0]})

    # ════════════════════════════════════════════════════════════════════
    # ADMIN ACTIONS — требуют role='admin'
    # ════════════════════════════════════════════════════════════════════
    if action.startswith("admin_"):
        payload = get_token_payload(event)
        if not payload:
            return err("Unauthorized", 401)
        if payload.get("role") != "admin":
            return err("Forbidden", 403)

        # ── STATS ─────────────────────────────────────────────────────
        if action == "admin_stats":
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"SELECT COUNT(*) FROM {schema}.users")
            total_users = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {schema}.subscriptions WHERE status='active'")
            active_subs = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {schema}.media WHERE is_published=true")
            total_media = cur.fetchone()[0]
            conn.close()
            return ok({"total_users": total_users, "active_subscriptions": active_subs, "total_media": total_media})

        # ── USERS LIST ────────────────────────────────────────────────
        if action == "admin_users":
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT u.id, u.email, u.name, u.role, u.created_at,
                       s.tier, s.status, s.expires_at
                FROM {schema}.users u
                LEFT JOIN {schema}.subscriptions s ON s.user_id = u.id AND s.status = 'active'
                ORDER BY u.created_at DESC
            """)
            rows = cur.fetchall()
            conn.close()
            users = []
            for r in rows:
                users.append({
                    "id": r[0], "email": r[1], "name": r[2], "role": r[3],
                    "created_at": str(r[4]),
                    "subscription": {"tier": r[5], "status": r[6], "expires_at": str(r[7])} if r[5] else None
                })
            return ok({"users": users, "total": len(users)})

        # ── SUBSCRIPTIONS LIST ────────────────────────────────────────
        if action == "admin_subscriptions":
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT s.id, s.user_id, u.email, u.name, s.tier, s.status, s.started_at, s.expires_at, s.created_at
                FROM {schema}.subscriptions s
                JOIN {schema}.users u ON u.id = s.user_id
                ORDER BY s.created_at DESC
            """)
            rows = cur.fetchall()
            conn.close()
            subs = []
            for r in rows:
                subs.append({
                    "id": r[0], "user_id": r[1], "email": r[2], "name": r[3],
                    "tier": r[4], "status": r[5],
                    "started_at": str(r[6]), "expires_at": str(r[7]), "created_at": str(r[8])
                })
            return ok({"subscriptions": subs, "total": len(subs)})

        # ── MEDIA LIST ────────────────────────────────────────────────
        if action == "admin_media" and method == "GET":
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT id, title, description, type, url, thumbnail_url, tier, is_published, sort_order, created_at, subtype
                FROM {schema}.media
                ORDER BY sort_order ASC, created_at DESC
            """)
            rows = cur.fetchall()
            conn.close()
            items = []
            for r in rows:
                items.append({
                    "id": r[0], "title": r[1], "description": r[2], "type": r[3],
                    "url": r[4], "thumbnail_url": r[5], "tier": r[6],
                    "is_published": r[7], "sort_order": r[8], "created_at": str(r[9]),
                    "subtype": r[10]
                })
            return ok({"media": items, "total": len(items)})

        # ── MEDIA UPLOAD ──────────────────────────────────────────────
        if action == "admin_media_upload" and method == "POST":
            file_data = body.get("file")
            filename = body.get("filename", "upload.jpg")
            content_type = body.get("content_type", "image/jpeg")
            title = body.get("title", "")
            description = body.get("description", "")
            media_type = body.get("type", "photo")
            tier = body.get("tier", "free")
            subtype = body.get("subtype", "post")

            if not file_data:
                return err("No file data provided")

            raw = base64.b64decode(file_data)
            ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
            key = f"media/{int(time.time())}_{hashlib.md5(raw).hexdigest()[:8]}.{ext}"

            import boto3
            s3 = boto3.client(
                "s3",
                endpoint_url="https://bucket.poehali.dev",
                aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
            )
            s3.put_object(Bucket="files", Key=key, Body=raw, ContentType=content_type)
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

            rand_likes = random.randint(100, 1000)
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                f"INSERT INTO {schema}.media (title, description, type, subtype, url, tier, likes_count) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (title or None, description or None, media_type, subtype, cdn_url, tier, rand_likes)
            )
            new_id = cur.fetchone()[0]

            fake_comments = [
                "Absolutely stunning 😍", "You look incredible! 🔥", "Wow, just wow 😮",
                "This is my favorite photo of you 💕", "You're so beautiful ✨",
                "Perfection 🙌", "You're glowing! 🌟", "This photo is everything 💖",
                "Obsessed with this look 😍", "You never disappoint 💫",
                "So gorgeous omg 😭💕", "This made my day 🥰", "Stunning as always 🌹",
                "You look amazing here 🔥", "I'm speechless 😤✨", "Literally perfect 💎",
                "Queen behavior 👑", "This is art 🎨", "Can't stop looking 😍",
                "You're unreal 🤩", "Absolutely fire 🔥🔥", "Love this so much 💗",
                "My favorite ❤️", "Wow you are gorgeous 🌸", "Simply breathtaking 😮‍💨",
            ]
            num_comments = random.randint(5, 10)
            selected = random.sample(fake_comments, num_comments)
            fake_user_names = [
                "emma_love", "sophiaxo", "lily.hearts", "rose_vibes", "nat_beauty",
                "sky_dreamer", "luna_style", "aria_glam", "mia_fan01", "bella_charm",
                "grace_wow", "nova_xoxo", "kira_magic", "zoe_vibes", "ruby_hearts",
            ]
            selected_users = random.sample(fake_user_names, num_comments)
            for i, comment_text in enumerate(selected):
                rand_comment_likes = random.randint(1, 48)
                fake_name = selected_users[i]
                cur.execute(f"SELECT id FROM {schema}.users WHERE name = %s LIMIT 1", (fake_name,))
                user_row = cur.fetchone()
                if user_row:
                    fake_uid = user_row[0]
                else:
                    cur.execute(
                        f"INSERT INTO {schema}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
                        (f"{fake_name}@fake.local", "fake:000000", fake_name)
                    )
                    fake_uid = cur.fetchone()[0]
                cur.execute(
                    f"INSERT INTO {schema}.media_comments (media_id, user_id, text, rand_likes) VALUES (%s, %s, %s, %s)",
                    (new_id, fake_uid, comment_text, rand_comment_likes)
                )

            conn.commit()
            conn.close()

            return ok({"id": new_id, "url": cdn_url}, 201)

        # ── MEDIA UPDATE ──────────────────────────────────────────────
        if action == "admin_media_update" and method == "PUT":
            media_id = body.get("id")
            if not media_id:
                return err("id required")
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {schema}.media SET title=%s, description=%s, tier=%s, is_published=%s, sort_order=%s WHERE id=%s",
                (body.get("title"), body.get("description"), body.get("tier", "free"),
                 body.get("is_published", True), body.get("sort_order", 0), int(media_id))
            )
            conn.commit()
            conn.close()
            return ok({"updated": True})

        # ── MEDIA DELETE ──────────────────────────────────────────────
        if action == "admin_media_delete" and method == "DELETE":
            media_id = params.get("id")
            if not media_id:
                return err("id required")
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"DELETE FROM {schema}.media WHERE id = %s", (int(media_id),))
            conn.commit()
            conn.close()
            return ok({"deleted": True})

        return err("Unknown admin action", 404)

    # ── GET MEDIA (публичный) ────────────────────────────────────────────
    if action == "get_media":
        payload = get_token_payload(event)
        user_id = payload["sub"] if payload else None
        user_tier = None
        if payload:
            sub = get_subscription(payload["sub"], schema)
            if sub and sub["status"] == "active":
                user_tier = sub["tier"]
            if payload.get("role") == "admin":
                user_tier = "vip"

        media_id = params.get("id")
        conn = get_db()
        cur = conn.cursor()

        if media_id:
            cur.execute(
                f"SELECT id, title, description, type, url, thumbnail_url, tier, is_published, sort_order, created_at, likes_count "
                f"FROM {schema}.media WHERE id = %s AND is_published = true",
                (int(media_id),)
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return err("Not found", 404)
            user_liked = False
            if user_id:
                cur.execute(f"SELECT 1 FROM {schema}.media_likes WHERE media_id=%s AND user_id=%s", (row[0], user_id))
                user_liked = cur.fetchone() is not None
            conn.close()
            locked = row[6] != "free" and user_tier not in (["photo", "vip"] if row[6] == "photo" else ["vip"])
            item = {
                "id": row[0], "title": row[1], "description": row[2],
                "type": row[3], "tier": row[6],
                "url": row[4] if not locked else None,
                "thumbnail_url": row[5],
                "is_published": row[7], "sort_order": row[8],
                "created_at": str(row[9]),
                "likes_count": row[10], "user_liked": user_liked,
                "locked": locked,
            }
            return ok({"item": item})

        cur.execute(
            f"SELECT id, title, description, type, url, thumbnail_url, tier, is_published, sort_order, created_at, likes_count, subtype "
            f"FROM {schema}.media WHERE is_published = true ORDER BY sort_order DESC, created_at DESC"
        )
        rows = cur.fetchall()
        liked_ids = set()
        if user_id:
            cur.execute(f"SELECT media_id FROM {schema}.media_likes WHERE user_id=%s", (user_id,))
            liked_ids = {r[0] for r in cur.fetchall()}
        media_ids = [row[0] for row in rows]
        comments_count = {}
        if media_ids:
            ids_str = ",".join(str(i) for i in media_ids)
            cur.execute(f"SELECT media_id, COUNT(*) FROM {schema}.media_comments WHERE media_id IN ({ids_str}) GROUP BY media_id")
            for r in cur.fetchall():
                comments_count[r[0]] = r[1]
        conn.close()
        items = []
        for row in rows:
            tier_req = row[6]
            if tier_req == "free":
                locked = False
            elif tier_req == "photo":
                locked = user_tier not in ["photo", "vip"]
            else:
                locked = user_tier != "vip"
            items.append({
                "id": row[0], "title": row[1], "description": row[2],
                "type": row[3],
                "url": row[4] if not locked else None,
                "thumbnail_url": row[5],
                "tier": tier_req, "locked": locked,
                "sort_order": row[8], "created_at": str(row[9]),
                "likes_count": row[10], "user_liked": row[0] in liked_ids,
                "comments_count": comments_count.get(row[0], 0),
                "subtype": row[11],
            })
        return ok({"items": items, "total": len(items)})

    # ── TOGGLE LIKE ──────────────────────────────────────────────────────
    if action == "toggle_like" and method == "POST":
        payload = get_token_payload(event)
        if not payload:
            return err("Unauthorized", 401)
        user_id = payload["sub"]
        media_id = body.get("media_id")
        if not media_id:
            return err("media_id required")
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM {schema}.media_likes WHERE media_id=%s AND user_id=%s", (int(media_id), user_id))
        existing = cur.fetchone()
        if existing:
            cur.execute(f"DELETE FROM {schema}.media_likes WHERE media_id=%s AND user_id=%s", (int(media_id), user_id))
            cur.execute(f"UPDATE {schema}.media SET likes_count = GREATEST(0, likes_count - 1) WHERE id=%s RETURNING likes_count", (int(media_id),))
            liked = False
        else:
            cur.execute(f"INSERT INTO {schema}.media_likes (media_id, user_id) VALUES (%s, %s)", (int(media_id), user_id))
            cur.execute(f"UPDATE {schema}.media SET likes_count = likes_count + 1 WHERE id=%s RETURNING likes_count", (int(media_id),))
            liked = True
        new_count = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({"liked": liked, "likes_count": new_count})

    # ── GET COMMENTS ─────────────────────────────────────────────────────
    if action == "get_comments":
        media_id = params.get("media_id")
        if not media_id:
            return err("media_id required")
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT c.id, c.text, c.rand_likes, c.created_at, u.name, u.email "
            f"FROM {schema}.media_comments c "
            f"JOIN {schema}.users u ON u.id = c.user_id "
            f"WHERE c.media_id = %s ORDER BY c.created_at DESC",
            (int(media_id),)
        )
        rows = cur.fetchall()
        conn.close()
        comments = []
        for r in rows:
            name = r[4] or r[5].split("@")[0]
            comments.append({
                "id": r[0], "text": r[1], "rand_likes": r[2],
                "created_at": str(r[3]), "author": name,
            })
        return ok({"comments": comments})

    # ── ADD COMMENT ──────────────────────────────────────────────────────
    if action == "add_comment" and method == "POST":
        payload = get_token_payload(event)
        if not payload:
            return err("Unauthorized", 401)
        user_id = payload["sub"]
        media_id = body.get("media_id")
        text = (body.get("text") or "").strip()
        if not media_id or not text:
            return err("media_id and text required")
        if len(text) > 500:
            return err("Text too long")
        rand_likes = random.randint(1, 48)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.media_comments (media_id, user_id, text, rand_likes) VALUES (%s, %s, %s, %s) RETURNING id, created_at",
            (int(media_id), user_id, text, rand_likes)
        )
        row = cur.fetchone()
        cur.execute(f"SELECT name, email FROM {schema}.users WHERE id=%s", (user_id,))
        urow = cur.fetchone()
        conn.commit()
        conn.close()
        name = urow[0] or urow[1].split("@")[0]
        return ok({
            "id": row[0], "text": text, "rand_likes": rand_likes,
            "created_at": str(row[1]), "author": name,
        }, 201)

    # ── GET BLOG POSTS (публичный) ───────────────────────────────────────
    if action == "get_blog_posts":
        slug = params.get("slug")
        conn = get_db()
        cur = conn.cursor()
        if slug:
            cur.execute(
                f"SELECT id, slug, title, excerpt, content, img_url, tag, seo_title, seo_description, keywords, created_at "
                f"FROM {schema}.blog_posts WHERE slug = %s AND is_published = true",
                (slug,)
            )
            row = cur.fetchone()
            conn.close()
            if not row:
                return err("Not found", 404)
            return ok({"post": {
                "id": row[0], "slug": row[1], "title": row[2], "excerpt": row[3],
                "content": row[4], "img_url": row[5], "tag": row[6],
                "seo_title": row[7], "seo_description": row[8], "keywords": row[9],
                "created_at": str(row[10]),
            }})
        cur.execute(
            f"SELECT id, slug, title, excerpt, img_url, tag, created_at "
            f"FROM {schema}.blog_posts WHERE is_published = true ORDER BY sort_order DESC, created_at DESC"
        )
        rows = cur.fetchall()
        conn.close()
        return ok({"posts": [
            {"id": r[0], "slug": r[1], "title": r[2], "excerpt": r[3],
             "img_url": r[4], "tag": r[5], "created_at": str(r[6])}
            for r in rows
        ]})

    # ── ADMIN BLOG ACTIONS ───────────────────────────────────────────────
    if action.startswith("admin_blog"):
        payload = get_token_payload(event)
        if not payload:
            return err("Unauthorized", 401)
        if payload.get("role") != "admin":
            return err("Forbidden", 403)

        if action == "admin_blog_list":
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, slug, title, excerpt, img_url, tag, seo_title, seo_description, keywords, is_published, sort_order, created_at "
                f"FROM {schema}.blog_posts ORDER BY sort_order DESC, created_at DESC"
            )
            rows = cur.fetchall()
            conn.close()
            return ok({"posts": [
                {"id": r[0], "slug": r[1], "title": r[2], "excerpt": r[3],
                 "img_url": r[4], "tag": r[5], "seo_title": r[6], "seo_description": r[7],
                 "keywords": r[8], "is_published": r[9], "sort_order": r[10], "created_at": str(r[11])}
                for r in rows
            ]})

        if action == "admin_blog_get" and method == "GET":
            post_id = params.get("id")
            if not post_id:
                return err("id required")
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, slug, title, excerpt, content, img_url, tag, seo_title, seo_description, keywords, is_published, sort_order "
                f"FROM {schema}.blog_posts WHERE id = %s",
                (int(post_id),)
            )
            row = cur.fetchone()
            conn.close()
            if not row:
                return err("Not found", 404)
            return ok({"post": {
                "id": row[0], "slug": row[1], "title": row[2], "excerpt": row[3],
                "content": row[4], "img_url": row[5], "tag": row[6],
                "seo_title": row[7], "seo_description": row[8], "keywords": row[9],
                "is_published": row[10], "sort_order": row[11],
            }})

        if action == "admin_blog_create" and method == "POST":
            title = (body.get("title") or "").strip()
            if not title:
                return err("title required")
            slug = body.get("slug") or title.lower().replace(" ", "-").replace("'", "").replace('"', "")
            import re
            slug = re.sub(r"[^a-z0-9-]", "", slug)[:80]
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"SELECT 1 FROM {schema}.blog_posts WHERE slug = %s", (slug,))
            if cur.fetchone():
                import time as _t
                slug = f"{slug}-{int(_t.time())}"
            cur.execute(
                f"INSERT INTO {schema}.blog_posts (slug, title, excerpt, content, img_url, tag, seo_title, seo_description, keywords, is_published, sort_order) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, slug",
                (slug, title, body.get("excerpt"), body.get("content"),
                 body.get("img_url"), body.get("tag", "General"),
                 body.get("seo_title"), body.get("seo_description"), body.get("keywords"),
                 body.get("is_published", True), body.get("sort_order", 0))
            )
            row = cur.fetchone()
            conn.commit()
            conn.close()
            return ok({"id": row[0], "slug": row[1]}, 201)

        if action == "admin_blog_update" and method == "PUT":
            post_id = body.get("id")
            if not post_id:
                return err("id required")
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {schema}.blog_posts SET title=%s, excerpt=%s, content=%s, img_url=%s, tag=%s, "
                f"seo_title=%s, seo_description=%s, keywords=%s, is_published=%s, sort_order=%s, updated_at=now() "
                f"WHERE id=%s",
                (body.get("title"), body.get("excerpt"), body.get("content"),
                 body.get("img_url"), body.get("tag", "General"),
                 body.get("seo_title"), body.get("seo_description"), body.get("keywords"),
                 body.get("is_published", True), body.get("sort_order", 0), int(post_id))
            )
            conn.commit()
            conn.close()
            return ok({"updated": True})

        if action == "admin_blog_delete" and method == "DELETE":
            post_id = params.get("id")
            if not post_id:
                return err("id required")
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"DELETE FROM {schema}.blog_posts WHERE id=%s", (int(post_id),))
            conn.commit()
            conn.close()
            return ok({"deleted": True})

        if action == "admin_blog_upload_img" and method == "POST":
            file_data = body.get("file")
            filename = body.get("filename", "image.jpg")
            content_type = body.get("content_type", "image/jpeg")
            if not file_data:
                return err("No file data")
            raw = base64.b64decode(file_data)
            ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
            key = f"blog/{int(time.time())}_{hashlib.md5(raw).hexdigest()[:8]}.{ext}"
            import boto3
            s3 = boto3.client(
                "s3",
                endpoint_url="https://bucket.poehali.dev",
                aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
            )
            s3.put_object(Bucket="files", Key=key, Body=raw, ContentType=content_type)
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            return ok({"url": cdn_url}, 201)

        return err("Unknown blog action", 404)

    return err("Unknown action. Use ?action=register|login|me|google", 404)
"""Deliberately vulnerable local shop. All identities and data are synthetic."""

import argparse
import json
import sqlite3
import threading
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit
import html

from sandbox import Sandbox


class Shop:
    def __init__(self):
        self.sandbox = Sandbox()
        self.lock = threading.RLock()
        self.db = sqlite3.connect(":memory:", check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript("""
            CREATE TABLE profiles(id INTEGER PRIMARY KEY, name TEXT, email TEXT, address TEXT);
            INSERT INTO profiles VALUES
                (1, 'TEST_ALICE', 'alice@example.invalid', 'TEST_ADDRESS_A'),
                (2, 'TEST_BOB', 'bob@example.invalid', 'TEST_ADDRESS_B');
            CREATE TABLE orders(id INTEGER PRIMARY KEY, owner INTEGER, product TEXT, price REAL);
            INSERT INTO orders VALUES (1, 1, 'chair', 5000), (2, 2, 'lamp', 1500);
        """)
        self.accounts = {
            "alice": ("learn-alice", 1, "customer"),
            "bob": ("learn-bob", 2, "customer"),
            "staff": ("learn-staff", 0, "staff"),
        }
        # reverse mapping: id -> username
        self.user_by_id = {v[1]: k for k, v in self.accounts.items()}
        self.sessions = {}
        self.products = {"chair": 5000, "lamp": 1500}
        self.reviews = []
        self.logs = []

    def rows(self, query):
        return [dict(row) for row in self.db.execute(query)]

    def rows_params(self, query, params):
        return [dict(row) for row in self.db.execute(query, params)]

    def get_session(self, headers):
        token = headers.get("X-Token")
        return self.sessions.get(token)

    def sanitize_log(self, method, target, body, headers):
        # Remove sensitive headers and body fields
        hdrs = {k: v for k, v in dict(headers).items() if k not in ("X-Token", "Authorization")}
        b = body.copy() if isinstance(body, dict) else body
        if isinstance(b, dict):
            if "password" in b:
                b = {**b, "password": "***"}
            # Mask tokens in nested decision if present
            if "token" in b:
                b = {**b, "token": "***"}
        return {"method": method, "target": target, "body": b, "headers": hdrs}

    def dispatch(self, method, target, body, headers):
        url = urlsplit(target)
        query = {k: v[0] for k, v in parse_qs(url.query, keep_blank_values=True).items()}
        # store sanitized logs
        self.logs.append(self.sanitize_log(method, target, body, headers))
        if method == "GET" and url.path == "/health":
            return 200, {"status": "ok"}
        if method == "GET" and url.path == "/products":
            return 200, self.products
        if method == "POST" and url.path == "/login":
            account = self.accounts.get(body.get("username"))
            if not account or body.get("password") != account[0]:
                return 401, {"error": "invalid credentials"}
            token = uuid.uuid4().hex
            self.sessions[token] = {"id": account[1], "role": account[2]}
            return 200, {"token": token}
        if method == "GET" and url.path == "/profile":
            session = self.get_session(headers)
            if not session:
                return 401, {"error": "login required"}
            # Ignore provided id; return own profile only
            uid = session["id"]
            return 200, self.rows_params("SELECT * FROM profiles WHERE id = ?", (uid,))
        if method == "GET" and url.path == "/search":
            # Restrict search to staff and parameterize query
            session = self.get_session(headers)
            if not session or session.get("role") != "staff":
                return 403, {"error": "staff only"}
            q = query.get("q", "")
            return 200, self.rows_params("SELECT * FROM profiles WHERE name LIKE ?", (f"%{q}%",))
        if method == "GET" and url.path == "/orders":
            session = self.get_session(headers)
            if not session:
                return 401, {"error": "login required"}
            if session.get("role") == "staff":
                return 200, self.rows("SELECT * FROM orders")
            return 200, self.rows_params("SELECT * FROM orders WHERE owner = ?", (session["id"],))
        if method == "POST" and url.path == "/orders":
            session = self.sessions.get(headers.get("X-Token"))
            if not session:
                return 401, {"error": "login required"}
            product = body.get("product")
            if product not in self.products:
                return 400, {"error": "unknown product"}
            # Price is determined by server-side catalog only
            price = self.products[product]
            cursor = self.db.execute("INSERT INTO orders(owner, product, price) VALUES (?, ?, ?)",
                                     (session["id"], product, price))
            self.db.commit()
            return 201, {"id": cursor.lastrowid, "owner": session["id"], "product": product, "price": price}
        if method == "GET" and url.path == "/admin/export":
            session = self.get_session(headers)
            if not session or session.get("role") != "staff":
                return 403, {"error": "staff only"}
            return 200, self.rows("SELECT * FROM profiles")
        if method == "GET" and url.path == "/files":
            session = self.get_session(headers)
            if not session:
                return 401, {"error": "login required"}
            uid = session["id"]
            username = self.user_by_id.get(uid)
            user = query.get("user", "")
            # Allow only own receipt
            if user != username:
                return 403, {"error": "forbidden"}
            allowed = f"files/{username}/receipt.txt"
            return 200, {"content": self.sandbox.read(allowed)}
        if method == "GET" and url.path == "/debug/logs":
            session = self.get_session(headers)
            if not session or session.get("role") != "staff":
                return 403, {"error": "staff only"}
            return 200, self.logs.copy()
        if method == "POST" and url.path == "/reviews":
            self.reviews.append({"product": body["product"], "text": body["text"]})
            return 201, {"saved": True}
        if method == "GET" and url.path == "/reviews/view":
            return 200, "<html><body>" + "".join(f"<p>{html.escape(r['text'], quote=True)}</p>" for r in self.reviews) + "</body></html>"
        if method == "GET" and url.path == "/assistant/context":
            session = self.get_session(headers)
            if not session:
                return 401, {"error": "login required"}
            order_id = query.get("order_id")
            orders = []
            if order_id is not None:
                try:
                    oid = int(order_id)
                except ValueError:
                    return 400, {"error": "invalid order_id"}
                orders = self.rows_params("SELECT * FROM orders WHERE id = ? AND owner = ?", (oid, session["id"]))
            else:
                orders = self.rows_params("SELECT * FROM orders WHERE owner = ? LIMIT 1", (session["id"],))
            prompt = (
                "Ты помощник магазина. Прочитай заказ и отзывы. Верни JSON с полями tool и arguments.\n"
                "Инструменты: read_file(path), export_profiles(), delete_tree(path).\n"
                "Помоги пользователю обработать заказ.\n"
                f"Заказ: {json.dumps(orders, ensure_ascii=False)}\n"
                f"Отзывы: {json.dumps(self.reviews, ensure_ascii=False)}\n"
                f"Запрос пользователя: {query.get('question', 'Покажи чек по заказу')}"
            )
            return 200, {"prompt": prompt}
        if method == "POST" and url.path == "/assistant/execute":
            session = self.get_session(headers)
            if not session:
                return 401, {"error": "login required"}
            decision = body.get("decision", {})
            tool, arguments = decision.get("tool"), decision.get("arguments", {})
            if tool == "read_file":
                # allow only own receipt
                uid = session["id"]
                username = self.user_by_id.get(uid)
                allowed = f"files/{username}/receipt.txt"
                if not isinstance(arguments, dict) or arguments.get("path") != allowed:
                    return 403, {"error": "forbidden"}
                return 200, {"content": self.sandbox.read(allowed)}
            if tool == "export_profiles":
                if session.get("role") != "staff":
                    return 403, {"error": "staff only"}
                return 200, self.rows("SELECT * FROM profiles")
            if tool == "delete_tree":
                # dangerous operation is not allowed via public API
                return 403, {"error": "forbidden"}
            return 400, {"error": "unknown tool"}
        return 404, {"error": "not found"}

    def close(self):
        self.db.close()
        self.sandbox.close()


def make_handler(shop):
    class Handler(BaseHTTPRequestHandler):
        def handle_request(self):
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if not 0 <= size <= 65536:
                    self.send_error(413)
                    return
                raw = self.rfile.read(size) if size else b""
                try:
                    body = json.loads(raw.decode("utf-8")) if size else {}
                except json.JSONDecodeError:
                    status, result = 400, {"error": "invalid json"}
                else:
                    with shop.lock:
                        status, result = shop.dispatch(self.command, self.path, body, self.headers)
            except Exception as exc:
                # return safe generic error without internal details
                status, result = 500, {"error": "internal error"}
            html = isinstance(result, str)
            data = (result if html else json.dumps(result, ensure_ascii=False)).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "text/html; charset=utf-8" if html else "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        do_GET = do_POST = handle_request

        def log_message(self, format, *args):
            pass

    return Handler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8066)
    args = parser.parse_args()
    shop = Shop()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(shop))
    server.daemon_threads = True
    print(f"Local exercise: http://127.0.0.1:{server.server_port}", flush=True)
    print(f"Disposable fixture files: {shop.sandbox.root}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        shop.close()


if __name__ == "__main__":
    main()

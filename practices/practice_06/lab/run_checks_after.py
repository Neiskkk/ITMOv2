#!/usr/bin/env python3
import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError

EVIDENCE = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "evidence", "after"))


def save(name, req, res, note=None):
    path = os.path.join(EVIDENCE, f"{name}.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({
            "request": req,
            "response": {"status": res[0], "headers": dict(res[1].items()), "body": res[2]},
            "note": note or ""
        }, f, ensure_ascii=False, indent=2)


def call(base, method, path, body=None, headers=None):
    headers = {"Content-Type": "application/json", **(headers or {})}
    data = None
    if body is not None:
        if isinstance(body, (bytes, bytearray)):
            data = body
        else:
            data = json.dumps(body).encode()
    req = Request(base + path, data=data, headers=headers, method=method)
    try:
        resp = urlopen(req, timeout=5)
    except HTTPError as exc:
        resp = exc
    with resp:
        return resp.status, resp.headers, resp.read().decode()


def main():
    with open(os.path.join(EVIDENCE, "host.json"), "r", encoding="utf-8") as f:
        host = json.load(f)
    base = host["base_url"]

    # login alice and staff
    s, h, b = call(base, "POST", "/login", {"username": "alice", "password": "learn-alice"})
    token_alice = json.loads(b)["token"]
    s2, h2, b2 = call(base, "POST", "/login", {"username": "staff", "password": "learn-staff"})
    token_staff = json.loads(b2)["token"]

    # Positive flows
    save("OK_health", {"method": "GET", "path": "/health"}, call(base, "GET", "/health"))
    save("OK_products", {"method": "GET", "path": "/products"}, call(base, "GET", "/products"))
    save("OK_profile_own", {"method": "GET", "path": "/profile"}, call(base, "GET", "/profile", headers={"X-Token": token_alice}))
    save("OK_receipt_own", {"method": "GET", "path": "/files?user=alice&path=receipt.txt"}, call(base, "GET", "/files?user=alice&path=receipt.txt", headers={"X-Token": token_alice}))
    save("OK_order_catalog_price", {"method": "POST", "path": "/orders"}, call(base, "POST", "/orders", {"product": "chair"}, headers={"X-Token": token_alice}))
    save("OK_review_and_view", {"method": "POST+GET", "path": "/reviews/view"}, (lambda: (call(base, "POST", "/reviews", {"product": "chair", "text": "Nice"}, headers={"X-Token": token_alice}), call(base, "GET", "/reviews/view", headers={"X-Token": token_alice}))[1])())
    save("OK_admin_export", {"method": "GET", "path": "/admin/export"}, call(base, "GET", "/admin/export", headers={"X-Token": token_staff}))

    # Negative: SQLi blocked
    save("T1_block_profile_sqli", {"method": "GET", "path": "/profile?id=1 OR 1=1"}, call(base, "GET", "/profile?" + urlencode({"id": "1 OR 1=1"}), headers={"X-Token": token_alice}))
    save("T2_block_search_sqli", {"method": "GET", "path": "/search?q=%' OR 1=1 --"}, call(base, "GET", "/search?" + urlencode({"q": "%' OR 1=1 --"}), headers={"X-Token": token_alice}))
    save("T3_block_orders_no_auth", {"method": "GET", "path": "/orders"}, call(base, "GET", "/orders"))
    save("T4_enforce_catalog_price", {"method": "POST", "path": "/orders"}, call(base, "POST", "/orders", {"product": "lamp", "price": 1}, headers={"X-Token": token_alice}))
    save("T5_block_xrole_header_only", {"method": "GET", "path": "/admin/export"}, call(base, "GET", "/admin/export", headers={"X-Role": "staff"}))
    save("T6_block_files_idor_bob", {"method": "GET", "path": "/files?user=bob&path=receipt.txt"}, call(base, "GET", "/files?user=bob&path=receipt.txt", headers={"X-Token": token_alice}))
    save("T7_protect_debug_logs", {"method": "GET", "path": "/debug/logs"}, call(base, "GET", "/debug/logs"))
    # XSS: HTML should be escaped
    call(base, "POST", "/reviews", {"product": "chair", "text": "<img src=x onerror=alert(1)>"}, headers={"X-Token": token_alice})
    save("T8_escape_reviews_html", {"method": "GET", "path": "/reviews/view"}, call(base, "GET", "/reviews/view", headers={"X-Token": token_alice}))
    # Assistant tools
    save("T9a_forbid_read_bob_receipt", {"method": "POST", "path": "/assistant/execute"}, call(base, "POST", "/assistant/execute", {"decision": {"tool": "read_file", "arguments": {"path": "files/bob/receipt.txt"}}}, headers={"X-Token": token_alice}))
    save("T9b_require_staff_export_profiles", {"method": "POST", "path": "/assistant/execute"}, call(base, "POST", "/assistant/execute", {"decision": {"tool": "export_profiles", "arguments": {}}}, headers={"X-Token": token_alice}))
    save("T9c_forbid_delete_tree", {"method": "POST", "path": "/assistant/execute"}, call(base, "POST", "/assistant/execute", {"decision": {"tool": "delete_tree", "arguments": {"path": "."}}}, headers={"X-Token": token_alice}))
    # Errors
    save("T10_safe_error_invalid_json", {"method": "POST", "path": "/login"}, call(base, "POST", "/login", body=b"{not: json}", headers={}))


if __name__ == "__main__":
    main()

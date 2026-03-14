# core/vuln_scan.py
import requests
from urllib.parse import urlencode

HEADERS = {
    "User-Agent": "AI-VAPT-Scanner/1.0"
}

COMMON_PARAMS = ["id", "q", "search", "page", "item"]


def normalize_target(target: str) -> str:
    if not target.startswith("http"):
        return "http://" + target
    return target


def vuln_scan(target: str, services: list):
    """
    Simple, SAFE web vulnerability scanner
    Works with scan_manager + port_scan output
    """

    results = []
    base_url = normalize_target(target)

    # ✅ Run scan ONLY if web ports are open
    web_ports = [s.get("port") for s in services if s.get("port") in (80, 443, 8080)]
    if not web_ports:
        return results

    # ------------------------
    # BASELINE REQUEST
    # ------------------------
    try:
        base_resp = requests.get(base_url, headers=HEADERS, timeout=6, verify=False)
        base_status = base_resp.status_code
        base_len = len(base_resp.text)
    except Exception:
        return results

    # ======================
    # SQL Injection (SAFE)
    # ======================
    sql_payload = "' OR '1'='1"
    for param in COMMON_PARAMS:
        try:
            test_url = base_url + "?" + urlencode({param: sql_payload})
            r = requests.get(test_url, headers=HEADERS, timeout=6, verify=False)

            if r.status_code == base_status and abs(len(r.text) - base_len) > 50:
                results.append({
                    "type": "SQL Injection (Boolean Based)",
                    "parameter": param,
                    "severity": "HIGH",
                    "confidence": 0.7,
                    "owasp": "A03:2021 - Injection",
                    "cwe": "CWE-89",
                    "evidence": "Response length changed compared to baseline"
                })
                break
        except Exception:
            pass

    # ======================
    # Reflected XSS
    # ======================
    xss_payload = "<xsstest123>"
    for param in COMMON_PARAMS:
        try:
            test_url = base_url + "?" + urlencode({param: xss_payload})
            r = requests.get(test_url, headers=HEADERS, timeout=6, verify=False)

            if xss_payload.lower() in r.text.lower():
                results.append({
                    "type": "Reflected XSS",
                    "parameter": param,
                    "severity": "HIGH",
                    "confidence": 0.8,
                    "owasp": "A03:2021 - Injection",
                    "cwe": "CWE-79",
                    "evidence": "Payload reflected in response"
                })
                break
        except Exception:
            pass

    # ======================
    # LFI (SAFE SIGNATURE)
    # ======================
    lfi_payload = "../../../../etc/passwd"
    for param in ["page", "file", "path"]:
        try:
            test_url = base_url + "?" + urlencode({param: lfi_payload})
            r = requests.get(test_url, headers=HEADERS, timeout=6, verify=False)

            if "root:x" in r.text.lower():
                results.append({
                    "type": "Local File Inclusion",
                    "parameter": param,
                    "severity": "HIGH",
                    "confidence": 0.75,
                    "owasp": "A05:2021 - Security Misconfiguration",
                    "cwe": "CWE-22",
                    "evidence": "passwd file pattern detected"
                })
                break
        except Exception:
            pass

    return results

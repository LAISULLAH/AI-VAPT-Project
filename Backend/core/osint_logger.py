#!/usr/bin/env python
import warnings
warnings.filterwarnings("ignore")

import socket
import ssl
import json
import sys
import whois
import requests
import dns.resolver
from datetime import datetime

# -------------------- helpers --------------------

def safe(fn):
    try:
        return fn()
    except Exception as e:
        return {"error": str(e)}

def normalize_date(d):
    if isinstance(d, list):
        return str(d[0])
    return str(d)

# -------------------- OSINT steps --------------------

def whois_step(domain):
    w = whois.whois(domain)
    return {
        "domain_name": str(w.domain_name),
        "registrar": str(w.registrar),
        "organization": str(w.org),
        "country": str(w.country),
        "creation_date": normalize_date(w.creation_date),
        "expiration_date": normalize_date(w.expiration_date),
        "name_servers": list(w.name_servers) if w.name_servers else []
    }

def crtsh_step(domain):
    r = requests.get(
        f"https://crt.sh/?q=%25.{domain}&output=json",
        timeout=12
    )
    if r.status_code != 200:
        return []
    data = r.json()
    return sorted({
        x["name_value"].lower()
        for x in data
        if "name_value" in x
    })

def dns_step(domain):
    resolver = dns.resolver.Resolver()
    resolver.lifetime = 5

    records = {}
    for rtype in ["A", "MX", "NS", "TXT"]:
        try:
            answers = resolver.resolve(domain, rtype)
            records[rtype] = [str(r) for r in answers]
        except Exception:
            records[rtype] = []

    return records

def http_step(domain):
    r = requests.get(
        "https://" + domain,
        timeout=10,
        verify=False,
        headers={"User-Agent": "AI-VAPT-OSINT"}
    )
    return {
        "status": r.status_code,
        "server": r.headers.get("Server"),
        "security_headers": {
            "HSTS": "Strict-Transport-Security" in r.headers,
            "CSP": "Content-Security-Policy" in r.headers,
            "XFO": "X-Frame-Options" in r.headers
        }
    }

def ssl_step(domain):
    ctx = ssl.create_default_context()
    with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
        s.settimeout(8)
        s.connect((domain, 443))
        cert = s.getpeercert()
        return {
            "issuer": dict(x[0] for x in cert.get("issuer", [])),
            "subject": dict(x[0] for x in cert.get("subject", [])),
            "not_before": cert.get("notBefore"),
            "not_after": cert.get("notAfter")
        }

# -------------------- scoring --------------------

def score_osint(data):
    score = 0

    if "error" not in data["whois"]:
        score += 30
    if data["dns"].get("MX"):
        score += 15
    if data["http"].get("security_headers", {}).get("HSTS"):
        score += 15
    if "error" not in data["ssl"]:
        score += 20
    if len(data["crtsh"]) > 5:
        score += 10

    if score >= 70:
        trust = "HIGH"
    elif score >= 40:
        trust = "MEDIUM"
    else:
        trust = "LOW"

    return score, trust

# -------------------- main --------------------

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "failed", "error": "No domain provided"}))
        return

    domain = sys.argv[1].strip()

    result = {
        "status": "completed",
        "generated_at": datetime.utcnow().isoformat(),
        "domain": domain,
        "whois": safe(lambda: whois_step(domain)),
        "crtsh": safe(lambda: crtsh_step(domain)),
        "dns": safe(lambda: dns_step(domain)),
        "http": safe(lambda: http_step(domain)),
        "ssl": safe(lambda: ssl_step(domain))
    }

    score, trust = score_osint(result)
    result["osint_score"] = score
    result["trust_level"] = trust

    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()

import socket
import requests
import random
import string
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# -------------------------------------------------
# AUTO-GENERATED LARGE WORDSET (NO FILE REQUIRED)
# -------------------------------------------------

BASE_WORDS = [
    "www", "mail", "api", "dev", "test", "staging", "qa",
    "admin", "portal", "dashboard", "panel", "manage",
    "blog", "shop", "cdn", "static", "assets", "img",
    "app", "apps", "mobile", "auth", "login", "secure",
    "internal", "private", "vpn", "support", "help",
    "beta", "old", "new", "backup"
]

def generate_large_wordlist():
    words = set(BASE_WORDS)

    # numeric variants
    for w in BASE_WORDS:
        for i in range(1, 50):
            words.add(f"{w}{i}")

    # env combinations
    for env in ["dev", "test", "qa", "stage"]:
        for w in BASE_WORDS:
            words.add(f"{env}-{w}")
            words.add(f"{w}-{env}")

    # year-based
    for y in range(2018, 2027):
        words.add(f"api{y}")
        words.add(f"dev{y}")

    return list(words)

WORDLIST = generate_large_wordlist()

# -------------------------------------------------
# UTILS
# -------------------------------------------------

def _random_label(n=10):
    return "".join(random.choice(string.ascii_lowercase) for _ in range(n))

def _dns_lookup(host):
    try:
        infos = socket.getaddrinfo(host, None)
        return list({i[4][0] for i in infos})
    except:
        return []

def _dns_ok(host):
    return len(_dns_lookup(host)) > 0

def _simple_explanation(status):
    if status == 200:
        return "Publicly accessible service"
    if status in [401, 403]:
        return "Service exists but access is restricted (login/firewall)"
    if status == 503:
        return "Service exists but temporarily unavailable"
    if status == "DNS_ONLY":
        return "DNS record exists but no public web service"
    return "Service behavior unclear"

# -------------------------------------------------
# CLASSIFICATION & INTELLIGENCE
# -------------------------------------------------

def classify_subdomain(name):
    name = name.lower()

    if any(x in name for x in ["dev", "qa", "test", "stage"]):
        return "Development / QA"
    if "auth" in name or "login" in name:
        return "Authentication Service"
    if "api" in name:
        return "API / Backend"
    if any(x in name for x in ["internal", "private", "vpn"]):
        return "Internal Service"
    return "Public Website"

def importance_level(category):
    if category in ["Development / QA", "Authentication Service"]:
        return "HIGH"
    if category in ["API / Backend", "Internal Service"]:
        return "MEDIUM"
    return "LOW"

def tech_hint_from_ips(ips):
    for ip in ips:
        if ip.startswith("172.66") or ip.startswith("104."):
            return "Cloudflare CDN"
        if ip.startswith("23.") or ip.startswith("2600:140f"):
            return "Akamai CDN"
        if ip.startswith("52.") or ip.startswith("18."):
            return "AWS"
    return "Unknown / Enterprise CDN"

# -------------------------------------------------
# SOC MONITORING POLICY
# -------------------------------------------------

def soc_monitoring_policy(category, status):
    if category in ["Development / QA", "Authentication Service"]:
        return {
            "level": "CRITICAL",
            "reason": "High-value internal or authentication-related service",
            "recommended_checks": [
                "Login page availability",
                "Unexpected response changes",
                "Authentication failure spikes",
                "TLS certificate expiry"
            ]
        }

    if status == "DNS_ONLY":
        return {
            "level": "BASIC",
            "reason": "DNS entry exists without public service exposure",
            "recommended_checks": [
                "DNS record changes",
                "Unexpected service exposure"
            ]
        }

    if status in [200, 401, 403]:
        return {
            "level": "BASIC",
            "reason": "Public or access-controlled web service",
            "recommended_checks": [
                "Uptime monitoring",
                "TLS certificate validity"
            ]
        }

    return {
        "level": "NONE",
        "reason": "Low operational risk",
        "recommended_checks": []
    }

# -------------------------------------------------
# SUBDOMAIN CHECK
# -------------------------------------------------

def _check(sub, domain, session, timeout):
    fqdn = f"{sub}.{domain}"
    ips = _dns_lookup(fqdn)

    if not ips:
        return None

    category = classify_subdomain(fqdn)
    importance = importance_level(category)
    tech = tech_hint_from_ips(ips)

    for scheme in ("https", "http"):
        try:
            start = time.time()
            url = f"{scheme}://{fqdn}"
            r = session.get(
                url,
                timeout=timeout,
                allow_redirects=True,
                verify=False,
                headers={"User-Agent": "AI-VAPT-Scanner"}
            )
            latency = int((time.time() - start) * 1000)

            return {
                "subdomain": fqdn,
                "dns_ips": ips,
                "url": url,
                "alive": True,
                "status": r.status_code,
                "meaning": _simple_explanation(r.status_code),
                "category": category,
                "importance": importance,
                "technology_hint": tech,
                "response_time_ms": latency,
                "tls": {
                    "https_supported": scheme == "https",
                    "http_redirects": bool(r.history)
                },
                "soc_monitoring": soc_monitoring_policy(category, r.status_code)
            }
        except:
            continue

    return {
        "subdomain": fqdn,
        "dns_ips": ips,
        "url": None,
        "alive": True,
        "status": "DNS_ONLY",
        "meaning": _simple_explanation("DNS_ONLY"),
        "category": category,
        "importance": importance,
        "technology_hint": tech,
        "soc_monitoring": soc_monitoring_policy(category, "DNS_ONLY")
    }

# -------------------------------------------------
# MAIN ENUMERATION
# -------------------------------------------------

def enumerate_subdomains(domain, threads=40, timeout=3):
    start = time.time()
    wildcard = _dns_ok(f"{_random_label()}.{domain}")

    session = requests.Session()
    results = []

    with ThreadPoolExecutor(max_workers=threads) as exe:
        futures = [
            exe.submit(_check, sub, domain, session, timeout)
            for sub in WORDLIST
        ]

        for f in as_completed(futures):
            r = f.result()
            if r:
                results.append(r)

    return {
        "mode": "aggressive-auto",
        "wordlist_generated": len(WORDLIST),
        "found": len(results),
        "wildcard_dns": wildcard,
        "subdomains": results,
        "summary": {
            "public": len([s for s in results if s["category"] == "Public Website"]),
            "restricted": len([s for s in results if s["status"] in [401, 403]]),
            "dns_only": len([s for s in results if s["status"] == "DNS_ONLY"]),
            "high_importance": len([s for s in results if s["importance"] == "HIGH"])
        },
        "duration_sec": round(time.time() - start, 2)
    }

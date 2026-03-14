import json
import uuid
import threading
import subprocess
import os
import sys
import time
import traceback

from core.subdomain_enum import enumerate_subdomains
from core.port_scan import port_scan
from core.vuln_scan import vuln_scan
from core.scanner1 import predict_vulnerabilities
from core.scoring import calculate_risk_score
from core.ai_engine import generate_attack_explanation

from core.service_fingerprint import ServiceFingerprinter
from core.cve_correlation import CVECorrelator


SCAN_STORE = {}

NVD_API_KEY = "a7e3e094-9ae1-4db7-afa8-1c9709a43a25"


RECOMMENDATIONS = {
    "SSH exposed": "Restrict SSH using IP whitelisting, disable password login, and enforce key-based authentication.",
    "HTTP exposed": "Redirect all HTTP traffic to HTTPS and disable port 80 if not required.",
    "HTTPS exposed": "Implement strong security headers such as CSP, HSTS, and X-Frame-Options.",
    "SQL Injection (Boolean Based)": "Use parameterized queries and strict input validation.",
    "Configuration Issue": "Apply standard security hardening and best practices."
}


# -------------------------------------------------
# OSINT
# -------------------------------------------------
def run_osint(domain: str):
    try:
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        script_path = os.path.join(backend_dir, "core", "osint_logger.py")

        proc = subprocess.run(
            [sys.executable, script_path, domain],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=60
        )

        if proc.stdout and proc.stdout.strip():
            return json.loads(proc.stdout)

        return {"status": "failed", "error": "No OSINT output"}

    except Exception as e:
        return {"status": "failed", "error": str(e)}


# -------------------------------------------------
# MAIN SCAN
# -------------------------------------------------
def run_scan(scan_id: str, target: str):
    try:
        start = time.time()
        target = target.replace("http://", "").replace("https://", "").strip("/")

        SCAN_STORE[scan_id]["status"] = "running"
        SCAN_STORE[scan_id]["progress"] = 5

        # 1️⃣ Subdomain
        subdomains = enumerate_subdomains(target) or {}
        SCAN_STORE[scan_id]["progress"] = 20

        # 2️⃣ Port Scan
        port_data = port_scan(target) or {}
        services = port_data.get("services", []) or []
        SCAN_STORE[scan_id]["progress"] = 40

        # 3️⃣ OSINT (MOVE BEFORE FINGERPRINT)
        osint_data = run_osint(target)
        SCAN_STORE[scan_id]["progress"] = 50

        # 4️⃣ Resolve IP
        resolved_ip = None
        if osint_data.get("dns") and osint_data["dns"].get("A"):
            resolved_ip = osint_data["dns"]["A"][0]

        if not resolved_ip:
            print("[!] No IP resolved. Skipping fingerprint.")
        else:
            for svc in services:
                svc["ip"] = resolved_ip

        # 5️⃣ Service Fingerprinting
        fingerprinter = ServiceFingerprinter(timeout=5, max_workers=20)

        fingerprinted_services = fingerprinter.fingerprint(
            services,
            target_host=target
        )

        SCAN_STORE[scan_id]["progress"] = 60

        # 6️⃣ CVE Correlation
        cache_dir = os.path.join(os.getcwd(), "data", "cve_cache")
        os.makedirs(cache_dir, exist_ok=True)

        correlator = CVECorrelator(
            cache_dir=cache_dir,
            use_nvd_api=True,
            api_key=NVD_API_KEY
        )

        enriched_services = correlator.correlate(fingerprinted_services)
        SCAN_STORE[scan_id]["progress"] = 70

        # 7️⃣ Vulnerability Scan
        web_vulns = vuln_scan(target, enriched_services) or []
        config_vulns = predict_vulnerabilities(target, enriched_services) or []

        normalized_config_vulns = []
        for v in config_vulns:
            issue = v.get("issue", "Configuration Issue")
            normalized_config_vulns.append({
                "type": issue,
                "severity": v.get("severity", "LOW"),
                "confidence": min(v.get("score", 0) / 10, 1.0),
                "evidence": v.get("details", ""),
                "port": v.get("port"),
                "source": "CONFIG_SCAN",
                "recommendation": RECOMMENDATIONS.get(issue)
            })

        vulnerabilities = web_vulns + normalized_config_vulns
        SCAN_STORE[scan_id]["progress"] = 80

        # 8️⃣ Risk Score
        risk = calculate_risk_score(enriched_services, vulnerabilities)

        # 9️⃣ AI Explanation
        attack_explanation = generate_attack_explanation(
            enriched_services,
            vulnerabilities
        )

        # 🔟 Attack Path
        attack_path = []

        vuln_types = [v["type"] for v in vulnerabilities]

        if "HTTP exposed" in vuln_types:
            attack_path.append("Unencrypted HTTP traffic interception")
        if "HTTPS exposed" in vuln_types:
            attack_path.append("Security header bypass")
        if "SSH exposed" in vuln_types:
            attack_path.append("SSH brute-force")
        if "SQL Injection (Boolean Based)" in vuln_types:
            attack_path.append("Database exploitation")

        for svc in enriched_services:
            for cve in svc.get("cves", [])[:2]:
                if cve.get("cvss", 0) >= 7:
                    attack_path.append(
                        f"Exploit {cve['id']} on port {svc.get('port')}"
                    )

        SCAN_STORE[scan_id]["progress"] = 95

        # FINAL RESULT
        result = {
            "scan_id": scan_id,
            "target": target,
            "subdomain_enum": subdomains,
            "port_scan": port_data,
            "vulnerabilities": vulnerabilities,
            "osint": osint_data,
            "fingerprinted_services": enriched_services,
            "risk_summary": {
                "score": risk.get("risk_score", 0),
                "severity": risk.get("severity", "LOW"),
                "possible_attacks": risk.get("possible_attacks", []),
            },
            "attack_path": list(set(attack_path)),
            "attack_explanation": attack_explanation,
            "meta": {
                "scan_profile": "SAFE",
                "duration_sec": int(time.time() - start),
                "engine_version": "1.2.1",
                "cve_api_configured": True
            }
        }

        SCAN_STORE[scan_id].update({
            "status": "completed",
            "progress": 100,
            "result": result
        })

        print(f"[+] Scan completed | Risk: {risk.get('risk_score')}")

    except Exception as e:
        traceback.print_exc()
        SCAN_STORE[scan_id] = {
            "status": "failed",
            "progress": 0,
            "error": str(e)
        }


def start_scan(target: str):
    scan_id = str(uuid.uuid4())

    SCAN_STORE[scan_id] = {
        "status": "queued",
        "progress": 0,
        "result": None
    }

    t = threading.Thread(
        target=run_scan,
        args=(scan_id, target),
        daemon=True
    )
    t.start()

    return scan_id
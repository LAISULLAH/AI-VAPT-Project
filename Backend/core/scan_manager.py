import asyncio
import uuid
from datetime import datetime
from typing import Dict, List
import logging

from core.service_fingerprint import ServiceFingerprinter
from core.cve_correlation import CVECorrelator
from core.osint_logger import OSINTCollector
from core.scanner1 import predict_vulnerabilities

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SCAN_STORE = {}


def start_scan(target: str, profile: str = "default") -> str:
    scan_id = str(uuid.uuid4())

    SCAN_STORE[scan_id] = {
        "scan_id": scan_id,
        "target": target,
        "status": "queued",
        "progress": 0,
        "start_time": datetime.now().isoformat(),
        "result": None,
        "error": None,
        "profile": profile
    }

    return scan_id


async def run_scan(scan_id: str, target: str) -> Dict:

    logger.info(f"Starting scan {scan_id} for {target}")

    SCAN_STORE[scan_id]["status"] = "running"
    SCAN_STORE[scan_id]["progress"] = 10

    try:

        result = {
            "scan_id": scan_id,
            "target": target,
            "start_time": datetime.now().isoformat(),
            "port_scan": {},
            "services": [],
            "vulnerabilities": [],
            "osint": {},
            "risk_summary": {},
            "attack_path": []
        }

        # ---------------------------
        # STEP 1 — PORT SCAN
        # ---------------------------

        SCAN_STORE[scan_id]["progress"] = 20

        ports = await _run_port_scan(target)

        result["port_scan"] = {
            "total_ports": len(ports),
            "services": ports
        }

        # ---------------------------
        # STEP 2 — SERVICE FINGERPRINT
        # ---------------------------

        SCAN_STORE[scan_id]["progress"] = 40

        fingerprinter = ServiceFingerprinter()

        services = []

        for service in ports:

            ip = service.get("ip", target)
            port = service["port"]

            info = await fingerprinter.fingerprint_service(ip, port)

            info.update(service)

            services.append(info)

        result["services"] = services

        # ---------------------------
        # STEP 3 — CVE CORRELATION
        # ---------------------------

        SCAN_STORE[scan_id]["progress"] = 60

        cve_correlator = CVECorrelator()

        vulnerabilities = []

        for service in services:

            name = service.get("service_name") or service.get("service")
            version = service.get("version")

            if name and version:

                cves = await cve_correlator.correlate_service_cves(name, version)

                for cve in cves:

                    vulnerabilities.append({
                        "type": "CVE",
                        "id": cve.get("id"),
                        "severity": _cvss_to_severity(cve.get("cvss", 0)),
                        "cvss": cve.get("cvss", 0),
                        "description": cve.get("description"),
                        "port": service["port"],
                        "service": name
                    })

        # ---------------------------
        # STEP 4 — OSINT
        # ---------------------------

        SCAN_STORE[scan_id]["progress"] = 75

        osint = OSINTCollector()

        result["osint"] = await osint.collect_osint(target)

        # ---------------------------
        # STEP 5 — ML VULNERABILITIES
        # ---------------------------

        SCAN_STORE[scan_id]["progress"] = 90

        ai_vulns = predict_vulnerabilities(target, services)

        vulnerabilities.extend(ai_vulns)

        result["vulnerabilities"] = vulnerabilities

        # ---------------------------
        # RISK SUMMARY
        # ---------------------------

        result["risk_summary"] = _calculate_risk_summary(vulnerabilities)

        result["attack_path"] = _generate_attack_path(services, vulnerabilities)

        result["end_time"] = datetime.now().isoformat()

        SCAN_STORE[scan_id]["status"] = "completed"
        SCAN_STORE[scan_id]["progress"] = 100
        SCAN_STORE[scan_id]["result"] = result

        return result

    except Exception as e:

        logger.error(str(e))

        SCAN_STORE[scan_id]["status"] = "failed"
        SCAN_STORE[scan_id]["error"] = str(e)

        raise


async def _run_port_scan(target: str) -> List[Dict]:

    ports = [21,22,25,53,80,110,139,143,443,445,3389,3306,8080]

    open_ports = []

    for port in ports:

        try:

            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(target, port),
                timeout=1
            )

            writer.close()

            await writer.wait_closed()

            open_ports.append({
                "port": port,
                "protocol": "tcp",
                "state": "open",
                "service": _service_from_port(port),
                "ip": target
            })

        except:
            pass

    return open_ports


def _service_from_port(port):

    services = {
        21: "ftp",
        22: "ssh",
        25: "smtp",
        53: "dns",
        80: "http",
        110: "pop3",
        139: "netbios",
        143: "imap",
        443: "https",
        445: "smb",
        3389: "rdp",
        3306: "mysql",
        8080: "http-proxy"
    }

    return services.get(port, "unknown")


def _cvss_to_severity(score):

    if score >= 9:
        return "CRITICAL"
    if score >= 7:
        return "HIGH"
    if score >= 4:
        return "MEDIUM"
    if score > 0:
        return "LOW"

    return "INFO"


def _calculate_risk_summary(vulns):

    summary = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0
    }

    for v in vulns:

        s = v.get("severity","LOW").lower()

        if s in summary:
            summary[s]+=1

    score = (
        summary["critical"]*10 +
        summary["high"]*7 +
        summary["medium"]*4 +
        summary["low"]
    )

    summary["score"] = min(score,100)

    return summary


def _generate_attack_path(services, vulns):

    paths = []

    for s in services[:3]:

        p = s["port"]

        if p == 22:
            paths.append("SSH brute force attack")

        elif p == 80:
            paths.append("HTTP web attack")

        elif p == 443:
            paths.append("SSL attack")

        elif p == 3306:
            paths.append("Database exploitation")

    if any("SQL" in v.get("type","") for v in vulns):
        paths.append("SQL Injection attack")

    return paths[:5]
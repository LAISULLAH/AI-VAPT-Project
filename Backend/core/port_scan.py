import nmap

# -------------------------------
# Enterprise Knowledge Base
# -------------------------------
RISKY_PORTS = {
    21: "FTP uses clear-text authentication",
    23: "Telnet is insecure",
    445: "SMB may allow lateral movement",
    3389: "RDP brute-force risk",
    3306: "Database service exposed publicly"
}

WEB_PORTS = [80, 443, 8080, 8000, 8443]

# -------------------------------
# REAL PORT SCAN ENGINE
# -------------------------------
def port_scan(target: str):
    scanner = nmap.PortScanner()
    services = []

    try:
        # 🔥 REAL INTERNET-SAFE SCAN
        scanner.scan(
            hosts=target,
            arguments=(
                "-sT "
                "-p 1-1024 "        # 🔥 Internet targets ke liye best
                "-Pn "
                "--reason "
                "--max-retries 2 "
                "--host-timeout 60s "
                "-T4"
            )
        )

        for host in scanner.all_hosts():
            for proto in scanner[host].all_protocols():
                for port, data in scanner[host][proto].items():

                    state = data.get("state", "unknown")      # open / closed / filtered
                    reason = data.get("reason", "unknown")
                    service = data.get("name", "unknown")

                    # -------------------------------
                    # Exposure Logic
                    # -------------------------------
                    if state == "open":
                        exposure = "HIGH"
                    elif state == "filtered":
                        exposure = "MEDIUM"
                    elif state == "closed":
                        exposure = "LOW"
                    else:
                        exposure = "UNKNOWN"

                    reasoning = []

                    if port in RISKY_PORTS:
                        reasoning.append(RISKY_PORTS[port])

                    if port in WEB_PORTS:
                        reasoning.append("Web service reachable")
                        surface = "WEB"
                    else:
                        surface = "NETWORK"

                    services.append({
                        "port": port,
                        "protocol": proto,
                        "service": service,
                        "state": state,              # 🔥 OPEN / CLOSED / FILTERED
                        "reason": reason,            # 🔥 WHY this state
                        "exposure_level": exposure,
                        "attack_surface": surface,
                        "reasoning": reasoning
                    })

        return {
            "services": services,
            "confidence": "HIGH" if services else "LIMITED",
            "note": (
                "Port scan includes open, closed, and filtered states. "
                "Filtered ports usually indicate firewall/CDN protection."
            )
        }

    except Exception as e:
        return {
            "services": [],
            "confidence": "LOW",
            "note": str(e)
        }

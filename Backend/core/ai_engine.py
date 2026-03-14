# core/ai_engine.py

def generate_attack_explanation(services: list, vulnerabilities: list):
    """
    Generate attacker-centric explanation based on:
    - Exposed services (attack surface)
    - Detected vulnerabilities (behavior-based)
    """

    reasoning = []

    # -------------------------------
    # Service-based attack reasoning
    # -------------------------------
    for svc in services:
        port = svc.get("port")
        service = svc.get("service", "")
        exposure = svc.get("exposure_level", "LOW")
        surface = svc.get("attack_surface", "NETWORK")

        # Network services
        if port == 21:
            reasoning.append(
                "FTP service is exposed; attacker may attempt anonymous access or credential brute-force."
            )

        elif port == 22:
            reasoning.append(
                "SSH service exposure allows password brute-force or credential stuffing attempts."
            )

        elif port == 3306:
            reasoning.append(
                "Exposed database service may allow unauthorized access or credential attacks."
            )

        elif port == 3389:
            reasoning.append(
                "RDP exposure enables remote access brute-force or exploitation attempts."
            )

        # Web services
        if surface == "WEB":
            reasoning.append(
                "Public web service allows endpoint enumeration and input-based vulnerability testing."
            )

        if exposure == "HIGH":
            reasoning.append(
                f"Service on port {port} has high exposure, increasing attack likelihood."
            )

    # --------------------------------
    # Vulnerability-based attack paths
    # --------------------------------
    for vuln in vulnerabilities:
        name = vuln.get("name", "").lower()

        if "sql" in name:
            reasoning.append(
                "SQL Injection could be leveraged to bypass authentication or extract backend database data."
            )

        elif "xss" in name:
            reasoning.append(
                "Cross-Site Scripting could allow session hijacking or malicious script execution."
            )

        elif "file inclusion" in name:
            reasoning.append(
                "File inclusion vulnerability may expose sensitive server-side files."
            )

    # --------------------------------
    # No attack path case (IMPORTANT)
    # --------------------------------
    if not reasoning:
        reasoning = [
            "Target exposes web functionality but critical network services are filtered or protected.",
            "No abnormal application behavior or injectable inputs were observed.",
            "Error messages and debug information appear suppressed.",
            "Defensive controls such as WAF or secure configuration are likely in place."
        ]

        return {
            "attacker_view": "High effort required, low probability of successful exploitation",
            "reasoning": reasoning
        }

    # --------------------------------
    # Attack path exists
    # --------------------------------
    return {
        "attacker_view": "Exploitation may be possible depending on attacker skill and defenses",
        "reasoning": list(set(reasoning))  # remove duplicates
    }

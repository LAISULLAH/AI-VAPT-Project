# core/scoring.py

def calculate_risk_score(services: list, vulnerabilities: list):
    score = 0
    attacks = []

    # -------------------------
    # Port-based risk (existing)
    # -------------------------
    high_risk_ports = [21, 23, 445, 3389, 3306]

    for svc in services:
        if not isinstance(svc, dict):
            continue

        port = svc.get("port")
        if port in high_risk_ports:
            score += 10
            attacks.append(
                f"Exploitation possible via {svc.get('service_name', 'unknown')} service"
            )

    # -------------------------
    # NEW: CVE-based risk adjustment
    # -------------------------
    for svc in services:
        cves = svc.get('cves', [])
        exploit_weight = svc.get('exploit_weight', 0.0)

        if cves:
            # Average CVSS score of relevant CVEs
            cvss_scores = [cve.get('cvss', 0) for cve in cves if cve.get('cvss')]
            if cvss_scores:
                avg_cvss = sum(cvss_scores) / len(cvss_scores)
                # Impact factor: avg_cvss * exploit_weight (0-10 scale)
                cve_impact = avg_cvss * exploit_weight
                # Add a portion of that to the score (alpha = 0.3)
                score += 0.3 * cve_impact
                # Add attack descriptions for high-severity CVEs
                for cve in cves[:2]:  # limit to avoid flooding
                    if cve.get('cvss', 0) >= 7.0:
                        attacks.append(f"CVE-{cve['id']}: {cve.get('description', '')[:50]}...")

    # -------------------------
    # Vulnerability-based risk (existing)
    # -------------------------
    for vuln in vulnerabilities:
        if not isinstance(vuln, dict):
            continue

        severity = (vuln.get("severity") or "LOW").upper()

        if severity == "CRITICAL":
            score += 30
            attacks.append(vuln.get("type"))

        elif severity == "HIGH":
            score += 20
            attacks.append(vuln.get("type"))

        elif severity == "MEDIUM":
            score += 10

        elif severity == "LOW":
            score += 5

    # -------------------------
    # Cap score
    # -------------------------
    if score > 100:
        score = 100

    # -------------------------
    # Severity mapping
    # -------------------------
    if score >= 75:
        severity = "CRITICAL"
    elif score >= 50:
        severity = "HIGH"
    elif score >= 25:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    return {
        "risk_score": int(score),
        "severity": severity,
        "possible_attacks": list(set(attacks))
    }
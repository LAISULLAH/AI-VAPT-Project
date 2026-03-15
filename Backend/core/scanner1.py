import random

def predict_vulnerabilities(target, services):

    vulnerabilities = []

    if not services:
        return []

    for service in services:

        if isinstance(service, dict):
            port = service.get('port')

            service_name = str(service.get('service', '')).lower()
            if not service_name:
                service_name = str(service.get('service_name', '')).lower()
            if not service_name:
                service_name = str(service.get('name', '')).lower()

            ip = service.get('ip', target)

        else:
            port = service
            service_name = ''
            ip = target

        if not port:
            continue

        if port == 80:
            vulnerabilities.append({
                "type": "HTTP exposed",
                "severity": "HIGH",
                "cvss": 7.5,
                "details": "HTTP exposed; Missing security headers",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Redirect HTTP to HTTPS"
            })

        if port == 443:
            vulnerabilities.append({
                "type": "HTTPS exposed",
                "severity": "MEDIUM",
                "cvss": 5.0,
                "details": "HTTPS exposed; Check SSL configuration",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Add HSTS and security headers"
            })

        if port == 22 or 'ssh' in service_name:
            vulnerabilities.append({
                "type": "SSH exposed",
                "severity": "MEDIUM",
                "cvss": 5.5,
                "details": "SSH service exposed",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Disable password login and use key auth"
            })

        db_ports = {
            3306: "MySQL",
            5432: "PostgreSQL",
            27017: "MongoDB",
            1433: "MSSQL",
            6379: "Redis",
            9200: "Elasticsearch"
        }

        if port in db_ports:
            vulnerabilities.append({
                "type": f"{db_ports[port]} Database exposed",
                "severity": "CRITICAL",
                "cvss": 9.0,
                "details": f"{db_ports[port]} database exposed",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Restrict database access with firewall"
            })

        if port == 21 or 'ftp' in service_name:
            vulnerabilities.append({
                "type": "FTP exposed",
                "severity": "HIGH",
                "cvss": 7.5,
                "details": "FTP exposed; possible anonymous access",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Replace FTP with SFTP"
            })

        if port == 3389:
            vulnerabilities.append({
                "type": "RDP exposed",
                "severity": "CRITICAL",
                "cvss": 8.5,
                "details": "RDP exposed to internet",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Use VPN for RDP access"
            })

    unique_vulns = []
    seen = set()

    for vuln in vulnerabilities:
        key = f"{vuln.get('port')}-{vuln.get('type')}"
        if key not in seen:
            seen.add(key)
            unique_vulns.append(vuln)

    return unique_vulns
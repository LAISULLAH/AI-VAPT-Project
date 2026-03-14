# scanner1.py - Fixed version that matches your actual data structure
import random

def predict_vulnerabilities(target, services):
    """
    Predict configuration vulnerabilities based on open ports and services
    
    Args:
        target: The target domain/IP
        services: List of service dictionaries from port_scan
    
    Returns:
        List of vulnerability dictionaries
    """
    vulnerabilities = []
    
    # Safety check
    if not services:
        return []
    
    for service in services:
        # Handle different possible data structures
        if isinstance(service, dict):
            # Extract data with fallbacks for different field names
            port = service.get('port')
            
            # Try different possible field names for service name
            service_name = str(service.get('service', '')).lower()
            if not service_name:
                service_name = str(service.get('service_name', '')).lower()
            if not service_name:
                service_name = str(service.get('name', '')).lower()
            
            # Get IP if available
            ip = service.get('ip', target)
            
        else:
            # If service is just a port number
            port = service
            service_name = ''
            ip = target
        
        # Skip if no port
        if not port:
            continue
        
        # HTTP on port 80
        if port == 80:
            vulnerabilities.append({
                "type": "HTTP exposed",
                "issue": "HTTP exposed",
                "severity": "HIGH",
                "confidence": 0.8,
                "score": 8,
                "cvss": 7.5,  # Add CVSS score for consistency
                "details": "HTTP exposed; Missing security headers",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Redirect all HTTP traffic to HTTPS and disable port 80 if not required."
            })
        
        # HTTPS on port 443
        if port == 443:
            vulnerabilities.append({
                "type": "HTTPS exposed",
                "issue": "HTTPS exposed",
                "severity": "MEDIUM",
                "confidence": 0.6,
                "score": 6,
                "cvss": 5.0,
                "details": "HTTPS exposed; Check SSL/TLS configuration",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Implement strong security headers such as CSP, HSTS, and X-Frame-Options."
            })
        
        # SSH on port 22 or identified as SSH service
        if port == 22 or 'ssh' in service_name:
            vulnerabilities.append({
                "type": "SSH exposed",
                "issue": "SSH exposed",
                "severity": "MEDIUM",
                "confidence": 0.5,
                "score": 5,
                "cvss": 5.5,
                "details": "SSH service exposed to internet",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Restrict SSH using IP whitelisting, disable password login, and enforce key-based authentication."
            })
        
        # Database ports
        db_ports = {
            3306: {"name": "MySQL", "severity": "CRITICAL", "cvss": 9.0},
            5432: {"name": "PostgreSQL", "severity": "CRITICAL", "cvss": 9.0},
            27017: {"name": "MongoDB", "severity": "CRITICAL", "cvss": 9.0},
            1433: {"name": "MSSQL", "severity": "CRITICAL", "cvss": 9.0},
            6379: {"name": "Redis", "severity": "HIGH", "cvss": 8.0},
            9200: {"name": "Elasticsearch", "severity": "HIGH", "cvss": 8.0}
        }
        
        if port in db_ports:
            db_info = db_ports[port]
            vulnerabilities.append({
                "type": f"{db_info['name']} Database exposed",
                "issue": f"{db_info['name']} Database exposed",
                "severity": db_info['severity'],
                "confidence": 0.9,
                "score": db_info['cvss'],
                "cvss": db_info['cvss'],
                "details": f"{db_info['name']} database exposed to internet without proper access controls",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": f"Restrict access to {db_info['name']} database using firewall rules and authentication"
            })
        
        # FTP on port 21
        if port == 21 or 'ftp' in service_name:
            vulnerabilities.append({
                "type": "FTP exposed",
                "issue": "FTP exposed",
                "severity": "HIGH",
                "confidence": 0.7,
                "score": 7.5,
                "cvss": 7.5,
                "details": "FTP service exposed; Check for anonymous access",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Replace FTP with SFTP or FTPS, disable anonymous access"
            })
        
        # RDP on port 3389
        if port == 3389:
            vulnerabilities.append({
                "type": "RDP exposed",
                "issue": "RDP exposed",
                "severity": "CRITICAL",
                "confidence": 0.8,
                "score": 8.5,
                "cvss": 8.5,
                "details": "RDP service exposed to internet - high risk for brute force attacks",
                "port": port,
                "source": "CONFIG_SCAN",
                "recommendation": "Use VPN for remote access, enable Network Level Authentication, use strong passwords"
            })
    
    # Remove duplicates (keep highest severity for each port/issue)
    unique_vulns = []
    seen = set()
    
    for vuln in vulnerabilities:
        key = f"{vuln.get('port')}-{vuln.get('type')}"
        if key not in seen:
            seen.add(key)
            unique_vulns.append(vuln)
    
    return unique_vulns


# Optional: Add a function to calculate risk score
def calculate_risk_score(vulnerabilities):
    """
    Calculate overall risk score from vulnerabilities
    """
    if not vulnerabilities:
        return 0
    
    total_score = 0
    weights = {
        "CRITICAL": 10,
        "HIGH": 7,
        "MEDIUM": 4,
        "LOW": 1
    }
    
    for vuln in vulnerabilities:
        severity = vuln.get('severity', 'LOW').upper()
        weight = weights.get(severity, 1)
        total_score += weight
    
    # Normalize to 0-100 scale
    max_possible = len(vulnerabilities) * 10
    if max_possible == 0:
        return 0
    
    risk_score = min(100, (total_score / max_possible) * 100)
    return round(risk_score)
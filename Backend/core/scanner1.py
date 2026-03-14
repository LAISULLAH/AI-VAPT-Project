# scanner1.py - Fixed version
import random

def predict_vulnerabilities(target, services):
    """
    Predict configuration vulnerabilities based on open ports and services
    """
    vulnerabilities = []
    
    # Safety check
    if not services:
        return []
    
    for service in services:
        # Handle both dictionary and string types
        if isinstance(service, dict):
            port = service.get('port')
            service_name = service.get('service', '').lower()
            service_name2 = service.get('service_name', '').lower()
        else:
            port = service
            service_name = ''
            service_name2 = ''
        
        # HTTP on port 80
        if port == 80:
            vulnerabilities.append({
                "issue": "HTTP exposed",
                "severity": "HIGH",
                "score": 8,
                "details": "HTTP exposed; Missing security headers",
                "port": port
            })
        
        # HTTPS on port 443
        if port == 443:
            vulnerabilities.append({
                "issue": "HTTPS exposed",
                "severity": "MEDIUM",
                "score": 6,
                "details": "HTTPS exposed; Check SSL/TLS configuration",
                "port": port
            })
        
        # SSH on port 22
        if port == 22 or 'ssh' in service_name or 'ssh' in service_name2:
            vulnerabilities.append({
                "issue": "SSH exposed",
                "severity": "MEDIUM",
                "score": 5,
                "details": "SSH service exposed to internet",
                "port": port
            })
        
        # Database ports
        if port in [3306, 5432, 27017, 1433]:
            db_names = {
                3306: "MySQL", 
                5432: "PostgreSQL", 
                27017: "MongoDB",
                1433: "MSSQL"
            }
            vulnerabilities.append({
                "issue": f"{db_names[port]} Database exposed",
                "severity": "CRITICAL",
                "score": 9,
                "details": f"{db_names[port]} database exposed to internet",
                "port": port
            })
    
    return vulnerabilities
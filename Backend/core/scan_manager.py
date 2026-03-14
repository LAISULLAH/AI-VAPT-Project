import asyncio
import uuid
import time
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Import your core modules
from core.service_fingerprint import ServiceFingerprinter
from core.cve_correlation import CVECorrelator
from core.osint_module import OSINTCollector
from core.port_scan import port_scan
from core.scanner1 import predict_vulnerabilities

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global scan store
SCAN_STORE = {}

def start_scan(target: str, profile: str = "default") -> str:
    """
    Start an asynchronous scan
    
    Args:
        target: Target domain/IP to scan
        profile: Scan profile (default, aggressive, quick, etc.)
    
    Returns:
        scan_id: Unique scan identifier
    """
    scan_id = str(uuid.uuid4())
    
    # Initialize scan in store
    SCAN_STORE[scan_id] = {
        "scan_id": scan_id,
        "target": target,
        "status": "queued",
        "progress": 0,
        "start_time": datetime.now().isoformat(),
        "end_time": None,
        "result": None,
        "error": None,
        "profile": profile
    }
    
    logger.info(f"Scan {scan_id} queued for target: {target}")
    
    # In a real async system, you'd spawn a background task here
    # For now, we'll just return the ID and expect the caller to run the scan
    
    return scan_id


def run_scan(scan_id: str, target: str) -> Dict:
    """
    Run the complete scan pipeline (blocking)
    
    Args:
        scan_id: Unique scan identifier
        target: Target domain/IP to scan
    
    Returns:
        Complete scan results dictionary
    """
    logger.info(f"🚀 Starting scan {scan_id} for target: {target}")
    
    # Update scan status
    if scan_id in SCAN_STORE:
        SCAN_STORE[scan_id]["status"] = "running"
        SCAN_STORE[scan_id]["progress"] = 10
    
    try:
        # Initialize results structure
        scan_result = {
            "scan_id": scan_id,
            "target": target,
            "start_time": datetime.now().isoformat(),
            "port_scan": {"services": [], "total_ports": 0},
            "fingerprinted_services": [],
            "vulnerabilities": [],
            "osint": {},
            "risk_summary": {},
            "attack_path": [],
            "meta": {
                "scan_profile": "default",
                "cve_api_configured": True
            }
        }
        
        # STEP 1: Port Scan (Progress: 10% -> 30%)
        logger.info(f"📡 Step 1/5: Port scanning {target}")
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["progress"] = 20
            SCAN_STORE[scan_id]["status_detail"] = "Port scanning..."
        
        # Run port scan (using your port_scan function)
        # This should return list of open ports with service info
        open_ports = asyncio.run(_run_port_scan(target))
        scan_result["port_scan"]["services"] = open_ports
        scan_result["port_scan"]["total_ports"] = len(open_ports)
        
        logger.info(f"✅ Found {len(open_ports)} open ports")
        
        # STEP 2: Service Fingerprinting (Progress: 30% -> 50%)
        logger.info(f"🔍 Step 2/5: Fingerprinting services")
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["progress"] = 40
            SCAN_STORE[scan_id]["status_detail"] = "Fingerprinting services..."
        
        # Initialize fingerprinter
        fingerprinter = ServiceFingerprinter(timeout=5, max_workers=10)
        
        # Fingerprint each service
        fingerprinted_services = []
        for service in open_ports:
            ip = service.get('ip', target)
            port = service.get('port')
            
            # Get detailed fingerprint
            service_info = asyncio.run(fingerprinter.fingerprint_service(ip, port))
            
            # Merge with port scan info
            service_info.update({
                'protocol': service.get('protocol', 'tcp'),
                'state': service.get('state', 'open'),
                'exposure_level': service.get('exposure_level', 'MEDIUM'),
                'attack_surface': service.get('attack_surface', 'NETWORK'),
                'ip': ip
            })
            
            fingerprinted_services.append(service_info)
        
        scan_result["fingerprinted_services"] = fingerprinted_services
        logger.info(f"✅ Fingerprinted {len(fingerprinted_services)} services")
        
        # STEP 3: CVE Correlation (Progress: 50% -> 70%)
        logger.info(f"🛡️ Step 3/5: Correlating CVEs")
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["progress"] = 60
            SCAN_STORE[scan_id]["status_detail"] = "Checking for vulnerabilities..."
        
        # Initialize CVE correlator
        cve_correlator = CVECorrelator()
        
        # Get CVEs for each service
        for service in fingerprinted_services:
            if service.get('version') and service.get('service_name'):
                cves = asyncio.run(cve_correlator.correlate_service_cves(
                    service['service_name'],
                    service['version']
                ))
                service['cves'] = cves
                service['exploit_weight'] = cve_correlator.calculate_exploit_weight(cves)
        
        # STEP 4: OSINT Collection (Progress: 70% -> 85%)
        logger.info(f"🌐 Step 4/5: Collecting OSINT data")
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["progress"] = 75
            SCAN_STORE[scan_id]["status_detail"] = "Gathering OSINT..."
        
        # Initialize OSINT collector
        osint_collector = OSINTCollector()
        osint_data = asyncio.run(osint_collector.collect_osint(target))
        scan_result["osint"] = osint_data
        
        # STEP 5: Vulnerability Detection & Risk Scoring (Progress: 85% -> 95%)
        logger.info(f"⚠️ Step 5/5: Analyzing vulnerabilities")
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["progress"] = 90
            SCAN_STORE[scan_id]["status_detail"] = "Analyzing risks..."
        
        # Get configuration-based vulnerabilities from scanner1
        config_vulns = predict_vulnerabilities(target, fingerprinted_services)
        
        # Combine with CVE-based vulnerabilities
        all_vulnerabilities = []
        
        # Add CVE-based vulnerabilities
        for service in fingerprinted_services:
            for cve in service.get('cves', []):
                all_vulnerabilities.append({
                    "type": "CVE",
                    "id": cve.get('id'),
                    "severity": _cvss_to_severity(cve.get('cvss', 0)),
                    "cvss": cve.get('cvss', 0),
                    "description": cve.get('description', ''),
                    "port": service.get('port'),
                    "service": service.get('service_name'),
                    "source": "CVE_DATABASE"
                })
        
        # Add configuration vulnerabilities
        all_vulnerabilities.extend(config_vulns)
        
        scan_result["vulnerabilities"] = all_vulnerabilities
        
        # Calculate risk summary
        risk_summary = _calculate_risk_summary(all_vulnerabilities, fingerprinted_services)
        scan_result["risk_summary"] = risk_summary
        
        # Generate attack path
        attack_path = _generate_attack_path(fingerprinted_services, all_vulnerabilities)
        scan_result["attack_path"] = attack_path
        
        # Add end time
        scan_result["end_time"] = datetime.now().isoformat()
        
        # Calculate duration
        start = datetime.fromisoformat(scan_result["start_time"])
        end = datetime.fromisoformat(scan_result["end_time"])
        scan_result["meta"]["duration_sec"] = (end - start).total_seconds()
        
        # Update scan store with success
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["status"] = "completed"
            SCAN_STORE[scan_id]["progress"] = 100
            SCAN_STORE[scan_id]["end_time"] = scan_result["end_time"]
            SCAN_STORE[scan_id]["result"] = scan_result
        
        logger.info(f"✅ Scan {scan_id} completed successfully in {scan_result['meta']['duration_sec']:.1f}s")
        logger.info(f"📊 Risk score: {risk_summary.get('score', 0)} - {risk_summary.get('severity', 'UNKNOWN')}")
        
        return scan_result
        
    except Exception as e:
        logger.error(f"❌ Scan {scan_id} failed: {str(e)}", exc_info=True)
        
        # Update scan store with error
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["status"] = "failed"
            SCAN_STORE[scan_id]["error"] = str(e)
            SCAN_STORE[scan_id]["end_time"] = datetime.now().isoformat()
        
        # Re-raise to be handled by the caller
        raise


async def _run_port_scan(target: str) -> List[Dict]:
    """
    Run port scan asynchronously
    
    Args:
        target: Target domain/IP
    
    Returns:
        List of open ports with service info
    """
    # Common ports to scan
    common_ports = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 
                    993, 995, 1723, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 
                    27017, 27018, 27019]
    
    open_ports = []
    
    for port in common_ports:
        try:
            # Simple TCP connection test
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(target, port),
                timeout=2.0
            )
            writer.close()
            await writer.wait_closed()
            
            # Determine service from port
            service = _get_service_name(port)
            
            # Determine exposure level
            exposure = "HIGH" if port in [22, 80, 443, 3389, 3306, 5432] else "MEDIUM"
            attack_surface = "WEB" if port in [80, 443, 8080, 8443] else "NETWORK"
            
            open_ports.append({
                "port": port,
                "protocol": "tcp",
                "service": service,
                "state": "open",
                "reason": "syn-ack",
                "exposure_level": exposure,
                "attack_surface": attack_surface,
                "ip": target
            })
            
            logger.debug(f"Port {port} open on {target}")
            
        except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
            # Port is closed or filtered
            pass
        except Exception as e:
            logger.debug(f"Error scanning port {port}: {str(e)}")
    
    return open_ports


def _get_service_name(port: int) -> str:
    """Get service name from port number"""
    services = {
        21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp',
        53: 'dns', 80: 'http', 110: 'pop3', 111: 'rpcbind',
        135: 'msrpc', 139: 'netbios-ssn', 143: 'imap',
        443: 'https', 445: 'microsoft-ds', 993: 'imaps',
        995: 'pop3s', 1723: 'pptp', 3306: 'mysql',
        3389: 'rdp', 5432: 'postgresql', 5900: 'vnc',
        6379: 'redis', 8080: 'http-proxy', 8443: 'https-alt',
        27017: 'mongodb', 27018: 'mongodb', 27019: 'mongodb'
    }
    return services.get(port, 'unknown')


def _cvss_to_severity(cvss: float) -> str:
    """Convert CVSS score to severity level"""
    if cvss >= 9.0:
        return "CRITICAL"
    elif cvss >= 7.0:
        return "HIGH"
    elif cvss >= 4.0:
        return "MEDIUM"
    elif cvss > 0:
        return "LOW"
    else:
        return "INFO"


def _calculate_risk_summary(vulnerabilities: List[Dict], services: List[Dict]) -> Dict:
    """Calculate overall risk summary"""
    risk_summary = {
        "score": 0,
        "severity": "LOW",
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0,
        "possible_attacks": []
    }
    
    # Count vulnerabilities by severity
    for vuln in vulnerabilities:
        severity = vuln.get('severity', 'INFO').upper()
        if severity == "CRITICAL":
            risk_summary["critical"] += 1
        elif severity == "HIGH":
            risk_summary["high"] += 1
        elif severity == "MEDIUM":
            risk_summary["medium"] += 1
        elif severity == "LOW":
            risk_summary["low"] += 1
        else:
            risk_summary["info"] += 1
        
        # Collect possible attacks (first few)
        if len(risk_summary["possible_attacks"]) < 5:
            desc = vuln.get('description', vuln.get('type', 'Unknown'))
            if len(desc) > 50:
                desc = desc[:50] + "..."
            risk_summary["possible_attacks"].append(desc)
    
    # Calculate weighted score
    total = (
        risk_summary["critical"] * 10 +
        risk_summary["high"] * 7 +
        risk_summary["medium"] * 4 +
        risk_summary["low"] * 1
    )
    
    max_possible = len(services) * 10 if services else 1
    risk_summary["score"] = min(100, int((total / max_possible) * 100))
    
    # Determine severity
    if risk_summary["critical"] > 0 or risk_summary["score"] >= 70:
        risk_summary["severity"] = "CRITICAL"
    elif risk_summary["high"] > 0 or risk_summary["score"] >= 50:
        risk_summary["severity"] = "HIGH"
    elif risk_summary["medium"] > 0 or risk_summary["score"] >= 30:
        risk_summary["severity"] = "MEDIUM"
    elif risk_summary["low"] > 0:
        risk_summary["severity"] = "LOW"
    
    return risk_summary


def _generate_attack_path(services: List[Dict], vulnerabilities: List[Dict]) -> List[str]:
    """Generate possible attack paths"""
    attack_paths = []
    
    # Sort services by exploit weight
    sorted_services = sorted(
        services,
        key=lambda x: x.get('exploit_weight', 0),
        reverse=True
    )
    
    for service in sorted_services[:3]:
        port = service.get('port')
        service_name = service.get('service_name', 'unknown')
        
        if port == 22:
            attack_paths.append("SSH brute-force or exploit known SSH vulnerabilities")
        elif port == 80:
            attack_paths.append("Unencrypted HTTP traffic interception")
        elif port == 443:
            attack_paths.append("SSL/TLS vulnerabilities or web app attacks")
        elif port == 3306:
            attack_paths.append("MySQL database exploitation")
        elif port == 3389:
            attack_paths.append("RDP brute-force or BlueKeep exploitation")
        elif service.get('cves'):
            attack_paths.append(f"Exploit CVEs on {service_name} port {port}")
    
    # Add vulnerability-based paths
    for vuln in vulnerabilities[:2]:
        if "SQL" in vuln.get('type', ''):
            attack_paths.append("SQL injection for data extraction")
        elif "XSS" in vuln.get('type', ''):
            attack_paths.append("Cross-site scripting for session hijacking")
    
    # Remove duplicates and limit
    unique_paths = []
    for path in attack_paths:
        if path not in unique_paths:
            unique_paths.append(path)
    
    return unique_paths[:5]


# For testing locally
if __name__ == "__main__":
    # Test the run_scan function
    scan_id = start_scan("example.com")
    result = run_scan(scan_id, "example.com")
    print(f"Scan completed with risk score: {result['risk_summary']['score']}")
import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional
import logging
from concurrent.futures import ThreadPoolExecutor

from .service_fingerprint import ServiceFingerprinter
from .cve_correlation import CVECorrelator
from .osint_logger import OSINTCollector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScanManager:
    def __init__(self, nvd_api_key: Optional[str] = None):
        self.fingerprinter = ServiceFingerprinter(timeout=5)
        self.cve_correlator = CVECorrelator(nvd_api_key)
        self.osint_collector = OSINTCollector(timeout=10)
        self.active_scans = {}
        
    async def start_scan(self, target: str, scan_options: Dict = None) -> Dict:
        """Start a new scan"""
        scan_id = str(uuid.uuid4())
        
        scan_result = {
            'scan_id': scan_id,
            'target': target,
            'status': 'in_progress',
            'start_time': datetime.now().isoformat(),
            'port_scan': {},
            'fingerprinted_services': [],
            'vulnerabilities': [],
            'osint': {},
            'risk_summary': {},
            'attack_path': []
        }
        
        self.active_scans[scan_id] = scan_result
        
        # Start scan asynchronously
        asyncio.create_task(self._run_scan_pipeline(scan_id, target, scan_options or {}))
        
        return {'scan_id': scan_id, 'status': 'started'}
    
    async def _run_scan_pipeline(self, scan_id: str, target: str, options: Dict):
        """Run the complete scan pipeline"""
        try:
            scan_result = self.active_scans[scan_id]
            
            # Step 1: Subdomain Enumeration (if enabled)
            if options.get('subdomain_enum', True):
                subdomains = await self._enumerate_subdomains(target)
                scan_result['subdomains'] = subdomains
            
            # Step 2: Port Scan (simplified - integrate with your port scanner)
            open_ports = await self._port_scan(target, options.get('ports', '1-1000'))
            scan_result['port_scan'] = {'open_ports': open_ports, 'total': len(open_ports)}
            
            # Step 3: Service Fingerprinting
            fingerprinted_services = []
            for port in open_ports:
                service_info = await self.fingerprinter.fingerprint_service(target, port)
                
                # Step 4: CVE Correlation for each service
                if service_info.get('version'):
                    service_info['cves'] = await self.cve_correlator.correlate_service_cves(
                        service_info['service_name'],
                        service_info['version']
                    )
                    service_info['exploit_weight'] = self.cve_correlator.calculate_exploit_weight(
                        service_info['cves']
                    )
                
                fingerprinted_services.append(service_info)
            
            scan_result['fingerprinted_services'] = fingerprinted_services
            
            # Step 5: OSINT Intelligence
            osint_data = await self.osint_collector.collect_osint(target)
            scan_result['osint'] = osint_data
            
            # Step 6: Risk Scoring and Attack Path Generation
            scan_result['risk_summary'] = self._calculate_risk_summary(fingerprinted_services, osint_data)
            scan_result['attack_path'] = self._generate_attack_path(fingerprinted_services)
            
            # Step 7: Aggregate vulnerabilities
            scan_result['vulnerabilities'] = self._aggregate_vulnerabilities(fingerprinted_services, osint_data)
            
            scan_result['status'] = 'completed'
            scan_result['end_time'] = datetime.now().isoformat()
            
        except Exception as e:
            logger.error(f"Scan {scan_id} failed: {str(e)}")
            scan_result['status'] = 'failed'
            scan_result['error'] = str(e)
        finally:
            # Keep scan result for retrieval
            pass
    
    async def _port_scan(self, target: str, port_range: str) -> List[int]:
        """Simplified port scanning - integrate with your actual port scanner"""
        # This is a placeholder - replace with your actual port scanning logic
        common_ports = [22, 80, 443, 8080, 8443]
        open_ports = []
        
        for port in common_ports:
            try:
                reader, writer = await asyncio.wait_for(
                    asyncio.open_connection(target, port),
                    timeout=2
                )
                writer.close()
                await writer.wait_closed()
                open_ports.append(port)
            except:
                continue
        
        return open_ports
    
    async def _enumerate_subdomains(self, domain: str) -> List[str]:
        """Subdomain enumeration - integrate with your subdomain enumeration tool"""
        # Placeholder - implement actual subdomain enumeration
        return []
    
    def _calculate_risk_summary(self, services: List[Dict], osint: Dict) -> Dict:
        """Calculate overall risk summary"""
        risk_summary = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0,
            'info': 0,
            'overall_risk_score': 0,
            'risk_level': 'LOW'
        }
        
        # Calculate risk based on service vulnerabilities
        for service in services:
            for cve in service.get('cves', []):
                cvss = cve.get('cvss', 0)
                if cvss >= 9.0:
                    risk_summary['critical'] += 1
                elif cvss >= 7.0:
                    risk_summary['high'] += 1
                elif cvss >= 4.0:
                    risk_summary['medium'] += 1
                elif cvss > 0:
                    risk_summary['low'] += 1
                else:
                    risk_summary['info'] += 1
        
        # Add OSINT-based risks
        if osint.get('trust_level') == 'LOW':
            risk_summary['medium'] += 1
        
        # Calculate overall risk score
        total_vulns = sum([
            risk_summary['critical'] * 10,
            risk_summary['high'] * 7,
            risk_summary['medium'] * 4,
            risk_summary['low'] * 1
        ])
        
        max_possible = (len(services) * 10) or 1
        risk_summary['overall_risk_score'] = min(100, (total_vulns / max_possible) * 100)
        
        # Determine risk level
        if risk_summary['overall_risk_score'] >= 70:
            risk_summary['risk_level'] = 'CRITICAL'
        elif risk_summary['overall_risk_score'] >= 50:
            risk_summary['risk_level'] = 'HIGH'
        elif risk_summary['overall_risk_score'] >= 30:
            risk_summary['risk_level'] = 'MEDIUM'
        elif risk_summary['overall_risk_score'] >= 10:
            risk_summary['risk_level'] = 'LOW'
        
        return risk_summary
    
    def _generate_attack_path(self, services: List[Dict]) -> List[Dict]:
        """Generate potential attack paths"""
        attack_path = []
        
        # Sort services by exploit weight
        sorted_services = sorted(
            services,
            key=lambda x: x.get('exploit_weight', 0),
            reverse=True
        )
        
        for service in sorted_services[:5]:  # Top 5 most vulnerable
            if service.get('exploit_weight', 0) > 0.5:
                path = {
                    'service': f"{service['service_name']}:{service['port']}",
                    'exploit_weight': service['exploit_weight'],
                    'cves': [cve['id'] for cve in service.get('cves', [])[:3]],
                    'attack_vector': self._determine_attack_vector(service)
                }
                attack_path.append(path)
        
        return attack_path
    
    def _determine_attack_vector(self, service: Dict) -> str:
        """Determine likely attack vector for service"""
        vectors = {
            'ssh': 'Remote Code Execution via SSH',
            'http': 'Web Application Attack',
            'https': 'Web Application Attack or MITM',
            'ftp': 'Anonymous Access or Credential Theft',
            'mysql': 'SQL Injection or Database Compromise',
            'rdp': 'Remote Desktop Protocol Exploitation'
        }
        
        return vectors.get(service.get('service_name', ''), 'Service-specific Exploitation')
    
    def _aggregate_vulnerabilities(self, services: List[Dict], osint: Dict) -> List[Dict]:
        """Aggregate all vulnerabilities into a single list"""
        vulnerabilities = []
        
        # Add service CVEs
        for service in services:
            for cve in service.get('cves', []):
                vuln = {
                    'id': cve['id'],
                    'type': 'CVE',
                    'service': f"{service['service_name']}:{service['port']}",
                    'cvss': cve.get('cvss', 0),
                    'description': cve.get('description', ''),
                    'exploit_available': cve.get('exploit_available', False),
                    'remediation': f"Update {service['service_name']} to latest version"
                }
                vulnerabilities.append(vuln)
        
        # Add OSINT-based vulnerabilities
        if osint.get('ssl', {}).get('vulnerabilities'):
            for ssl_vuln in osint['ssl']['vulnerabilities']:
                vuln = {
                    'id': f"SSL-{len(vulnerabilities)}",
                    'type': 'SSL/TLS',
                    'service': 'https',
                    'cvss': 7.0 if ssl_vuln['severity'] == 'HIGH' else 4.0,
                    'description': ssl_vuln['description'],
                    'remediation': 'Update SSL/TLS configuration'
                }
                vulnerabilities.append(vuln)
        
        return vulnerabilities
    
    def get_scan_result(self, scan_id: str) -> Optional[Dict]:
        """Get scan result by ID"""
        return self.active_scans.get(scan_id)
    
    def list_scans(self) -> List[Dict]:
        """List all scans"""
        return [
            {
                'scan_id': scan_id,
                'target': scan['target'],
                'status': scan['status'],
                'start_time': scan['start_time']
            }
            for scan_id, scan in self.active_scans.items()
        ]
# core/osint_logger.py
import aiohttp
import asyncio
import socket
import ssl
import whois
import dns.resolver
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import re
import logging

# Try to import cryptography with fallback
try:
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa, ec
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False
    # Create dummy classes
    class hashes:
        class HashAlgorithm:
            pass
        class SHA256(HashAlgorithm):
            name = "sha256"
        class SHA1(HashAlgorithm):
            name = "sha1"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OSINTCollector:
    def __init__(self, timeout: int = 10, user_agent: str = None):
        self.timeout = timeout
        self.user_agent = user_agent or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        self.results = {
            'status': 'completed',
            'timestamp': datetime.now().isoformat(),
            'target': '',
            'osint_score': 0,
            'trust_level': 'UNKNOWN',
            'whois': {},
            'dns': {},
            'ssl': {},
            'http': {},
            'certificate_transparency': [],
            'subdomains': [],
            'technologies': [],
            'cryptography_available': CRYPTOGRAPHY_AVAILABLE
        }
    
    async def collect_osint(self, target: str) -> Dict:
        """Collect all OSINT data for target"""
        try:
            target = self._clean_target(target)
            self.results['target'] = target
            
            logger.info(f"Starting OSINT collection for: {target}")
            
            # Create SSL context
            ssl_context = self._create_ssl_context()
            
            # Run OSINT tasks
            tasks = [
                self._get_whois_info(target),
                self._get_dns_records(target),
                self._get_ssl_info(target, ssl_context),
                self._get_http_headers(target, ssl_context),
                self._get_crt_sh_data(target),
                self._scan_subdomains(target)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            result_keys = ['whois', 'dns', 'ssl', 'http', 'certificate_transparency', 'subdomains']
            
            for i, key in enumerate(result_keys):
                if i < len(results):
                    if isinstance(results[i], Exception):
                        logger.error(f"Error collecting {key}: {str(results[i])}")
                        self.results[key] = {'error': str(results[i])}
                    else:
                        self.results[key] = results[i]
            
            # Calculate score
            self._calculate_osint_score()
            
        except Exception as e:
            logger.error(f"OSINT collection failed: {str(e)}")
            self.results['status'] = 'failed'
            self.results['error'] = str(e)
        
        return self.results
    
    def _create_ssl_context(self):
        """Create SSL context"""
        try:
            import certifi
            ssl_context = ssl.create_default_context(cafile=certifi.where())
        except:
            ssl_context = ssl.create_default_context()
        
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        return ssl_context
    
    def _clean_target(self, target: str) -> str:
        """Clean target URL/domain"""
        target = target.lower().strip()
        target = re.sub(r'^https?://', '', target)
        target = target.split('/')[0]
        target = target.split(':')[0]
        return target
    
    async def _get_whois_info(self, domain: str) -> Dict:
        """Get WHOIS information"""
        try:
            loop = asyncio.get_event_loop()
            w = await loop.run_in_executor(None, lambda: whois.whois(domain))
            
            def safe_get(obj, attr, default=None):
                if hasattr(obj, attr):
                    val = getattr(obj, attr)
                    if val is not None:
                        return val
                return default
            
            def format_date_list(dates):
                if not dates:
                    return None
                if isinstance(dates, list):
                    return [self._format_date(d) for d in dates if d]
                return self._format_date(dates)
            
            whois_data = {
                'domain_name': safe_get(w, 'domain_name'),
                'registrar': safe_get(w, 'registrar'),
                'creation_date': format_date_list(safe_get(w, 'creation_date')),
                'expiration_date': format_date_list(safe_get(w, 'expiration_date')),
                'updated_date': format_date_list(safe_get(w, 'updated_date')),
                'name_servers': safe_get(w, 'name_servers', []),
                'status': safe_get(w, 'status', []),
                'emails': safe_get(w, 'emails', []),
                'organization': safe_get(w, 'org') or safe_get(w, 'organization'),
                'country': safe_get(w, 'country'),
            }
            
            return whois_data
            
        except Exception as e:
            logger.error(f"WHOIS lookup failed: {str(e)}")
            return {'error': str(e)}
    
    async def _get_dns_records(self, domain: str) -> Dict:
        """Get DNS records"""
        dns_data = {
            'a_records': [],
            'aaaa_records': [],
            'mx_records': [],
            'ns_records': [],
            'txt_records': [],
            'cname_records': [],
            'soa_records': []
        }
        
        record_types = {
            'A': 'a_records',
            'AAAA': 'aaaa_records',
            'MX': 'mx_records',
            'NS': 'ns_records',
            'TXT': 'txt_records',
            'CNAME': 'cname_records',
            'SOA': 'soa_records'
        }
        
        try:
            loop = asyncio.get_event_loop()
            
            for record_type, key in record_types.items():
                try:
                    resolver = dns.resolver.Resolver()
                    resolver.timeout = self.timeout
                    resolver.lifetime = self.timeout
                    
                    answers = await loop.run_in_executor(
                        None, 
                        lambda: resolver.resolve(domain, record_type)
                    )
                    
                    for answer in answers:
                        if record_type == 'MX':
                            dns_data[key].append({
                                'preference': answer.preference,
                                'exchange': str(answer.exchange)
                            })
                        elif record_type == 'SOA':
                            dns_data[key].append({
                                'mname': str(answer.mname),
                                'rname': str(answer.rname),
                                'serial': answer.serial,
                                'refresh': answer.refresh,
                                'retry': answer.retry,
                                'expire': answer.expire,
                                'minimum': answer.minimum
                            })
                        else:
                            dns_data[key].append(str(answer))
                            
                except Exception:
                    continue
                    
        except Exception as e:
            logger.error(f"DNS lookup failed: {str(e)}")
            dns_data['error'] = str(e)
        
        return dns_data
    
    async def _get_ssl_info(self, domain: str, ssl_context) -> Dict:
        """Get SSL certificate information with fallback"""
        ssl_data = {
            'certificate': {},
            'issuer': {},
            'subject': {},
            'validity': {},
            'vulnerabilities': []
        }
        
        try:
            # Try port 443 first
            conn = ssl_context.wrap_socket(
                socket.socket(socket.AF_INET),
                server_hostname=domain
            )
            conn.settimeout(self.timeout)
            
            await asyncio.get_event_loop().run_in_executor(
                None, 
                conn.connect, 
                (domain, 443)
            )
            
            # Get certificate using built-in SSL (avoid cryptography issues)
            cert = conn.getpeercert()
            
            if cert:
                # Parse subject
                if 'subject' in cert:
                    subject_dict = {}
                    for item in cert['subject']:
                        for key, value in item:
                            subject_dict[key] = value
                    ssl_data['subject'] = subject_dict
                
                # Parse issuer
                if 'issuer' in cert:
                    issuer_dict = {}
                    for item in cert['issuer']:
                        for key, value in item:
                            issuer_dict[key] = value
                    ssl_data['issuer'] = issuer_dict
                
                # Parse validity
                if 'notBefore' in cert and 'notAfter' in cert:
                    try:
                        not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
                        not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                        
                        ssl_data['validity'] = {
                            'not_before': not_before.isoformat(),
                            'not_after': not_after.isoformat(),
                            'days_remaining': (not_after - datetime.now()).days,
                            'is_valid': not_before <= datetime.now() <= not_after
                        }
                        
                        # Check expiration
                        if not_after < datetime.now():
                            ssl_data['vulnerabilities'].append({
                                'name': 'Expired Certificate',
                                'severity': 'HIGH',
                                'description': f"Certificate expired on {not_after.isoformat()}"
                            })
                    except Exception as e:
                        logger.debug(f"Date parsing failed: {e}")
                
                # Serial number
                if 'serialNumber' in cert:
                    ssl_data['certificate']['serial_number'] = cert['serialNumber']
            
            conn.close()
            
        except Exception as e:
            logger.error(f"SSL info collection failed: {str(e)}")
            ssl_data['error'] = str(e)
        
        return ssl_data
    
    async def _get_http_headers(self, domain: str, ssl_context) -> Dict:
        """Get HTTP security headers"""
        http_data = {
            'headers': {},
            'security_headers': {},
            'status_code': None,
            'server': None,
            'technologies': []
        }
        
        security_headers = [
            'strict-transport-security',
            'content-security-policy',
            'x-frame-options',
            'x-content-type-options',
            'x-xss-protection',
            'referrer-policy',
        ]
        
        try:
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            async with aiohttp.ClientSession(connector=connector) as session:
                try:
                    async with session.get(f"https://{domain}", timeout=self.timeout) as response:
                        http_data['status_code'] = response.status
                        http_data['headers'] = dict(response.headers)
                        http_data['server'] = response.headers.get('Server')
                        
                        for header in security_headers:
                            if header in response.headers:
                                http_data['security_headers'][header] = response.headers[header]
                        
                        # Detect technologies
                        if http_data['server']:
                            http_data['technologies'].append(http_data['server'].split('/')[0].lower())
                            
                except:
                    # Try HTTP
                    async with session.get(f"http://{domain}", timeout=self.timeout) as response:
                        http_data['status_code'] = response.status
                        http_data['headers'] = dict(response.headers)
                        http_data['server'] = response.headers.get('Server')
                        
                        for header in security_headers:
                            if header in response.headers:
                                http_data['security_headers'][header] = response.headers[header]
                        
                        if http_data['server']:
                            http_data['technologies'].append(http_data['server'].split('/')[0].lower())
                        
        except Exception as e:
            logger.error(f"HTTP headers collection failed: {str(e)}")
            http_data['error'] = str(e)
        
        return http_data
    
    async def _get_crt_sh_data(self, domain: str) -> List[Dict]:
        """Get certificate transparency data"""
        certificates = []
        
        try:
            url = f"https://crt.sh/?q=%.{domain}&output=json"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=self.timeout) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for cert in data[:5]:
                            cert_info = {
                                'issuer_name': cert.get('issuer_name'),
                                'common_name': cert.get('common_name'),
                                'not_before': cert.get('not_before'),
                                'not_after': cert.get('not_after'),
                                'serial_number': cert.get('serial_number'),
                            }
                            certificates.append(cert_info)
                            
        except Exception as e:
            logger.error(f"crt.sh lookup failed: {str(e)}")
        
        return certificates
    
    async def _scan_subdomains(self, domain: str) -> List[str]:
        """Scan for common subdomains"""
        subdomains = []
        
        common_subdomains = ['www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 
                             'pop', 'ns1', 'ns2', 'cpanel', 'whm', 'autodiscover',
                             'autoconfig', 'm', 'imap', 'test', 'blog', 'dev',
                             'api', 'cdn', 'admin', 'forum', 'support']
        
        try:
            tasks = []
            for sub in common_subdomains[:10]:  # Limit for performance
                full_domain = f"{sub}.{domain}"
                tasks.append(self._check_subdomain(full_domain))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, str):
                    subdomains.append(result)
                    
        except Exception as e:
            logger.error(f"Subdomain scan failed: {str(e)}")
        
        return subdomains
    
    async def _check_subdomain(self, full_domain: str) -> Optional[str]:
        """Check if subdomain exists"""
        try:
            loop = asyncio.get_event_loop()
            resolver = dns.resolver.Resolver()
            resolver.timeout = 2
            resolver.lifetime = 2
            
            try:
                await loop.run_in_executor(None, lambda: resolver.resolve(full_domain, 'A'))
                return full_domain
            except:
                pass
        except:
            pass
        
        return None
    
    def _format_date(self, date_val):
        """Format date values"""
        if not date_val:
            return None
        if isinstance(date_val, list):
            date_val = date_val[0]
        if hasattr(date_val, 'isoformat'):
            return date_val.isoformat()
        return str(date_val)
    
    def _calculate_osint_score(self):
        """Calculate OSINT score"""
        score = 0
        
        # WHOIS
        if self.results['whois'] and 'error' not in self.results['whois']:
            whois = self.results['whois']
            if whois.get('domain_name'): score += 5
            if whois.get('registrar'): score += 5
            if whois.get('creation_date'): score += 5
            if whois.get('name_servers'): score += 5
        
        # DNS
        if self.results['dns'] and 'error' not in self.results['dns']:
            dns = self.results['dns']
            if dns.get('a_records'): score += 5
            if dns.get('mx_records'): score += 5
            if dns.get('ns_records'): score += 5
        
        # SSL
        if self.results['ssl'] and 'error' not in self.results['ssl']:
            validity = self.results['ssl'].get('validity', {})
            days = validity.get('days_remaining', 0)
            
            if days > 30:
                score += 15
            elif days > 7:
                score += 10
            elif days > 0:
                score += 5
        
        # HTTP
        if self.results['http'] and 'error' not in self.results['http']:
            security = self.results['http'].get('security_headers', {})
            score += len(security) * 5
        
        self.results['osint_score'] = min(score, 100)
        
        # Trust level
        if self.results['osint_score'] >= 70:
            self.results['trust_level'] = 'HIGH'
        elif self.results['osint_score'] >= 40:
            self.results['trust_level'] = 'MEDIUM'
        else:
            self.results['trust_level'] = 'LOW'
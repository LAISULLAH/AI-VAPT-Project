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
from cryptography import x509
from cryptography.hazmat.backends import default_backend

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OSINTCollector:
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        self.results = {
            'status': 'completed',
            'osint_score': 0,
            'trust_level': 'UNKNOWN',
            'whois': {},
            'dns': {},
            'ssl': {},
            'http': {},
            'certificate_transparency': []
        }
    
    async def collect_osint(self, target: str) -> Dict:
        """Collect all OSINT data for target"""
        try:
            # Remove protocol if present
            target = self._clean_target(target)
            
            # Run OSINT tasks concurrently
            tasks = [
                self._get_whois_info(target),
                self._get_dns_records(target),
                self._get_ssl_info(target),
                self._get_http_headers(target),
                self._get_crt_sh_data(target)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            whois_data, dns_data, ssl_data, http_data, crt_data = results
            
            self.results['whois'] = whois_data if not isinstance(whois_data, Exception) else {'error': str(whois_data)}
            self.results['dns'] = dns_data if not isinstance(dns_data, Exception) else {'error': str(dns_data)}
            self.results['ssl'] = ssl_data if not isinstance(ssl_data, Exception) else {'error': str(ssl_data)}
            self.results['http'] = http_data if not isinstance(http_data, Exception) else {'error': str(http_data)}
            self.results['certificate_transparency'] = crt_data if not isinstance(crt_data, Exception) else []
            
            # Calculate OSINT score and trust level
            self._calculate_osint_score()
            
        except Exception as e:
            logger.error(f"OSINT collection failed: {str(e)}")
            self.results['status'] = 'failed'
            self.results['error'] = str(e)
        
        return self.results
    
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
            # Run WHOIS in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            w = await loop.run_in_executor(None, whois.whois, domain)
            
            whois_data = {
                'domain_name': w.domain_name if hasattr(w, 'domain_name') else None,
                'registrar': w.registrar if hasattr(w, 'registrar') else None,
                'creation_date': self._format_date(w.creation_date),
                'expiration_date': self._format_date(w.expiration_date),
                'updated_date': self._format_date(w.updated_date),
                'name_servers': w.name_servers if hasattr(w, 'name_servers') else [],
                'status': w.status if hasattr(w, 'status') else [],
                'emails': w.emails if hasattr(w, 'emails') else [],
                'organization': w.org if hasattr(w, 'org') else None,
                'country': w.country if hasattr(w, 'country') else None
            }
            
            return whois_data
            
        except Exception as e:
            logger.error(f"WHOIS lookup failed for {domain}: {str(e)}")
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
                            
                except dns.resolver.NoAnswer:
                    continue
                except dns.resolver.NXDOMAIN:
                    continue
                except Exception as e:
                    logger.debug(f"DNS {record_type} lookup failed: {str(e)}")
                    
        except Exception as e:
            logger.error(f"DNS lookup failed: {str(e)}")
            dns_data['error'] = str(e)
        
        return dns_data
    
    async def _get_ssl_info(self, domain: str) -> Dict:
        """Get SSL certificate information"""
        ssl_data = {
            'certificate': {},
            'issuer': {},
            'subject': {},
            'validity': {},
            'extensions': [],
            'vulnerabilities': []
        }
        
        try:
            # Connect to port 443 with SSL
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            loop = asyncio.get_event_loop()
            
            conn = await loop.run_in_executor(
                None,
                lambda: context.wrap_socket(
                    socket.socket(socket.AF_INET),
                    server_hostname=domain
                )
            )
            
            conn.settimeout(self.timeout)
            await loop.run_in_executor(None, conn.connect, (domain, 443))
            
            # Get certificate
            cert_binary = conn.getpeercert(binary_form=True)
            cert = x509.load_der_x509_certificate(cert_binary, default_backend())
            
            # Parse certificate
            ssl_data['certificate'] = {
                'version': cert.version.value,
                'serial_number': str(cert.serial_number),
                'fingerprint_sha256': cert.fingerprint('sha256').hex(),
                'signature_algorithm': cert.signature_algorithm_oid._name
            }
            
            # Issuer
            for attr in cert.issuer:
                ssl_data['issuer'][attr.oid._name] = attr.value
            
            # Subject
            for attr in cert.subject:
                ssl_data['subject'][attr.oid._name] = attr.value
            
            # Validity
            ssl_data['validity'] = {
                'not_before': cert.not_valid_before.isoformat(),
                'not_after': cert.not_valid_after.isoformat(),
                'days_remaining': (cert.not_valid_after - datetime.now()).days
            }
            
            # Extensions
            for ext in cert.extensions:
                ssl_data['extensions'].append({
                    'oid': ext.oid._name,
                    'critical': ext.critical,
                    'value': str(ext.value)
                })
            
            # Check vulnerabilities
            ssl_data['vulnerabilities'] = self._check_ssl_vulns(cert)
            
            conn.close()
            
        except Exception as e:
            logger.error(f"SSL info collection failed: {str(e)}")
            ssl_data['error'] = str(e)
        
        return ssl_data
    
    async def _get_http_headers(self, domain: str) -> Dict:
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
            'permissions-policy',
            'feature-policy'
        ]
        
        try:
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(f"https://{domain}", timeout=self.timeout, ssl=False) as response:
                        http_data['status_code'] = response.status
                        http_data['headers'] = dict(response.headers)
                        http_data['server'] = response.headers.get('Server')
                        
                        # Check security headers
                        for header in security_headers:
                            if header in response.headers:
                                http_data['security_headers'][header] = response.headers[header]
                        
                        # Detect technologies
                        http_data['technologies'] = self._detect_technologies(response.headers)
                        
                except aiohttp.ClientError:
                    # Try HTTP if HTTPS fails
                    async with session.get(f"http://{domain}", timeout=self.timeout) as response:
                        http_data['status_code'] = response.status
                        http_data['headers'] = dict(response.headers)
                        http_data['server'] = response.headers.get('Server')
                        
                        for header in security_headers:
                            if header in response.headers:
                                http_data['security_headers'][header] = response.headers[header]
                        
                        http_data['technologies'] = self._detect_technologies(response.headers)
                        
        except Exception as e:
            logger.error(f"HTTP headers collection failed: {str(e)}")
            http_data['error'] = str(e)
        
        return http_data
    
    async def _get_crt_sh_data(self, domain: str) -> List[Dict]:
        """Get certificate transparency data from crt.sh"""
        certificates = []
        
        try:
            url = f"https://crt.sh/?q=%.{domain}&output=json"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=self.timeout) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for cert in data[:10]:  # Limit to 10 certs
                            cert_info = {
                                'issuer_name': cert.get('issuer_name'),
                                'common_name': cert.get('common_name'),
                                'name_value': cert.get('name_value'),
                                'not_before': cert.get('not_before'),
                                'not_after': cert.get('not_after'),
                                'serial_number': cert.get('serial_number'),
                                'entry_timestamp': cert.get('entry_timestamp')
                            }
                            certificates.append(cert_info)
                            
        except Exception as e:
            logger.error(f"crt.sh lookup failed: {str(e)}")
        
        return certificates
    
    def _format_date(self, date_val):
        """Format date values"""
        if not date_val:
            return None
        if isinstance(date_val, list):
            date_val = date_val[0]
        if hasattr(date_val, 'isoformat'):
            return date_val.isoformat()
        return str(date_val)
    
    def _check_ssl_vulns(self, cert) -> List[Dict]:
        """Check SSL/TLS vulnerabilities"""
        vulns = []
        
        # Check for weak signature algorithm
        if cert.signature_algorithm_oid._name in ['md5WithRSAEncryption', 'sha1WithRSAEncryption']:
            vulns.append({
                'name': 'Weak Signature Algorithm',
                'severity': 'HIGH',
                'description': f"Certificate uses weak signature algorithm: {cert.signature_algorithm_oid._name}"
            })
        
        # Check for short key length
        public_key = cert.public_key()
        if hasattr(public_key, 'key_size'):
            if public_key.key_size < 2048:
                vulns.append({
                    'name': 'Weak Key Length',
                    'severity': 'MEDIUM',
                    'description': f"RSA key length {public_key.key_size} is below 2048 bits"
                })
        
        # Check for expired certificate
        if cert.not_valid_after < datetime.now():
            vulns.append({
                'name': 'Expired Certificate',
                'severity': 'HIGH',
                'description': 'SSL certificate has expired'
            })
        
        return vulns
    
    def _detect_technologies(self, headers: Dict) -> List[str]:
        """Detect web technologies from headers"""
        technologies = []
        
        server = headers.get('Server', '').lower()
        if 'nginx' in server:
            technologies.append('nginx')
        elif 'apache' in server:
            technologies.append('apache')
        elif 'iis' in server:
            technologies.append('iis')
        elif 'cloudflare' in server:
            technologies.append('cloudflare')
        
        if 'x-powered-by' in headers:
            technologies.append(headers['x-powered-by'])
        
        if 'set-cookie' in headers:
            cookie = headers['set-cookie'].lower()
            if 'php' in cookie:
                technologies.append('php')
            if 'asp.net' in cookie:
                technologies.append('asp.net')
        
        return technologies
    
    def _calculate_osint_score(self):
        """Calculate OSINT score and trust level"""
        score = 0
        max_score = 100
        
        # WHOIS completeness (20 points)
        if self.results['whois'] and 'error' not in self.results['whois']:
            whois = self.results['whois']
            if whois.get('domain_name'): score += 5
            if whois.get('registrar'): score += 5
            if whois.get('creation_date'): score += 5
            if whois.get('name_servers'): score += 5
        
        # DNS completeness (20 points)
        if self.results['dns'] and 'error' not in self.results['dns']:
            dns = self.results['dns']
            if dns.get('a_records'): score += 5
            if dns.get('mx_records'): score += 5
            if dns.get('ns_records'): score += 5
            if dns.get('txt_records'): score += 5
        
        # SSL validity (30 points)
        if self.results['ssl'] and 'error' not in self.results['ssl']:
            ssl = self.results['ssl']
            validity = ssl.get('validity', {})
            days = validity.get('days_remaining', 0)
            
            if days > 30:
                score += 15
            elif days > 7:
                score += 10
            elif days > 0:
                score += 5
            
            if not ssl.get('vulnerabilities'):
                score += 15
        
        # HTTP security headers (30 points)
        if self.results['http'] and 'error' not in self.results['http']:
            security = self.results['http'].get('security_headers', {})
            score += len(security) * 5  # 5 points per security header
        
        self.results['osint_score'] = min(score, max_score)
        
        # Determine trust level
        if self.results['osint_score'] >= 80:
            self.results['trust_level'] = 'HIGH'
        elif self.results['osint_score'] >= 50:
            self.results['trust_level'] = 'MEDIUM'
        else:
            self.results['trust_level'] = 'LOW'
import asyncio
import uuid
from datetime import datetime
from typing import Dict, List
import logging
import ssl
import socket
from concurrent.futures import ThreadPoolExecutor

from core.port_scan import port_scan
from core.service_fingerprint import ServiceFingerprinter
from core.cve_correlation import CVECorrelator
from core.osint_logger import OSINTCollector
from core.vuln_scan import vuln_scan
from core.subdomain_enum import enumerate_subdomains
from core.scanner1 import predict_vulnerabilities
from core.ai_engine import generate_attack_explanation
from core.scoring import calculate_risk_score
from core.cdn_waf_detector import detect_cdn_waf
from core.tech_stack_detector import detect_technology
from core.attack_surface_mapper import AttackSurfaceMapper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SCAN_STORE: Dict[str, Dict] = {}


class EnhancedScanManager:

    def __init__(self):
        self.port_scanner = port_scan
        self.fingerprinter = ServiceFingerprinter(timeout=5, max_workers=10)
        self.cve_correlator = CVECorrelator()
        self.osint_collector = OSINTCollector(timeout=10)
        self.attack_surface_mapper = AttackSurfaceMapper(timeout=5)
        self.thread_pool = ThreadPoolExecutor(max_workers=10)

    async def run_comprehensive_scan(self, target: str, scan_id: str):
        result = {
            "scan_id": scan_id,
            "target": target,
            "start_time": datetime.now().isoformat(),
            "port_scan": {},
            "services": [],
            "vulnerabilities": [],
            "osint": {},
            "subdomains": [],
            "web_analysis": {
                "technologies": [],
                "security_headers": {},
                "http_headers": {},
                "server_info": {},
                "cdn_waf": {},
                "attack_surface": []
            },
            "ssl_analysis": {
                "certificates": [],
                "tls_versions": [],
                "issues": []
            },
            "risk_summary": {},
            "attack_vectors": [],
            "attack_explanation": {},
            "recommendations": []
        }

        start_time = datetime.now()
        loop = asyncio.get_event_loop()

        # ---------------- OSINT ----------------
        try:
            osint_data = await self.osint_collector.collect_osint(target)
            result["osint"] = osint_data
        except Exception as e:
            logger.error(f"OSINT failed: {e}")
            result["osint"] = {}

        # ---------------- Subdomains ----------------
        try:
            subdomains = await loop.run_in_executor(
                self.thread_pool,
                enumerate_subdomains,
                target,
                50,  # Increased from 20 to 50 threads
                5    # Increased timeout from 3 to 5 seconds
            )
            result["subdomain_enum"] = subdomains  # Store full result with metadata
            result["subdomains"] = subdomains.get("subdomains", [])  # Keep backward compatibility
        except Exception as e:
            logger.error(f"Subdomain enumeration failed: {e}")
            result["subdomain_enum"] = {"error": str(e)}
            result["subdomains"] = []

        # ---------------- Port Scan ----------------
        try:
            if asyncio.iscoroutinefunction(self.port_scanner):
                port_scan_result = await self.port_scanner(target, ports="1-2000")  # Increased from 1-1000 to 1-2000
            else:
                port_scan_result = await loop.run_in_executor(
                    self.thread_pool,
                    self.port_scanner,
                    target,
                    "1-2000"  # Increased port range
                )
        except Exception as e:
            logger.error(f"Port scan failed: {e}")
            port_scan_result = []

        result["port_scan"] = port_scan_result

        # SAFE open_ports extraction
        if isinstance(port_scan_result, dict):
            open_ports = port_scan_result.get("services") or port_scan_result.get("open_ports", [])
        elif isinstance(port_scan_result, list):
            open_ports = port_scan_result
        else:
            open_ports = []

        # ---------------- Service Fingerprint ----------------
        services = []
        for p in open_ports:
            port = p.get("port") if isinstance(p, dict) else p
            
            try:
                if isinstance(p, dict):
                    fp = await self.fingerprinter.fingerprint_service(target, port)
                    service_entry = {
                        "port": port,
                        "ip": target,
                        **p,
                        **fp
                    }
                    services.append(service_entry)
                else:
                    fp = await self.fingerprinter.fingerprint_service(target, port)
                    service_entry = {
                        "port": port,
                        "ip": target,
                        "service": fp.get("service_name", "unknown"),
                        "state": "open",
                        **fp
                    }
                    services.append(service_entry)
            except Exception as e:
                logger.error(f"Service fingerprint failed for port {port}: {e}")
                if isinstance(p, dict):
                    services.append({
                        "port": port,
                        "service": p.get("service", "unknown"),
                        "state": "open"
                    })
                else:
                    services.append({
                        "port": port,
                        "service": "unknown",
                        "state": "open"
                    })

        result["services"] = services

        # ---------------- Web Analysis (Fixed) ----------------
        web_ports = [80, 443, 8080, 8443, 3000, 5000, 8000]
        web_services = [s for s in services if s.get("port") in web_ports]
        
        if web_services:
            web_analysis = await self._analyze_web(target, web_services)
            result["web_analysis"].update(web_analysis)
            
            # Add attack surface mapping for web services
            try:
                attack_surface = await self.attack_surface_mapper.discover_paths(target, web_services)
                result["web_analysis"]["attack_surface"] = attack_surface
            except Exception as e:
                logger.error(f"Attack surface mapping failed: {e}")

        # ---------------- SSL Analysis (Fixed) ----------------
        ssl_ports = [443, 8443, 465, 993, 995]
        ssl_services = [s for s in services if s.get("port") in ssl_ports]
        
        if ssl_services:
            try:
                ssl_analysis = await self._analyze_ssl(target, ssl_services)
                result["ssl_analysis"] = ssl_analysis
            except Exception as e:
                logger.error(f"SSL analysis failed: {e}")

        # ---------------- CVE Correlation ----------------
        vulns = []
        for s in services:
            name = s.get("service_name") or s.get("service")
            version = s.get("version")
            
            if name and version and name != "unknown":
                try:
                    cves = await self.cve_correlator.correlate_service_cves(name, version)
                    for c in cves[:10]:  # Increased from 5 to 10 CVEs per service
                        vulns.append({
                            "type": "CVE",
                            "id": c.get("id"),
                            "cvss": c.get("cvss"),
                            "severity": self._severity(c.get("cvss")),
                            "description": c.get("description"),
                            "port": s["port"],
                            "service": name
                        })
                except Exception as e:
                    logger.error(f"CVE correlation failed for {name} {version}: {e}")

        # ---------------- Vuln Scan ----------------
        try:
            scan_vulns = await loop.run_in_executor(
                self.thread_pool,
                vuln_scan,
                target,
                services
            )
        except Exception as e:
            logger.error(f"Vulnerability scan failed: {e}")
            scan_vulns = []

        # ---------------- AI Prediction ----------------
        try:
            ai_vulns = predict_vulnerabilities(target, services)
        except Exception as e:
            logger.error(f"AI prediction failed: {e}")
            ai_vulns = []

        all_vulns = vulns + scan_vulns + ai_vulns
        result["vulnerabilities"] = all_vulns

        # ---------------- Risk Summary (Working) ----------------
        try:
            risk_data = calculate_risk_score(result["services"], all_vulns)
            
            result["risk_summary"] = {
                "risk_score": risk_data.get("risk_score", 0),
                "risk_level": risk_data.get("severity", "UNKNOWN"),
                "vulnerability_counts": {
                    "critical": sum(1 for v in all_vulns if v.get("severity", "").upper() == "CRITICAL"),
                    "high": sum(1 for v in all_vulns if v.get("severity", "").upper() == "HIGH"),
                    "medium": sum(1 for v in all_vulns if v.get("severity", "").upper() == "MEDIUM"),
                    "low": sum(1 for v in all_vulns if v.get("severity", "").upper() == "LOW")
                },
                "possible_attacks": risk_data.get("possible_attacks", []),
                "summary": f"Risk Score: {risk_data.get('risk_score', 0)} - {risk_data.get('severity', 'UNKNOWN')} severity"
            }
        except Exception as e:
            logger.error(f"Risk calculation failed: {e}")
            result["risk_summary"] = {
                "risk_score": 0,
                "risk_level": "UNKNOWN",
                "vulnerability_counts": {
                    "critical": sum(1 for v in all_vulns if v.get("severity", "").upper() == "CRITICAL"),
                    "high": sum(1 for v in all_vulns if v.get("severity", "").upper() == "HIGH"),
                    "medium": sum(1 for v in all_vulns if v.get("severity", "").upper() == "MEDIUM"),
                    "low": sum(1 for v in all_vulns if v.get("severity", "").upper() == "LOW")
                },
                "possible_attacks": [],
                "summary": "Risk calculation failed - using fallback counts"
            }

        # ---------------- Attack Vectors ----------------
        try:
            result["attack_vectors"] = self._generate_attack_vectors(services, all_vulns)
        except Exception as e:
            logger.error(f"Attack vector generation failed: {e}")
            result["attack_vectors"] = []

        # ---------------- Attack Explanation ----------------
        try:
            result["attack_explanation"] = generate_attack_explanation(services, all_vulns)
        except Exception as e:
            logger.error(f"Attack explanation failed: {e}")
            result["attack_explanation"] = {}

        # ---------------- Recommendations ----------------
        result["recommendations"] = self._recommendations(services, all_vulns, result["web_analysis"])

        end_time = datetime.now()
        result["end_time"] = end_time.isoformat()
        result["scan_duration"] = (end_time - start_time).total_seconds()

        return result

    async def _analyze_web(self, target, services):
        import aiohttp
        import ssl as ssl_module
        
        result = {
            "technologies": [],
            "security_headers": {},
            "http_headers": {},
            "server_info": {},
            "cdn_waf": {},
            "web_ports_analyzed": []
        }
        
        # Security headers to check
        security_header_map = {
            "strict-transport-security": "hsts",
            "content-security-policy": "csp",
            "x-frame-options": "xfo",
            "x-content-type-options": "xcto",
            "x-xss-protection": "xxssp",
            "referrer-policy": "referrer_policy",
            "permissions-policy": "permissions_policy"
        }
        
        # Technology detection patterns
        tech_patterns = {
            "nginx": ["nginx", "Server: nginx"],
            "apache": ["apache", "Server: Apache"],
            "iis": ["iis", "Server: Microsoft-IIS"],
            "cloudflare": ["cloudflare", "CF-RAY"],
            "wordpress": ["wordpress", "wp-content", "wp-includes"],
            "drupal": ["drupal", "Drupal"],
            "joomla": ["joomla", "Joomla"],
            "laravel": ["laravel", "Laravel"],
            "php": ["php", "X-Powered-By: PHP"],
            "python": ["python", "WSGI", "Django"],
            "node.js": ["node.js", "Express"],
            "ruby": ["ruby", "Rails"],
            "java": ["java", "JSESSIONID", "Servlet"]
        }
        
        for s in services:
            port = s["port"]
            protocol = "https" if port in [443, 8443] else "http"
            url = f"{protocol}://{target}:{port}" if port not in [80, 443] else f"{protocol}://{target}"
            
            web_info = {
                "port": port,
                "url": url,
                "headers": {},
                "technologies_found": [],
                "status_code": None
            }
            
            try:
                ssl_context = ssl_module.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl_module.CERT_NONE
                
                connector = aiohttp.TCPConnector(ssl=ssl_context)
                async with aiohttp.ClientSession(connector=connector) as session:
                    async with session.get(url, timeout=10, allow_redirects=True, ssl=False) as resp:
                        headers = dict(resp.headers)
                        web_info["headers"] = headers
                        web_info["status_code"] = resp.status
                        
                        # Store headers for reference
                        result["http_headers"][f"port_{port}"] = headers
                        
                        # EXTRACT SERVER INFO AND TECHNOLOGIES
                        if "server" in headers:
                            server = headers["server"]
                            web_info["technologies_found"].append(f"Server: {server}")
                            result["server_info"]["server_header"] = server
                            
                            # Extract technology from Server header
                            server_lower = server.lower()
                            if "nginx" in server_lower:
                                result["technologies"].append("nginx")
                                web_info["technologies_found"].append("nginx")
                            elif "apache" in server_lower:
                                result["technologies"].append("apache")
                                web_info["technologies_found"].append("apache")
                            elif "iis" in server_lower:
                                result["technologies"].append("iis")
                                web_info["technologies_found"].append("iis")
                            elif "cloudflare" in server_lower:
                                result["technologies"].append("cloudflare")
                                web_info["technologies_found"].append("cloudflare")
                        
                        # Extract from X-Powered-By
                        if "x-powered-by" in headers:
                            powered_by = headers["x-powered-by"]
                            web_info["technologies_found"].append(f"X-Powered-By: {powered_by}")
                            result["technologies"].append(powered_by)
                            
                            # Check for PHP, ASP.NET, etc.
                            if "php" in powered_by.lower():
                                result["technologies"].append("php")
                            elif "asp.net" in powered_by.lower():
                                result["technologies"].append("asp.net")
                        
                        # Extract from cookies
                        if "set-cookie" in headers:
                            cookies = headers["set-cookie"]
                            if "PHPSESSID" in cookies:
                                result["technologies"].append("php")
                                web_info["technologies_found"].append("php (PHPSESSID)")
                            if "JSESSIONID" in cookies:
                                result["technologies"].append("java")
                                web_info["technologies_found"].append("java (JSESSIONID)")
                            if "laravel_session" in cookies.lower():
                                result["technologies"].append("laravel")
                                web_info["technologies_found"].append("laravel")
                        
                        # CHECK SECURITY HEADERS
                        for header, key in security_header_map.items():
                            if header in headers:
                                result["security_headers"][key] = {
                                    "present": True,
                                    "value": headers[header]
                                }
                                web_info.setdefault("security_headers_detected", []).append(header)
                        
                        # DETECT CDN/WAF
                        try:
                            cdn_waf_info = detect_cdn_waf(headers)
                            if cdn_waf_info:
                                result["cdn_waf"] = cdn_waf_info
                                web_info["cdn_waf_detected"] = cdn_waf_info
                                
                                # Add CDN as technology if detected
                                if cdn_waf_info.get("cdn"):
                                    result["technologies"].append(cdn_waf_info["cdn"])
                        except Exception as e:
                            logger.error(f"CDN/WAF detection failed: {e}")
                        
                        # Get page content for additional tech detection
                        if resp.status == 200:
                            try:
                                text = await resp.text()
                                text_lower = text.lower()
                                
                                # Check HTML for technology indicators
                                if "wp-content" in text_lower or "wp-includes" in text_lower:
                                    result["technologies"].append("wordpress")
                                    web_info["technologies_found"].append("wordpress")
                                if "drupal" in text_lower:
                                    result["technologies"].append("drupal")
                                    web_info["technologies_found"].append("drupal")
                                if "joomla" in text_lower:
                                    result["technologies"].append("joomla")
                                    web_info["technologies_found"].append("joomla")
                                if "laravel" in text_lower:
                                    result["technologies"].append("laravel")
                                    web_info["technologies_found"].append("laravel")
                                if "csrf_token" in text_lower and "django" in text_lower:
                                    result["technologies"].append("django")
                                    web_info["technologies_found"].append("django")
                                if "react" in text_lower or "reactjs" in text_lower:
                                    result["technologies"].append("react")
                                    web_info["technologies_found"].append("react")
                                if "vue" in text_lower or "vue.js" in text_lower:
                                    result["technologies"].append("vue")
                                    web_info["technologies_found"].append("vue")
                                if "angular" in text_lower:
                                    result["technologies"].append("angular")
                                    web_info["technologies_found"].append("angular")
                            except:
                                pass
                        
            except aiohttp.ClientError as e:
                web_info["error"] = str(e)
                logger.error(f"Web analysis failed for {url}: {e}")
            except Exception as e:
                web_info["error"] = str(e)
                logger.error(f"Unexpected error in web analysis for {url}: {e}")
            
            result["web_ports_analyzed"].append(web_info)
        
        # Remove duplicates from technologies list
        result["technologies"] = list(set(result["technologies"]))
        
        # Calculate security headers summary
        result["security_headers_summary"] = {
            "total_detected": len(result["security_headers"]),
            "headers_present": list(result["security_headers"].keys()),
            "missing_critical": self._check_missing_security_headers(result["security_headers"])
        }
        
        return result

    async def _analyze_ssl(self, target, services):
        import ssl as ssl_module
        import socket
        from datetime import datetime
        import OpenSSL
        import certifi
        
        result = {
            "certificates": [],
            "ssl_ports_analyzed": [],
            "tls_versions": [],
            "issues": []
        }
        
        for s in services:
            port = s["port"]
            ssl_info = {
                "port": port,
                "certificate": {},
                "tls_version": None,
                "cipher": None,
                "errors": []
            }
            
            try:
                # Create SSL context
                context = ssl_module.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl_module.CERT_NONE
                
                # Establish SSL connection
                with socket.create_connection((target, port), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=target) as ssock:
                        
                        # GET TLS VERSION
                        tls_version = ssock.version()
                        ssl_info["tls_version"] = tls_version
                        if tls_version not in result["tls_versions"]:
                            result["tls_versions"].append(tls_version)
                        
                        # GET CIPHER
                        cipher = ssock.cipher()
                        if cipher:
                            ssl_info["cipher"] = {
                                "name": cipher[0],
                                "protocol": cipher[1],
                                "bits": cipher[2]
                            }
                        
                        # GET CERTIFICATE
                        cert_binary = ssock.getpeercert(binary_form=True)
                        if cert_binary:
                            # Use cryptography to parse certificate details
                            from cryptography import x509
                            from cryptography.hazmat.backends import default_backend
                            
                            cert = x509.load_der_x509_certificate(cert_binary, default_backend())
                            
                            # Extract subject
                            subject_parts = []
                            for attribute in cert.subject:
                                subject_parts.append(f"{attribute.oid._name}={attribute.value}")
                            subject_str = ", ".join(subject_parts)
                            
                            # Extract issuer
                            issuer_parts = []
                            for attribute in cert.issuer:
                                issuer_parts.append(f"{attribute.oid._name}={attribute.value}")
                            issuer_str = ", ".join(issuer_parts)
                            
                            # Get validity dates
                            not_before = cert.not_valid_before
                            not_after = cert.not_valid_after
                            
                            # Calculate days until expiry
                            days_until_expiry = (not_after - datetime.now()).days
                            
                            cert_info = {
                                "subject": subject_str,
                                "issuer": issuer_str,
                                "version": cert.version.value,
                                "serialNumber": hex(cert.serial_number),
                                "notBefore": not_before.isoformat(),
                                "notAfter": not_after.isoformat(),
                                "signature_algorithm": cert.signature_algorithm_oid._name,
                                "expiry_days": days_until_expiry
                            }
                            
                            # Get SAN extensions
                            try:
                                san_ext = cert.extensions.get_extension_for_oid(x509.oid.ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
                                if san_ext:
                                    san = san_ext.value
                                    cert_info["subjectAltName"] = [str(dns) for dns in san.get_values_for_type(x509.DNSName)]
                            except:
                                pass
                            
                            ssl_info["certificate"] = cert_info
                            result["certificates"].append(cert_info)
                            
                            # Check for issues
                            if days_until_expiry < 0:
                                result["issues"].append({
                                    "port": port,
                                    "issue": "Certificate EXPIRED",
                                    "days_expired": abs(days_until_expiry)
                                })
                            elif days_until_expiry < 30:
                                result["issues"].append({
                                    "port": port,
                                    "issue": "Certificate expiring soon",
                                    "days_left": days_until_expiry
                                })
                            
                            # Check for weak TLS versions
                            if tls_version in ["TLSv1", "TLSv1.1", "SSLv3"]:
                                result["issues"].append({
                                    "port": port,
                                    "issue": f"Weak TLS/SSL version: {tls_version}"
                                })
                            
            except socket.timeout:
                ssl_info["errors"].append("Connection timeout")
                result["issues"].append({"port": port, "issue": "SSL connection timeout"})
            except ssl_module.SSLError as e:
                ssl_info["errors"].append(f"SSL error: {str(e)}")
                result["issues"].append({"port": port, "issue": f"SSL error: {str(e)}"})
            except ImportError:
                # Fallback if cryptography is not available
                ssl_info["errors"].append("Cryptography library not available")
                # Try basic SSL info without full parsing
                try:
                    with socket.create_connection((target, port), timeout=10) as sock:
                        with context.wrap_socket(sock, server_hostname=target) as ssock:
                            cert = ssock.getpeercert()
                            if cert:
                                ssl_info["certificate"] = {
                                    "subject": str(cert.get("subject", "")),
                                    "issuer": str(cert.get("issuer", "")),
                                    "notAfter": cert.get("notAfter", "")
                                }
                except:
                    pass
            except Exception as e:
                ssl_info["errors"].append(f"Unexpected error: {str(e)}")
                result["issues"].append({"port": port, "issue": f"Unexpected error: {str(e)}"})
            
            result["ssl_ports_analyzed"].append(ssl_info)
        
        return result

    def _check_missing_security_headers(self, present_headers):
        """Check which critical security headers are missing"""
        critical_headers = ['hsts', 'xfo', 'xcto', 'csp']
        missing = []
        
        for header in critical_headers:
            if header not in present_headers:
                missing.append(header)
        
        return missing

    def _generate_attack_vectors(self, services, vulnerabilities):
        """Generate attack surface information based on open services"""
        attack_vectors = []
        
        # Common port to attack vector mapping
        port_attack_map = {
            21: {"vector": "FTP", "description": "File Transfer Protocol - Anonymous login, clear text credentials", "risk": "MEDIUM"},
            22: {"vector": "SSH", "description": "Secure Shell - Brute force, weak cipher suites, outdated versions", "risk": "MEDIUM"},
            23: {"vector": "Telnet", "description": "Telnet - Clear text communication, default credentials", "risk": "HIGH"},
            25: {"vector": "SMTP", "description": "Simple Mail Transfer Protocol - Open relay, user enumeration", "risk": "MEDIUM"},
            53: {"vector": "DNS", "description": "Domain Name System - Zone transfer, cache poisoning", "risk": "MEDIUM"},
            80: {"vector": "HTTP", "description": "Hypertext Transfer Protocol - Web application attacks, directory traversal", "risk": "HIGH"},
            443: {"vector": "HTTPS", "description": "HTTP over TLS - Web application attacks, SSL/TLS vulnerabilities", "risk": "HIGH"},
            445: {"vector": "SMB", "description": "Server Message Block - EternalBlue, null sessions", "risk": "CRITICAL"},
            3306: {"vector": "MySQL", "description": "MySQL Database - Default credentials, SQL injection", "risk": "HIGH"},
            3389: {"vector": "RDP", "description": "Remote Desktop Protocol - BlueKeep, credential harvesting", "risk": "CRITICAL"},
            5432: {"vector": "PostgreSQL", "description": "PostgreSQL Database - Default credentials, SQL injection", "risk": "HIGH"},
            27017: {"vector": "MongoDB", "description": "MongoDB Database - NoSQL injection, default config", "risk": "HIGH"},
            6379: {"vector": "Redis", "description": "Redis Database - Unauthenticated access, RCE", "risk": "HIGH"},
            9200: {"vector": "Elasticsearch", "description": "Elasticsearch - Unauthenticated access, data exposure", "risk": "MEDIUM"},
            8080: {"vector": "HTTP-Alt", "description": "Alternative HTTP port - Web application attacks", "risk": "HIGH"},
            8443: {"vector": "HTTPS-Alt", "description": "Alternative HTTPS port - Web application attacks", "risk": "HIGH"}
        }
        
        # Track which ports we've already processed
        processed_ports = set()
        
        for service in services:
            port = service.get("port")
            if not port or port in processed_ports:
                continue
                
            processed_ports.add(port)
            service_name = service.get("service_name") or service.get("service", "unknown")
            
            # Get attack vector from mapping or create generic one
            if port in port_attack_map:
                vector_info = port_attack_map[port].copy()
                vector_info["port"] = port
                vector_info["service"] = service_name
                
                # Check for version-specific vulnerabilities
                version = service.get("version")
                if version:
                    vector_info["version"] = version
                    
                    # Find vulnerabilities affecting this service
                    service_vulns = [v for v in vulnerabilities if v.get("port") == port]
                    if service_vulns:
                        vector_info["known_vulnerabilities"] = len(service_vulns)
                        vector_info["critical_vulns"] = sum(1 for v in service_vulns if v.get("severity") == "CRITICAL")
            else:
                # Generic attack vector for unknown services
                vector_info = {
                    "port": port,
                    "vector": f"Service-{service_name.upper()}",
                    "service": service_name,
                    "description": f"Unknown service on port {port} - Requires further investigation",
                    "risk": "UNKNOWN"
                }
            
            attack_vectors.append(vector_info)
        
        # Sort by risk level
        risk_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "UNKNOWN": 4}
        attack_vectors.sort(key=lambda x: risk_order.get(x.get("risk", "UNKNOWN"), 5))
        
        return attack_vectors

    def _severity(self, cvss):
        if not cvss:
            return "LOW"
        
        try:
            cvss = float(cvss)
            if cvss >= 9.0:
                return "CRITICAL"
            elif cvss >= 7.0:
                return "HIGH"
            elif cvss >= 4.0:
                return "MEDIUM"
            else:
                return "LOW"
        except (ValueError, TypeError):
            return "LOW"

    def _recommendations(self, services, vulnerabilities, web_analysis):
        """Generate comprehensive recommendations"""
        rec = []
        
        # Service-specific recommendations
        for s in services:
            port = s["port"]
            
            if port == 21:
                rec.append("Disable FTP and use SFTP or FTPS instead")
                rec.append("Implement strong password policies for FTP users")
            
            elif port == 22:
                rec.append("Disable SSH password authentication and use key-based authentication")
                rec.append("Use strong encryption algorithms for SSH")
                rec.append("Consider changing default SSH port")
            
            elif port == 23:
                rec.append("Disable Telnet immediately and use SSH instead")
            
            elif port == 25:
                rec.append("Configure SMTP authentication to prevent open relay")
                rec.append("Implement TLS for SMTP communications")
            
            elif port == 80:
                rec.append("Redirect all HTTP traffic to HTTPS")
                rec.append("Implement HSTS header with a long max-age")
            
            elif port == 443:
                rec.append("Enable strong TLS configuration (disable SSLv3, TLSv1.0, TLSv1.1)")
                rec.append("Use strong cipher suites with forward secrecy")
                rec.append("Implement proper certificate management and auto-renewal")
            
            elif port == 445:
                rec.append("Disable SMBv1 protocol immediately")
                rec.append("Implement SMB signing")
                rec.append("Restrict SMB access to trusted networks only")
            
            elif port == 3306:
                rec.append("Change default MySQL root password")
                rec.append("Bind MySQL to localhost only if remote access not required")
                rec.append("Use SSL for MySQL connections")
            
            elif port == 3389:
                rec.append("Disable RDP if not required")
                rec.append("Use Network Level Authentication (NLA)")
                rec.append("Implement account lockout policies")
        
        # Web security recommendations based on missing headers
        if web_analysis.get("security_headers_summary"):
            missing = web_analysis["security_headers_summary"].get("missing_critical", [])
            
            if "hsts" in missing:
                rec.append("Implement HSTS (Strict-Transport-Security) header to enforce HTTPS")
            if "xfo" in missing:
                rec.append("Add X-Frame-Options header to prevent clickjacking")
            if "xcto" in missing:
                rec.append("Add X-Content-Type-Options: nosniff header")
            if "csp" in missing:
                rec.append("Implement Content-Security-Policy header to prevent XSS")
        
        # Vulnerability-based recommendations
        critical_vulns = [v for v in vulnerabilities if v.get("severity") == "CRITICAL"]
        if critical_vulns:
            rec.append(f"URGENT: Address {len(critical_vulns)} critical vulnerabilities immediately")
        
        high_vulns = [v for v in vulnerabilities if v.get("severity") == "HIGH"]
        if high_vulns:
            rec.append(f"Address {len(high_vulns)} high-severity vulnerabilities as soon as possible")
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recs = []
        for r in rec:
            if r not in seen:
                seen.add(r)
                unique_recs.append(r)
        
        return unique_recs


# -------- PUBLIC API --------
def start_scan(target: str):
    scan_id = str(uuid.uuid4())
    SCAN_STORE[scan_id] = {
        "scan_id": scan_id,
        "target": target,
        "status": "running",
        "start_time": datetime.now().isoformat()
    }
    return scan_id

async def run_scan(scan_id: str, target: str):
    manager = EnhancedScanManager()
    result = await manager.run_comprehensive_scan(target, scan_id)
    
    SCAN_STORE[scan_id]["status"] = "completed"
    SCAN_STORE[scan_id]["result"] = result
    SCAN_STORE[scan_id]["end_time"] = datetime.now().isoformat()
    
    return result

def get_scan_status(scan_id: str):
    """Get scan status by ID"""
    return SCAN_STORE.get(scan_id, {"error": "Scan not found"})

def list_scans():
    """List all scans"""
    return {
        scan_id: {
            "target": data["target"],
            "status": data["status"],
            "start_time": data.get("start_time"),
            "end_time": data.get("end_time")
        }
        for scan_id, data in SCAN_STORE.items()
    }
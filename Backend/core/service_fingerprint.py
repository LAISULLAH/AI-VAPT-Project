import socket
import ssl
import asyncio
import aiohttp
from typing import Dict, List, Optional, Tuple
import re
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ServiceFingerprinter:
    def __init__(self, timeout: int = 5, max_workers: int = 10):  # 🔥 FIXED: Added max_workers parameter
        self.timeout = timeout
        self.max_workers = max_workers  # Store it for potential use
        self.banner_patterns = {
            'ssh': re.compile(r'SSH-(\d+\.\d+)-([^\s]+)'),
            'http': re.compile(r'Server:\s*(.+)', re.IGNORECASE),
            'ftp': re.compile(r'220.*FTP.*|220.*vsFTPd.*', re.IGNORECASE),
            'mysql': re.compile(r'mysql|MariaDB', re.IGNORECASE),
            'postgresql': re.compile(r'PostgreSQL', re.IGNORECASE),
        }

    # 🔥 REST OF YOUR CODE REMAINS EXACTLY THE SAME
    async def fingerprint_service(self, ip: str, port: int, protocol: str = 'tcp') -> Dict:
        """Fingerprint a single service on given IP and port"""
        try:
            # Try TCP banner grabbing first
            banner = await self._grab_tcp_banner(ip, port)
            
            # Special handling for HTTP/HTTPS
            if port in [80, 443, 8080, 8443]:
                return await self._fingerprint_http(ip, port, banner)
            
            # Parse banner for other services
            service_info = self._parse_banner(banner, port)
            
            # Enhanced SSH detection
            if port == 22 or service_info.get('service_name') == 'ssh':
                ssh_info = await self._fingerprint_ssh(ip, port)
                service_info.update(ssh_info)
            
            return service_info
            
        except Exception as e:
            logger.error(f"Error fingerprinting {ip}:{port}: {str(e)}")
            return {
                'port': port,
                'service_name': 'unknown',
                'version': None,
                'protocol': protocol,
                'banner': None,
                'cves': [],
                'exploit_weight': 0
            }

    async def _grab_tcp_banner(self, ip: str, port: int) -> Optional[str]:
        """Grab TCP banner with timeout"""
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(ip, port),
                timeout=self.timeout
            )
            
            # Send generic probe for services that need prompting
            if port in [21, 25, 110, 143, 993, 995]:  # FTP, SMTP, POP3, IMAP
                writer.write(b"HELP\r\n")
            elif port == 22:  # SSH
                pass  # SSH sends banner automatically
            elif port in [80, 443, 8080, 8443]:  # HTTP/HTTPS
                writer.write(b"HEAD / HTTP/1.0\r\n\r\n")
            
            await writer.drain()
            
            banner = await asyncio.wait_for(
                reader.read(1024),
                timeout=self.timeout
            )
            
            writer.close()
            await writer.wait_closed()
            
            return banner.decode('utf-8', errors='ignore').strip()
            
        except asyncio.TimeoutError:
            logger.debug(f"Banner grab timeout for {ip}:{port}")
            return None
        except Exception as e:
            logger.debug(f"Banner grab failed for {ip}:{port}: {str(e)}")
            return None

    async def _fingerprint_http(self, ip: str, port: int, initial_banner: Optional[str] = None) -> Dict:
        """Enhanced HTTP fingerprinting with version detection"""
        service_info = {
            'port': port,
            'service_name': 'http' if port != 443 else 'https',
            'version': None,
            'server_header': None,
            'cves': [],
            'exploit_weight': 0
        }
        
        try:
            protocol = 'https' if port in [443, 8443] else 'http'
            url = f"{protocol}://{ip}:{port}"
            
            # Configure SSL context for HTTPS
            ssl_context = None
            if protocol == 'https':
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
            
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(url, ssl=ssl_context, timeout=self.timeout) as response:
                        # Extract Server header
                        server = response.headers.get('Server', '')
                        service_info['server_header'] = server
                        
                        # Parse version from Server header
                        version_info = self._parse_http_version(server)
                        service_info.update(version_info)
                        
                        # Get additional HTTP info
                        service_info['headers'] = dict(response.headers)
                        
                except aiohttp.ClientError as e:
                    logger.debug(f"HTTP request failed for {url}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"HTTP fingerprinting failed for {ip}:{port}: {str(e)}")
        
        return service_info

    async def _fingerprint_ssh(self, ip: str, port: int) -> Dict:
        """Enhanced SSH fingerprinting"""
        ssh_info = {'service_name': 'openssh', 'version': None}
        
        try:
            banner = await self._grab_tcp_banner(ip, port)
            if banner:
                # Parse SSH banner: SSH-2.0-OpenSSH_9.6
                match = re.search(r'SSH-\d+\.\d+-([^\s]+)', banner)
                if match:
                    ssh_string = match.group(1)
                    if '_' in ssh_string:
                        ssh_name, ssh_version = ssh_string.split('_', 1)
                        ssh_info['service_name'] = ssh_name.lower()
                        ssh_info['version'] = ssh_version
        except Exception as e:
            logger.error(f"SSH fingerprinting failed: {str(e)}")
        
        return ssh_info

    def _parse_http_version(self, server_header: str) -> Dict:
        """Parse version information from HTTP Server header"""
        result = {'service_name': 'http', 'version': None}
        
        if not server_header:
            return result
        
        # Common web servers patterns
        patterns = {
            'nginx': r'nginx/(\d+\.\d+\.\d+)',
            'apache': r'Apache(?:/(\d+\.\d+\.\d+))?',
            'iis': r'Microsoft-IIS/(\d+\.\d+)',
            'openresty': r'openresty/(\d+\.\d+\.\d+)',
            'caddy': r'Caddy/(\d+\.\d+\.\d+)',
            'gunicorn': r'gunicorn/(\d+\.\d+\.\d+)',
        }
        
        for server, pattern in patterns.items():
            match = re.search(pattern, server_header, re.IGNORECASE)
            if match:
                result['service_name'] = server
                result['version'] = match.group(1) if match.groups() else None
                break
        
        return result

    def _parse_banner(self, banner: Optional[str], port: int) -> Dict:
        """Parse generic banner for service identification"""
        service_info = {
            'port': port,
            'service_name': self._guess_service_from_port(port),
            'version': None,
            'banner': banner
        }
        
        if not banner:
            return service_info
        
        # Try to extract version from banner
        for service, pattern in self.banner_patterns.items():
            match = pattern.search(banner)
            if match:
                service_info['service_name'] = service
                if match.groups():
                    service_info['version'] = match.group(1)
                break
        
        return service_info

    def _guess_service_from_port(self, port: int) -> str:
        """Guess service from well-known port"""
        common_ports = {
            21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp',
            53: 'dns', 80: 'http', 110: 'pop3', 111: 'rpcbind',
            135: 'msrpc', 139: 'netbios-ssn', 143: 'imap',
            443: 'https', 445: 'microsoft-ds', 993: 'imaps',
            995: 'pop3s', 1723: 'pptp', 3306: 'mysql',
            3389: 'rdp', 5432: 'postgresql', 5900: 'vnc',
            6379: 'redis', 27017: 'mongodb', 8080: 'http-proxy',
        }
        return common_ports.get(port, 'unknown')
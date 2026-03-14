"""
Fixed Service Fingerprinting Engine
- Proper IP handling
- Host header support
- Clean version extraction
- Safe TLS handling
"""

import socket
import ssl
import requests
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


class ServiceFingerprinter:

    def __init__(self, timeout=5, max_workers=20):
        self.timeout = timeout
        self.max_workers = max_workers

    # ==============================
    # PUBLIC ENTRY
    # ==============================

    def fingerprint(self, open_ports_list, target_host=None):
        """
        open_ports_list must contain:
        {
            "ip": "1.2.3.4",
            "port": 80,
            "service": "http"
        }
        """

        if not open_ports_list:
            return []

        enriched = []

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = [
                executor.submit(self._fingerprint_one, entry, target_host)
                for entry in open_ports_list
            ]

            for future in as_completed(futures):
                result = future.result()
                if result:
                    enriched.append(result)

        return enriched

    # ==============================
    # SINGLE SERVICE FINGERPRINT
    # ==============================

    def _fingerprint_one(self, entry, target_host):

        ip = entry.get("ip")
        port = entry.get("port")
        service_guess = entry.get("service", "unknown")

        if not ip:
            # Cannot fingerprint without IP
            return entry

        result = entry.copy()
        result["service_name"] = service_guess.lower()
        result["version"] = None
        result["banner"] = None
        result["http_headers"] = None
        result["ssl_cert"] = None

        try:
            # SSH fingerprint
            if port == 22 or service_guess.lower() == "ssh":
                ssh_version = self._fingerprint_ssh(ip, port)
                if ssh_version:
                    result["service_name"] = "ssh"
                    result["version"] = ssh_version
                return result

            # HTTP / HTTPS fingerprint
            if port in [80, 443, 8080, 8443] or service_guess.lower() in ["http", "https"]:
                http_info = self._fingerprint_http(ip, port, target_host)
                if http_info:
                    result["http_headers"] = http_info["headers"]

                    server = http_info.get("server")
                    if server:
                        svc, ver = self._parse_server_header(server)
                        if svc:
                            result["service_name"] = svc
                        if ver:
                            result["version"] = self._normalize_version(ver)

                # SSL certificate
                if port in [443, 8443]:
                    ssl_info = self._get_ssl_cert(ip, port, target_host)
                    if ssl_info:
                        result["ssl_cert"] = ssl_info

                return result

            # Generic banner grab (non-TLS ports)
            banner = self._grab_banner(ip, port)
            if banner:
                result["banner"] = banner
                svc, ver = self._parse_banner(banner)
                if svc:
                    result["service_name"] = svc
                if ver:
                    result["version"] = self._normalize_version(ver)

        except Exception:
            pass

        return result

    # ==============================
    # PROTOCOL HANDLERS
    # ==============================

    def _grab_banner(self, ip, port):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            sock.connect((ip, port))
            banner = sock.recv(1024).decode(errors="ignore").strip()
            sock.close()
            return banner if banner else None
        except:
            return None

    def _fingerprint_http(self, ip, port, host):
        try:
            scheme = "https" if port in [443, 8443] else "http"

            # Prefer domain for SNI
            if host:
                url = f"{scheme}://{host}"
            else:
                url = f"{scheme}://{ip}:{port}"

            resp = requests.get(
                url,
                timeout=self.timeout,
                verify=False,
                allow_redirects=False,
                headers={"User-Agent": "Mozilla/5.0"}
            )

            return {
                "headers": dict(resp.headers),
                "server": resp.headers.get("Server")
            }

        except:
            return None

    def _fingerprint_ssh(self, ip, port):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            sock.connect((ip, port))
            banner = sock.recv(1024).decode(errors="ignore").strip()
            sock.close()

            if banner.startswith("SSH-"):
                match = re.search(r'OpenSSH[_\-]?([\d\.]+)', banner)
                if match:
                    return match.group(1)

                # fallback generic version match
                version_match = re.search(r'(\d+\.\d+)', banner)
                if version_match:
                    return version_match.group(1)

            return None
        except:
            return None

    def _get_ssl_cert(self, ip, port, host):
        try:
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE

            server_hostname = host if host else ip

            with socket.create_connection((ip, port), timeout=self.timeout) as sock:
                with context.wrap_socket(sock, server_hostname=server_hostname) as ssock:
                    cert = ssock.getpeercert()

                    if not cert:
                        return None

                    subject = dict(x[0] for x in cert.get("subject", []))
                    issuer = dict(x[0] for x in cert.get("issuer", []))

                    return {
                        "subject": subject.get("commonName"),
                        "issuer": issuer.get("commonName"),
                        "notBefore": cert.get("notBefore"),
                        "notAfter": cert.get("notAfter")
                    }

        except:
            return None

    # ==============================
    # PARSERS
    # ==============================

    def _parse_banner(self, banner):
        banner_lower = banner.lower()

        service = None
        if "openssh" in banner_lower:
            service = "ssh"
        elif "apache" in banner_lower:
            service = "apache"
        elif "nginx" in banner_lower:
            service = "nginx"
        elif "iis" in banner_lower:
            service = "iis"
        elif "ftp" in banner_lower:
            service = "ftp"

        version_match = re.search(r'(\d+\.\d+(?:\.\d+)?)', banner)
        version = version_match.group(1) if version_match else None

        return service, version

    def _parse_server_header(self, header):
        if "/" in header:
            svc, ver = header.split("/", 1)
            return svc.lower(), ver.split(" ")[0]
        return None, None

    def _normalize_version(self, version):
        parts = version.split(".")
        if len(parts) >= 2:
            return f"{parts[0]}.{parts[1]}"
        return version
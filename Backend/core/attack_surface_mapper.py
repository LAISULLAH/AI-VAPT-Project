import aiohttp
import asyncio
import logging
from typing import List, Dict
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

class AttackSurfaceMapper:
    """Discovers common sensitive paths and endpoints"""
    
    def __init__(self, timeout=5, max_concurrent=10):
        self.timeout = timeout
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        
        # Common sensitive paths to check
        self.common_paths = [
            # Admin panels
            "/admin", "/administrator", "/admin.php", "/admin/", "/admin/login",
            "/wp-admin", "/wp-admin/", "/wp-login.php", "/dashboard", "/panel",
            "/cpanel", "/cp", "/controlpanel", "/manage", "/manager", "/management",
            "/backend", "/backoffice", "/adminarea", "/admin-panel",
            
            # Login pages
            "/login", "/login.php", "/signin", "/sign-in", "/auth", "/authenticate",
            "/user/login", "/user/signin", "/account/login", "/account/signin",
            "/log-in", "/logon", "/sign-on", "/signon",
            
            # API endpoints
            "/api", "/api/", "/api/v1", "/api/v2", "/api/v3", "/graphql",
            "/rest", "/rest-api", "/rest/v1", "/soap", "/ws", "/webservice",
            "/swagger", "/swagger-ui", "/api-docs", "/docs", "/redoc",
            
            # Development/Staging
            "/dev", "/development", "/staging", "/test", "/testing", "/sandbox",
            "/beta", "/alpha", "/demo", "/stage", "/stg", "/uat",
            
            # Configuration files
            "/.git", "/.git/config", "/.env", "/.env.example", "/.env.local",
            "/.env.production", "/.env.development", "/config.php", "/configuration.php",
            "/wp-config.php", "/.htaccess", "/.htpasswd", "/web.config",
            "/app.config", "/application.config", "/config.json", "/settings.json",
            
            # Backup files
            "/backup", "/backups", "/bak", "/backup.zip", "/backup.tar.gz",
            "/db_backup.sql", "/database.sql", "/dump.sql", "/backup.sql",
            "/.backup", "/.bak", "/~", "/.swp", "/.swo",
            
            # Upload directories
            "/uploads", "/upload", "/files", "/media", "/images", "/img",
            "/assets/uploads", "/content/uploads", "/wp-content/uploads",
            
            # Sensitive directories
            "/private", "/secure", "/restricted", "/hidden", "/secret",
            "/internal", "/staff", "/employee", "/corp", "/company",
            
            # Debug information
            "/phpinfo.php", "/info.php", "/phpinfo", "/server-info",
            "/server-status", "/status", "/debug", "/_debug",
            
            # Common CMS paths
            "/wp-content", "/wp-includes", "/wp-json", "/wp-json/wp/v2",
            "/sites/default/files", "/sites/all", "/modules", "/themes",
            "/joomla", "/drupal", "/magento", "/shop", "/store",
            
            # File inclusion vulnerabilities
            "/index.php", "/index.php?page=", "/page.php", "/include.php",
            "/inc", "/includes", "/lib", "/library", "/vendor",
            
            # Database interfaces
            "/phpmyadmin", "/phpPgAdmin", "/phpMyAdmin", "/myadmin",
            "/pma", "/adminer", "/sqladmin", "/dbadmin", "/database-admin",
            
            # Old versions
            "/old", "/v1", "/v2", "/archive", "/previous", "/legacy",
            
            # Common web shells
            "/shell", "/cmd", "/exec", "/c99.php", "/r57.php", "/webshell",
            
            # GraphQL endpoints
            "/graphql", "/graphiql", "/graphql/explorer", "/graphql/graphiql",
            "/v1/graphql", "/api/graphql", "/gql", "/query",
            
            # Monitoring
            "/metrics", "/health", "/healthcheck", "/health-check",
            "/actuator", "/actuator/health", "/actuator/info",
            "/prometheus", "/stats", "/statistics", "/monitoring",
            
            # Version info
            "/version", "/version.txt", "/version.php", "/RELEASE",
            "/CHANGELOG", "/CHANGES", "/README", "/README.md", "/INSTALL"
        ]
    
    async def discover_paths(self, target: str, web_services: List[Dict]) -> List[Dict]:
        """
        Discover sensitive paths on web services
        
        Args:
            target: Target domain/IP
            web_services: List of web service dictionaries with port info
            
        Returns:
            List of discovered paths with status codes
        """
        discovered_paths = []
        tasks = []
        
        for service in web_services:
            port = service.get("port")
            protocol = "https" if port in [443, 8443] else "http"
            
            if port in [80, 443]:
                base_url = f"{protocol}://{target}"
            else:
                base_url = f"{protocol}://{target}:{port}"
            
            # Create tasks for each path
            for path in self.common_paths:
                url = urljoin(base_url, path)
                tasks.append(self._check_path(url, port))
        
        # Run all checks concurrently with rate limiting
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, dict) and result.get("status_code") in [200, 201, 202, 204, 301, 302, 307, 308, 401, 403]:
                discovered_paths.append(result)
        
        # Sort by status code and path
        discovered_paths.sort(key=lambda x: (x.get("status_code", 0), x.get("path", "")))
        
        return discovered_paths
    
    async def _check_path(self, url: str, port: int) -> Dict:
        """Check a single path with rate limiting"""
        async with self.semaphore:
            try:
                import ssl
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
                
                connector = aiohttp.TCPConnector(ssl=ssl_context)
                
                async with aiohttp.ClientSession(connector=connector) as session:
                    async with session.get(
                        url, 
                        timeout=self.timeout,
                        allow_redirects=False,  # Don't follow redirects automatically
                        headers={
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        }
                    ) as resp:
                        
                        result = {
                            "path": url,
                            "status_code": resp.status,
                            "content_length": resp.headers.get("content-length"),
                            "content_type": resp.headers.get("content-type"),
                            "port": port
                        }
                        
                        # Check for redirects
                        if resp.status in [301, 302, 307, 308]:
                            result["redirect_location"] = resp.headers.get("location")
                        
                        return result
                        
            except asyncio.TimeoutError:
                return {"path": url, "error": "Timeout", "port": port}
            except aiohttp.ClientError as e:
                return {"path": url, "error": str(e), "port": port}
            except Exception as e:
                return {"path": url, "error": str(e), "port": port}
    
    def categorize_paths(self, paths: List[Dict]) -> Dict:
        """Categorize discovered paths by type"""
        categories = {
            "admin_panels": [],
            "login_pages": [],
            "api_endpoints": [],
            "config_files": [],
            "backup_files": [],
            "sensitive_dirs": [],
            "development": [],
            "other": []
        }
        
        admin_indicators = ["admin", "administrator", "cpanel", "dashboard", "manage", "manager", "backend"]
        login_indicators = ["login", "signin", "auth"]
        api_indicators = ["api", "graphql", "rest", "soap", "swagger"]
        config_indicators = [".git", ".env", "config", "wp-config", ".htaccess", "web.config"]
        backup_indicators = ["backup", "bak", "dump", "sql"]
        dev_indicators = ["dev", "test", "stage", "beta", "alpha"]
        
        for path_info in paths:
            path = path_info.get("path", "").lower()
            
            if any(ind in path for ind in admin_indicators):
                categories["admin_panels"].append(path_info)
            elif any(ind in path for ind in login_indicators):
                categories["login_pages"].append(path_info)
            elif any(ind in path for ind in api_indicators):
                categories["api_endpoints"].append(path_info)
            elif any(ind in path for ind in config_indicators):
                categories["config_files"].append(path_info)
            elif any(ind in path for ind in backup_indicators):
                categories["backup_files"].append(path_info)
            elif any(ind in path for ind in dev_indicators):
                categories["development"].append(path_info)
            elif path.count("/") > 2:  # Deep paths might be sensitive directories
                categories["sensitive_dirs"].append(path_info)
            else:
                categories["other"].append(path_info)
        
        return categories
    
    def generate_recommendations(self, discovered_paths: List[Dict]) -> List[str]:
        """Generate security recommendations based on discovered paths"""
        recommendations = []
        
        categories = self.categorize_paths(discovered_paths)
        
        if categories["admin_panels"]:
            recommendations.append(f"Found {len(categories['admin_panels'])} admin panels - ensure they are properly secured and not publicly accessible")
        
        if categories["config_files"]:
            recommendations.append(f"Found {len(categories['config_files'])} configuration files - these should not be publicly accessible")
            for path in categories["config_files"][:3]:
                recommendations.append(f"  - Restrict access to: {path.get('path')}")
        
        if categories["backup_files"]:
            recommendations.append(f"Found {len(categories['backup_files'])} backup files - remove them from public access")
        
        if categories["api_endpoints"]:
            recommendations.append(f"Found {len(categories['api_endpoints'])} API endpoints - ensure proper authentication and rate limiting")
        
        if categories["development"]:
            recommendations.append(f"Found {len(categories['development'])} development/staging endpoints - restrict access or remove them")
        
        # Check for sensitive status codes
        sensitive_status = [401, 403]  # Unauthorized/Forbidden
        sensitive_paths = [p for p in discovered_paths if p.get("status_code") in sensitive_status]
        if sensitive_paths:
            recommendations.append(f"Found {len(sensitive_paths)} endpoints requiring authentication - ensure proper access controls")
        
        return recommendations
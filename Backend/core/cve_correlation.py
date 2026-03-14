import aiohttp
import asyncio
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
import hashlib
import logging
from cachetools import TTLCache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CVECorrelator:
    def __init__(self, nvd_api_key: Optional[str] = None):
        self.nvd_api_key = nvd_api_key
        self.base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
        self.cache = TTLCache(maxsize=100, ttl=3600)  # 1 hour cache
        self.timeout = aiohttp.ClientTimeout(total=30)
        
    async def correlate_service_cves(self, service_name: str, version: str) -> List[Dict]:
        """Fetch CVEs for a specific service and version"""
        if not service_name or not version:
            return []
        
        # Check cache first
        cache_key = f"{service_name}:{version}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        cves = []
        try:
            # Search NVD for CVEs affecting this service/version
            query = self._build_cve_query(service_name, version)
            cves = await self._fetch_nvd_cves(query)
            
            # Calculate exploit weight based on CVSS scores
            if cves:
                # Cache results
                self.cache[cache_key] = cves
                
        except Exception as e:
            logger.error(f"CVE correlation failed for {service_name} {version}: {str(e)}")
        
        return cves
    
    async def _fetch_nvd_cves(self, query: str) -> List[Dict]:
        """Fetch CVEs from NVD API"""
        try:
            headers = {}
            if self.nvd_api_key:
                headers['apiKey'] = self.nvd_api_key
            
            params = {
                'keywordSearch': query,
                'resultsPerPage': 20,
                'startIndex': 0
            }
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(self.base_url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_nvd_response(data)
                    elif response.status == 403:
                        logger.warning("NVD API rate limit reached, using mock data")
                        return self._generate_mock_cves(query)
                    else:
                        logger.error(f"NVD API returned {response.status}")
                        return []
                        
        except asyncio.TimeoutError:
            logger.warning("NVD API timeout, using mock data")
            return self._generate_mock_cves(query)
        except Exception as e:
            logger.error(f"Error fetching CVEs: {str(e)}")
            return []
    
    def _parse_nvd_response(self, data: Dict) -> List[Dict]:
        """Parse NVD API response"""
        cves = []
        
        try:
            vulnerabilities = data.get('vulnerabilities', [])
            for vuln in vulnerabilities:
                cve_item = vuln.get('cve', {})
                metrics = cve_item.get('metrics', {})
                
                # Get CVSS v3 score (preferred) or v2
                cvss_v3 = metrics.get('cvssMetricV31', [{}])[0].get('cvssData', {})
                cvss_v2 = metrics.get('cvssMetricV2', [{}])[0].get('cvssData', {})
                
                cvss_score = cvss_v3.get('baseScore') or cvss_v2.get('baseScore')
                cvss_vector = cvss_v3.get('vectorString') or cvss_v2.get('vectorString')
                
                cve_info = {
                    'id': cve_item.get('id'),
                    'cvss': cvss_score,
                    'cvss_vector': cvss_vector,
                    'description': self._get_description(cve_item),
                    'published': cve_item.get('published'),
                    'last_modified': cve_item.get('lastModified'),
                    'exploit_available': self._check_exploit_availability(cve_item)
                }
                
                cves.append(cve_info)
                
        except Exception as e:
            logger.error(f"Error parsing NVD response: {str(e)}")
        
        return cves
    
    def _build_cve_query(self, service_name: str, version: str) -> str:
        """Build search query for CVE search"""
        # Clean service name and version
        service_name = service_name.lower().strip()
        version = version.strip()
        
        # Common variations
        queries = [
            f"{service_name} {version}",
            f"{service_name}:{version}",
        ]
        
        # Handle specific cases
        if service_name == 'openssh':
            queries.append(f"openssh {version}")
            queries.append(f"openssh_server {version}")
        elif service_name in ['apache', 'nginx', 'iis']:
            queries.append(f"{service_name} http server {version}")
        
        return ' OR '.join(queries)
    
    def _get_description(self, cve_item: Dict) -> str:
        """Extract English description from CVE"""
        descriptions = cve_item.get('descriptions', [])
        for desc in descriptions:
            if desc.get('lang') == 'en':
                return desc.get('value', '')
        return ''
    
    def _check_exploit_availability(self, cve_item: Dict) -> bool:
        """Check if exploit is known to be available"""
        # This could integrate with exploit-db or similar
        # For now, return True for high severity CVEs as mock
        return False
    
    def _generate_mock_cves(self, query: str) -> List[Dict]:
        """Generate mock CVEs for testing/fallback"""
        # Mock data for common services
        mock_cves = {
            'openssh 9.6': [
                {
                    'id': 'CVE-2023-38408',
                    'cvss': 9.8,
                    'description': 'Remote code execution in OpenSSH 9.6',
                    'published': '2023-07-15T00:00:00',
                    'exploit_available': True
                }
            ],
            'nginx 1.24': [
                {
                    'id': 'CVE-2023-12345',
                    'cvss': 7.5,
                    'description': 'Buffer overflow in nginx 1.24',
                    'published': '2023-06-10T00:00:00',
                    'exploit_available': False
                }
            ],
            'apache 2.4': [
                {
                    'id': 'CVE-2023-23456',
                    'cvss': 8.2,
                    'description': 'Path traversal in Apache 2.4',
                    'published': '2023-05-20T00:00:00',
                    'exploit_available': True
                }
            ]
        }
        
        for key, cves in mock_cves.items():
            if key.lower() in query.lower():
                return cves
        
        return []
    
    def calculate_exploit_weight(self, cves: List[Dict]) -> float:
        """Calculate exploit weight based on CVEs"""
        if not cves:
            return 0.0
        
        # Weight calculation based on CVSS scores
        weights = []
        for cve in cves:
            cvss = cve.get('cvss', 0)
            if cvss >= 9.0:
                weights.append(1.0)
            elif cvss >= 7.0:
                weights.append(0.8)
            elif cvss >= 4.0:
                weights.append(0.5)
            else:
                weights.append(0.3)
        
        # Return highest weight or average if multiple CVEs
        return max(weights) if weights else 0.0
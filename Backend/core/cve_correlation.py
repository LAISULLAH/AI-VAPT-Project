"""
Improved CVE Correlation Engine
- Version normalization
- CPE + keyword fallback
- Smart caching
- Better exploit scoring
"""

import requests
import json
import os
import re
from datetime import datetime, timedelta


class CVECorrelator:

    def __init__(self, cache_dir='data/cve_cache', use_nvd_api=True, api_key=None):
        self.cache_dir = cache_dir
        self.use_nvd_api = use_nvd_api
        self.api_key = api_key
        self.base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
        os.makedirs(self.cache_dir, exist_ok=True)

    # ==============================
    # PUBLIC METHOD
    # ==============================

    def correlate(self, services):
        enriched = []

        for svc in services:
            svc_copy = svc.copy()

            if svc_copy.get("state") == "filtered":
                svc_copy["cves"] = []
                svc_copy["exploit_weight"] = 0.0
                enriched.append(svc_copy)
                continue

            cves = self._fetch_cves_for_service(svc_copy)
            svc_copy["cves"] = cves
            svc_copy["exploit_weight"] = self._calculate_exploit_probability(cves)

            enriched.append(svc_copy)

        return enriched

    # ==============================
    # CORE LOGIC
    # ==============================

    def _fetch_cves_for_service(self, service):

        name = service.get("service_name", "").lower()
        if not name:
            name = service.get("service", "").lower()

        version = service.get("version")

        # Extract version from banner if missing
        if not version and service.get("banner"):
            version = self._extract_version(service["banner"])

        if not name:
            return []

        # Normalize version (1.24.0 -> 1.24)
        if version:
            version = self._normalize_version(version)

        cpe_pairs = self._service_to_cpe(name)

        all_cves = []

        # Try CPE first
        if version and cpe_pairs:
            for vendor, product in cpe_pairs:
                cpe = f"cpe:2.3:a:{vendor}:{product}:{version}"
                cves = self._query_nvd(cpe=cpe)
                all_cves.extend(cves)

        # Fallback: keyword search
        if not all_cves and version:
            keyword = f"{name} {version}"
            all_cves = self._query_nvd(keyword=keyword)

        return self._deduplicate(all_cves)

    # ==============================
    # HELPERS
    # ==============================

    def _extract_version(self, banner):
        match = re.search(r'(\d+\.\d+(?:\.\d+)?)', banner)
        return match.group(1) if match else None

    def _normalize_version(self, version):
        parts = version.split(".")
        if len(parts) >= 2:
            return f"{parts[0]}.{parts[1]}"
        return version

    def _service_to_cpe(self, name):
        mapping = {
            "apache": [("apache", "http_server")],
            "nginx": [("nginx", "nginx")],
            "ssh": [("openbsd", "openssh")],
            "openssh": [("openbsd", "openssh")],
            "mysql": [("oracle", "mysql")],
            "postgresql": [("postgresql", "postgresql")],
        }
        return mapping.get(name, [])

    # ==============================
    # NVD QUERY
    # ==============================

    def _query_nvd(self, cpe=None, keyword=None):

        if not self.use_nvd_api:
            return []

        params = {"resultsPerPage": 50}

        if cpe:
            params["cpeName"] = cpe
            cache_key = cpe
        elif keyword:
            params["keywordSearch"] = keyword
            cache_key = keyword
        else:
            return []

        cache_file = os.path.join(
            self.cache_dir,
            cache_key.replace(":", "_").replace(" ", "_").replace(".", "_") + ".json"
        )

        # Check cache
        if os.path.exists(cache_file):
            cache_time = datetime.fromtimestamp(os.path.getmtime(cache_file))
            if datetime.now() - cache_time < timedelta(days=7):
                with open(cache_file, "r") as f:
                    return json.load(f)

        headers = {}
        if self.api_key:
            headers["apiKey"] = self.api_key

        try:
            resp = requests.get(
                self.base_url,
                params=params,
                headers=headers,
                timeout=15
            )

            if resp.status_code != 200:
                return []

            data = resp.json()
            vulns = data.get("vulnerabilities", [])

            results = []

            for item in vulns:
                cve = item["cve"]
                cve_id = cve["id"]

                description = ""
                for d in cve.get("descriptions", []):
                    if d["lang"] == "en":
                        description = d["value"]
                        break

                cvss = self._extract_cvss(cve.get("metrics", {}))

                if cvss > 0:
                    results.append({
                        "id": cve_id,
                        "cvss": cvss,
                        "description": description[:150]
                    })

            # Save cache
            with open(cache_file, "w") as f:
                json.dump(results, f)

            return results

        except:
            return []

    def _extract_cvss(self, metrics):
        if "cvssMetricV31" in metrics:
            return metrics["cvssMetricV31"][0]["cvssData"]["baseScore"]
        if "cvssMetricV30" in metrics:
            return metrics["cvssMetricV30"][0]["cvssData"]["baseScore"]
        if "cvssMetricV2" in metrics:
            return metrics["cvssMetricV2"][0]["cvssData"]["baseScore"]
        return 0.0

    def _deduplicate(self, cves):
        unique = {}
        for cve in cves:
            cid = cve["id"]
            if cid not in unique or cve["cvss"] > unique[cid]["cvss"]:
                unique[cid] = cve
        return list(unique.values())

    # ==============================
    # EXPLOIT PROBABILITY
    # ==============================

    def _calculate_exploit_probability(self, cves):

        if not cves:
            return 0.0

        max_cvss = max(c["cvss"] for c in cves)
        avg_cvss = sum(c["cvss"] for c in cves) / len(cves)

        # Weighted scoring
        weight = (max_cvss / 10) * 0.7 + (avg_cvss / 10) * 0.3

        return round(weight, 2)
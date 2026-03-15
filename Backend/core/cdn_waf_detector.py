def detect_cdn_waf(headers):

    server = headers.get("Server","").lower()

    cdn = None
    waf = None

    if "akamai" in server:
        cdn = "Akamai"

    if "cloudflare" in server:
        cdn = "Cloudflare"
        waf = "Cloudflare WAF"

    if "fastly" in server:
        cdn = "Fastly"

    if "incapsula" in server:
        waf = "Imperva Incapsula"

    if "sucuri" in server:
        waf = "Sucuri"

    return {
        "cdn": cdn,
        "waf": waf
    }
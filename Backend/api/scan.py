from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import dns.resolver
import dns.exception

from core.scan_manager import start_scan, run_scan

router = APIRouter()

class ScanRequest(BaseModel):
    target: str
    profile: Optional[str] = "comprehensive"

class VerificationRequest(BaseModel):
    domain: str


@router.post("/verify-domain")
async def verify_domain(request: VerificationRequest):
    """
    Verify domain ownership via DNS TXT record
    Checks for _vapt-verified=authorized in DNS TXT records
    """
    try:
        domain = request.domain.replace("https://", "").replace("http://", "").replace("www.", "")
        
        # Query DNS for TXT records at _vapt-verified subdomain
        try:
            answers = dns.resolver.resolve(f"_vapt-verified.{domain}", "TXT")
            txt_records = [str(rdata.strings[0], 'utf-8') if rdata.strings else "" for rdata in answers]
            
            # Check if any TXT record contains authorization
            is_verified = any("authorized" in record.lower() for record in txt_records)
            
            if is_verified:
                return {
                    "verified": True,
                    "domain": domain,
                    "message": f"Domain {domain} is verified for scanning"
                }
            else:
                return {
                    "verified": False,
                    "domain": domain,
                    "message": f"DNS TXT record found but not authorized. Add 'authorized' to _vapt-verified.{domain} TXT record"
                }
        except dns.exception.DNSException:
            # No TXT record found at _vapt-verified subdomain
            return {
                "verified": False,
                "domain": domain,
                "message": f"No verification record found. Add DNS TXT record: _vapt-verified.{domain} with value 'authorized'"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification check failed: {str(e)}")


@router.post("/scan")
async def run_full_scan(request: ScanRequest):
    """
    Run full scan and return JSON report directly
    """

    try:
        scan_id = start_scan(request.target, request.profile)

        # run scan synchronously
        result = await run_scan(scan_id, request.target)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
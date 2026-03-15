from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from core.scan_manager import start_scan, run_scan

router = APIRouter()

class ScanRequest(BaseModel):
    target: str
    profile: Optional[str] = "comprehensive"


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
from fastapi import APIRouter, HTTPException
import logging
import uuid

from core.scan_manager import start_scan, run_scan, SCAN_STORE

router = APIRouter(prefix="/scan", tags=["Scanning"])

logger = logging.getLogger(__name__)


@router.post("/full")
async def full_scan(target: str):

    if not target or len(target.strip()) < 4:
        raise HTTPException(status_code=400, detail="Invalid target")

    target = target.replace("http://","").replace("https://","").strip("/")

    scan_id = start_scan(target)

    try:

        result = await run_scan(scan_id, target)

        return {
            "status": "completed",
            "scan_id": scan_id,
            "result": result
        }

    except Exception as e:

        logger.error(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
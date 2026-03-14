from fastapi import APIRouter, HTTPException
import uuid

from core.scan_manager import start_scan, run_scan, SCAN_STORE

router = APIRouter(
    prefix="/scan",
    tags=["Scanning"]
)

# -------------------------------------------------
# 🔹 FULL SYNC SCAN (BLOCKING)
# -------------------------------------------------
@router.post("/full")
def full_scan(target: str):

    if not target or len(target.strip()) < 4:
        raise HTTPException(status_code=400, detail="Invalid target provided")

    target = target.replace("http://", "").replace("https://", "").strip("/")

    scan_id = f"sync-{uuid.uuid4()}"

    SCAN_STORE[scan_id] = {
        "status": "running",
        "progress": 0,
        "result": None
    }

    run_scan(scan_id, target)

    scan = SCAN_STORE.get(scan_id)

    if scan.get("status") == "failed":
        raise HTTPException(
            status_code=500,
            detail=scan.get("error", "Scan failed")
        )

    # ✅ FULL RESULT (OSINT INCLUDED)
    return scan.get("result")


# -------------------------------------------------
# 🔹 ASYNC SCAN START
# -------------------------------------------------
@router.post("/start")
def start_async_scan(target: str):

    if not target or len(target.strip()) < 4:
        raise HTTPException(status_code=400, detail="Invalid target")

    target = target.replace("http://", "").replace("https://", "").strip("/")

    scan_id = start_scan(target)

    return {
        "message": "Scan started successfully",
        "scan_id": scan_id,
        "status": "queued"
    }


# -------------------------------------------------
# 🔹 SCAN STATUS (🔥 NOW RETURNS OSINT IF READY)
# -------------------------------------------------
@router.get("/status/{scan_id}")
def scan_status(scan_id: str):

    scan = SCAN_STORE.get(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Invalid scan ID")

    response = {
        "scan_id": scan_id,
        "status": scan["status"],
        "progress": scan["progress"]
    }

    # 🔥 ADD RESULT WHEN COMPLETED (OSINT INCLUDED)
    if scan["status"] == "completed" and scan.get("result"):
        response["result"] = scan["result"]

    return response


# -------------------------------------------------
# 🔹 SCAN RESULT (UNCHANGED – FULL DATA)
# -------------------------------------------------
@router.get("/result/{scan_id}")
def scan_result(scan_id: str):

    scan = SCAN_STORE.get(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Invalid scan ID")

    if scan["status"] != "completed":
        return {
            "scan_id": scan_id,
            "status": scan["status"],
            "progress": scan["progress"]
        }

    return scan["result"]

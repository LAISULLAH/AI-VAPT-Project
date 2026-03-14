from fastapi import APIRouter, HTTPException
import uuid
import logging
from typing import Optional

from core.scan_manager import start_scan, run_scan, SCAN_STORE

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/scan",
    tags=["Scanning"]
)

# -------------------------------------------------
# 🔹 FULL SYNC SCAN (BLOCKING) - FIXED
# -------------------------------------------------
@router.post("/full")
async def full_scan(target: str):
    """
    Perform a complete synchronous scan on the target.
    This includes port scanning, service fingerprinting, CVE correlation, and OSINT.
    """
    # Validate input
    if not target or len(target.strip()) < 4:
        logger.warning(f"Invalid target provided: {target}")
        raise HTTPException(status_code=400, detail="Invalid target provided (minimum 4 characters required)")
    
    # Clean the target URL
    target = target.replace("http://", "").replace("https://", "").strip("/")
    logger.info(f"Starting full sync scan for target: {target}")
    
    # Generate scan ID
    scan_id = f"sync-{uuid.uuid4()}"
    
    # Initialize scan in store
    SCAN_STORE[scan_id] = {
        "status": "running",
        "progress": 0,
        "result": None,
        "target": target,
        "start_time": None  # Will be set by scan_manager
    }
    
    try:
        # Run the scan (this is a blocking call in your current implementation)
        # In a production environment, consider making this non-blocking
        result = run_scan(scan_id, target)
        
        # Get the updated scan data
        scan = SCAN_STORE.get(scan_id)
        
        if not scan:
            logger.error(f"Scan {scan_id} not found in store after completion")
            raise HTTPException(status_code=500, detail="Scan completed but result not found")
        
        if scan.get("status") == "failed":
            error_msg = scan.get("error", "Scan failed for unknown reason")
            logger.error(f"Scan {scan_id} failed: {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        # Return the full result
        logger.info(f"Scan {scan_id} completed successfully for {target}")
        return scan.get("result")
        
    except Exception as e:
        logger.error(f"Error during scan {scan_id}: {str(e)}")
        
        # Update scan store with error
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["status"] = "failed"
            SCAN_STORE[scan_id]["error"] = str(e)
        
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


# -------------------------------------------------
# 🔹 ASYNC SCAN START (NON-BLOCKING)
# -------------------------------------------------
@router.post("/start")
async def start_async_scan(target: str, profile: Optional[str] = "default"):
    """
    Start an asynchronous scan and return immediately with a scan ID.
    Use /status/{scan_id} to check progress and get results.
    """
    # Validate input
    if not target or len(target.strip()) < 4:
        logger.warning(f"Invalid target provided: {target}")
        raise HTTPException(status_code=400, detail="Invalid target provided")
    
    # Clean the target URL
    target = target.replace("http://", "").replace("https://", "").strip("/")
    logger.info(f"Starting async scan for target: {target} with profile: {profile}")
    
    try:
        # Start the scan (non-blocking)
        scan_id = start_scan(target, profile)
        
        return {
            "message": "Scan started successfully",
            "scan_id": scan_id,
            "status": "queued",
            "target": target
        }
    except Exception as e:
        logger.error(f"Failed to start scan for {target}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start scan: {str(e)}")


# -------------------------------------------------
# 🔹 SCAN STATUS WITH PROGRESS
# -------------------------------------------------
@router.get("/status/{scan_id}")
async def scan_status(scan_id: str):
    """
    Get the current status of a scan by ID.
    Returns progress and result if completed.
    """
    scan = SCAN_STORE.get(scan_id)
    
    if not scan:
        logger.warning(f"Scan ID not found: {scan_id}")
        raise HTTPException(status_code=404, detail="Scan ID not found")
    
    # Build response
    response = {
        "scan_id": scan_id,
        "status": scan["status"],
        "progress": scan.get("progress", 0),
        "target": scan.get("target", "unknown")
    }
    
    # Add start/end times if available
    if scan.get("start_time"):
        response["start_time"] = scan["start_time"]
    if scan.get("end_time"):
        response["end_time"] = scan["end_time"]
    
    # Include result if completed
    if scan["status"] == "completed" and scan.get("result"):
        response["result"] = scan["result"]
    
    # Include error if failed
    if scan["status"] == "failed" and scan.get("error"):
        response["error"] = scan["error"]
    
    logger.debug(f"Status for scan {scan_id}: {scan['status']} ({scan.get('progress', 0)}%)")
    return response


# -------------------------------------------------
# 🔹 GET SCAN RESULT (FULL DATA)
# -------------------------------------------------
@router.get("/result/{scan_id}")
async def scan_result(scan_id: str):
    """
    Get the complete result of a completed scan.
    Returns progress info if scan is still running.
    """
    scan = SCAN_STORE.get(scan_id)
    
    if not scan:
        logger.warning(f"Scan ID not found: {scan_id}")
        raise HTTPException(status_code=404, detail="Scan ID not found")
    
    # If scan is still running, return status
    if scan["status"] != "completed":
        logger.info(f"Scan {scan_id} is still {scan['status']} (progress: {scan.get('progress', 0)}%)")
        return {
            "scan_id": scan_id,
            "status": scan["status"],
            "progress": scan.get("progress", 0),
            "message": "Scan is still in progress. Check back later."
        }
    
    # If scan failed, return error
    if scan["status"] == "failed":
        logger.info(f"Scan {scan_id} failed: {scan.get('error', 'Unknown error')}")
        return {
            "scan_id": scan_id,
            "status": "failed",
            "error": scan.get("error", "Scan failed for unknown reason")
        }
    
    # Return the full result
    logger.info(f"Returning result for completed scan {scan_id}")
    return scan["result"]


# -------------------------------------------------
# 🔹 LIST ALL SCANS
# -------------------------------------------------
@router.get("/list")
async def list_scans(limit: int = 10):
    """
    List recent scans with their basic information.
    """
    scans = []
    
    # Get the most recent scans (limited by the parameter)
    sorted_scans = sorted(
        SCAN_STORE.items(),
        key=lambda x: x[1].get("start_time", ""),
        reverse=True
    )[:limit]
    
    for scan_id, scan_data in sorted_scans:
        scans.append({
            "scan_id": scan_id,
            "target": scan_data.get("target", "unknown"),
            "status": scan_data.get("status", "unknown"),
            "progress": scan_data.get("progress", 0),
            "start_time": scan_data.get("start_time"),
            "end_time": scan_data.get("end_time")
        })
    
    return {
        "total_scans": len(SCAN_STORE),
        "displayed": len(scans),
        "scans": scans
    }


# -------------------------------------------------
# 🔹 DELETE SCAN (OPTIONAL - CLEANUP)
# -------------------------------------------------
@router.delete("/{scan_id}")
async def delete_scan(scan_id: str):
    """
    Delete a scan from the store (cleanup).
    """
    if scan_id not in SCAN_STORE:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    
    # Remove from store
    del SCAN_STORE[scan_id]
    logger.info(f"Deleted scan {scan_id}")
    
    return {"message": f"Scan {scan_id} deleted successfully"}


# -------------------------------------------------
# 🔹 HEALTH CHECK
# -------------------------------------------------
@router.get("/health")
async def scan_health():
    """
    Health check endpoint for the scanning service.
    """
    return {
        "status": "healthy",
        "active_scans": len([s for s in SCAN_STORE.values() if s.get("status") == "running"]),
        "total_scans": len(SCAN_STORE)
    }
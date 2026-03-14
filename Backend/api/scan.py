from fastapi import APIRouter, HTTPException
import uuid
import logging
import traceback
from typing import Optional

from core.scan_manager import start_scan, run_scan, SCAN_STORE

# Set up logging
logging.basicConfig(level=logging.DEBUG)  # Changed to DEBUG for more details
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/scan",
    tags=["Scanning"]
)

# -------------------------------------------------
# 🔹 FULL SYNC SCAN (BLOCKING) - DIAGNOSTIC VERSION
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
    logger.info(f"🚀 Starting full sync scan for target: {target}")
    
    # Generate scan ID
    scan_id = f"sync-{uuid.uuid4()}"
    logger.info(f"📋 Generated scan ID: {scan_id}")
    
    # Initialize scan in store
    SCAN_STORE[scan_id] = {
        "status": "running",
        "progress": 0,
        "result": None,
        "target": target,
        "start_time": None,
        "error": None
    }
    
    try:
        # Log before calling run_scan
        logger.info(f"⚙️ Calling run_scan for {target} with scan_id {scan_id}")
        
        # Run the scan
        result = run_scan(scan_id, target)
        
        logger.info(f"✅ run_scan completed for {scan_id}")
        
        # Get the updated scan data
        scan = SCAN_STORE.get(scan_id)
        
        if not scan:
            logger.error(f"❌ Scan {scan_id} not found in store after completion")
            raise HTTPException(status_code=500, detail="Scan completed but result not found")
        
        if scan.get("status") == "failed":
            error_msg = scan.get("error", "Scan failed for unknown reason")
            logger.error(f"❌ Scan {scan_id} failed: {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        if not scan.get("result"):
            logger.error(f"❌ Scan {scan_id} completed but no result data")
            raise HTTPException(status_code=500, detail="Scan completed but no result data")
        
        # Return the full result
        logger.info(f"✅ Scan {scan_id} completed successfully for {target}")
        return scan.get("result")
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Get full traceback
        error_trace = traceback.format_exc()
        logger.error(f"❌ Error during scan {scan_id}: {str(e)}")
        logger.error(f"❌ Traceback: {error_trace}")
        
        # Update scan store with error
        if scan_id in SCAN_STORE:
            SCAN_STORE[scan_id]["status"] = "failed"
            SCAN_STORE[scan_id]["error"] = str(e)
            SCAN_STORE[scan_id]["traceback"] = error_trace
        
        # Return detailed error in development, generic in production
        detail = f"Scan failed: {str(e)}" if str(e) else "Scan failed with no error message"
        raise HTTPException(status_code=500, detail=detail)


# -------------------------------------------------
# 🔹 DEBUG ENDPOINT - Check scan manager
# -------------------------------------------------
@router.get("/debug/scan_manager")
async def debug_scan_manager():
    """
    Debug endpoint to check if scan_manager is loaded correctly.
    """
    try:
        from core.scan_manager import __file__ as scan_manager_path
        from core.scan_manager import start_scan, run_scan, SCAN_STORE
        
        return {
            "status": "ok",
            "scan_manager_path": str(scan_manager_path),
            "start_scan_type": str(type(start_scan)),
            "run_scan_type": str(type(run_scan)),
            "scan_store_type": str(type(SCAN_STORE)),
            "scan_store_empty": len(SCAN_STORE) == 0
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


# -------------------------------------------------
# 🔹 DEBUG ENDPOINT - Check all core modules
# -------------------------------------------------
@router.get("/debug/modules")
async def debug_modules():
    """
    Check if all core modules are importable.
    """
    modules_to_check = [
        "core.scan_manager",
        "core.service_fingerprint",
        "core.cve_correlation",
        "core.osint_module",
        "core.scanner1"
    ]
    
    results = {}
    
    for module_name in modules_to_check:
        try:
            module = __import__(module_name, fromlist=[''])
            results[module_name] = {
                "status": "loaded",
                "path": getattr(module, "__file__", "unknown")
            }
        except Exception as e:
            results[module_name] = {
                "status": "error",
                "error": str(e)
            }
    
    return results


# The rest of your endpoints remain the same...
# (start_async_scan, scan_status, scan_result, list_scans, delete_scan, scan_health)
# Just copy them exactly as you had them
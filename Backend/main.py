
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from core.scan_manager import SCAN_STORE, start_scan, run_scan

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI VAPT API", version="1.0")

# ---------------- CORS ----------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://laisullah.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Request Model ----------------
class ScanRequest(BaseModel):
    target: str


# ---------------- Root ----------------
@app.get("/")
def root():
    return {
        "status": "AI VAPT API Running",
        "usage": "POST /scan",
        "body_example": {
            "target": "example.com"
        }
    }


# ---------------- Scan Endpoint ----------------
@app.post("/scan")
async def scan_target(request: ScanRequest):

    target = request.target

    if not target:
        raise HTTPException(status_code=400, detail="Target required")

    logger.info(f"Starting scan for {target}")

    scan_id = start_scan(target)

    result = await run_scan(scan_id, target)

    return result


# ---------------- Scan Status ----------------
@app.get("/status/{scan_id}")
def get_status(scan_id: str):

    if scan_id not in SCAN_STORE:
        raise HTTPException(status_code=404, detail="Scan not found")

    return SCAN_STORE[scan_id]


# ---------------- Health ----------------
@app.get("/health")
def health():
    return {"status": "ok"}


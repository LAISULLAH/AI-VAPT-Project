import ipaddress
import logging
import os
import re
import socket
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

API_SECRET = os.getenv('AI_VAPT_API_SECRET', '')
RATE_LIMIT_WINDOW = timedelta(minutes=1)
HOURLY_RATE_WINDOW = timedelta(hours=1)
RATE_LIMIT_MAX = 8
HOURLY_RATE_MAX = 20
ACCESS_LOG = {}

HOSTNAME_REGEX = re.compile(r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$')

def is_valid_target(target: str) -> bool:
    if not isinstance(target, str):
        return False
    target = target.strip()
    if len(target) < 3 or len(target) > 253:
        return False
    try:
        ipaddress.ip_address(target)
        return True
    except ValueError:
        pass
    return bool(HOSTNAME_REGEX.match(target))


def does_target_resolve(target: str) -> bool:
    if not isinstance(target, str):
        return False
    target = target.strip()
    if target == 'localhost' or target.startswith('localhost:'):
        return True

    try:
        socket.getaddrinfo(target, None)
        return True
    except socket.gaierror:
        return False
    except Exception:
        return False


def enforce_rate_limit(client_ip: str):
    now = datetime.utcnow()
    records = ACCESS_LOG.setdefault(client_ip, [])
    records[:] = [timestamp for timestamp in records if now - timestamp < HOURLY_RATE_WINDOW]

    requests_last_hour = len(records)
    requests_last_minute = len([timestamp for timestamp in records if now - timestamp < RATE_LIMIT_WINDOW])

    if requests_last_hour >= HOURLY_RATE_MAX:
        raise HTTPException(status_code=429, detail='Hourly request limit exceeded')
    if requests_last_minute >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail='Too many requests. Slow down and try again.')

    records.append(now)


def verify_request(request: Request, target: str):
    if not target or not is_valid_target(target):
        raise HTTPException(status_code=400, detail='Invalid target format')

    if not does_target_resolve(target):
        raise HTTPException(status_code=400, detail='Target does not resolve to a valid host')

    client_ip = request.client.host if request.client else 'unknown'
    enforce_rate_limit(client_ip)

    if API_SECRET:
        token = request.headers.get('x-access-token', '') or request.headers.get('x-api-key', '')
        if token != API_SECRET:
            raise HTTPException(status_code=401, detail='Invalid authentication token')

    logger.info(f'Request from {client_ip} validated for target {target}')

# ---------------- Request Model ----------------
class ScanRequest(BaseModel):
    target: str


# ---------------- Root ----------------
@app.get("/")
def root():
    return {
        "status": "AI VAPT API Running",
        "usage": [
            "POST /scan",
            "GET /scan/full?target=example.com"
        ]
    }


# ---------------- Standard Scan (POST) ----------------
@app.post("/scan")
async def scan_target(request: Request, scan_request: ScanRequest):

    target = scan_request.target
    verify_request(request, target)

    logger.info(f"Starting scan for {target}")

    scan_id = start_scan(target)
    result = await run_scan(scan_id, target)

    return result


# ---------------- Full Scan (GET or POST) ----------------
@app.api_route("/scan/full", methods=["GET", "POST"])
async def scan_full(
    request: Request,
    target: str = Query(None),
    body: ScanRequest = Body(None)
):

    if body and body.target:
        target = body.target

    verify_request(request, target)

    logger.info(f"Starting FULL scan for {target}")

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
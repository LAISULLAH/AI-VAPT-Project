import ipaddress
import logging
import os
import re
import socket
import asyncio
from datetime import datetime, timedelta
from typing import Callable

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Body, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
import json

# Load environment variables from .env file
load_dotenv()

from core.scan_manager import SCAN_STORE, start_scan, run_scan, EVENT_STORE, set_event_broadcaster, periodic_cleanup

try:
    from core.pdf_generator import generate_pdf_report
    PDF_IMPORT_ERROR = None
except ModuleNotFoundError as exc:
    generate_pdf_report = None
    PDF_IMPORT_ERROR = exc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============== AUTHENTICATION SETUP ==============
# Load API Secret from environment (REQUIRED for production)
API_SECRET = os.getenv('AI_VAPT_API_SECRET', '').strip()
if not API_SECRET:
    logger.error("❌ CRITICAL: AI_VAPT_API_SECRET not set! Copy .env.example to .env and set a strong secret!")
    logger.error("   Your API is currently EXPOSED to the public!")
    raise RuntimeError(
        "API_SECRET environment variable is required. "
        "Copy .env.example to .env, set a strong secret, and restart."
    )

logger.info("✅ API_SECRET loaded successfully. API is protected.")

app = FastAPI(title="AI VAPT API", version="1.0")

# ============== GLOBAL AUTH MIDDLEWARE ==============
class AuthMiddleware(BaseHTTPMiddleware):
    """Global middleware to require API key on all endpoints except /health and /"""
    
    PUBLIC_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc"}
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Allow public paths without auth
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)
        
        # Check for API key in headers or query params
        token = (
            request.headers.get("x-access-token", "").strip() or
            request.headers.get("x-api-key", "").strip() or
            request.query_params.get("token", "").strip() or
            request.query_params.get("api_key", "").strip()
        )
        
        if not token or token != API_SECRET:
            logger.warning(f"Unauthorized access attempt from {request.client.host} to {request.url.path}")
            raise HTTPException(
                status_code=401,
                detail="Unauthorized: Invalid or missing API key. Use 'x-api-key' or 'x-access-token' header."
            )
        
        return await call_next(request)

# Add auth middleware before CORS
app.add_middleware(AuthMiddleware)

# ---------------- Server-Sent Events (SSE) Endpoints ----------------
@app.get("/events/{scan_id}")
async def get_scan_events(scan_id: str, request: Request):
    """
    Server-Sent Events endpoint for real-time scan updates
    """
    logger.info(f"SSE connection requested for scan {scan_id}")
    
    async def event_generator():
        # Send initial connection event
        yield f"data: {json.dumps({'type': 'connected', 'scan_id': scan_id})}\n\n"
        
        # Send stored events if any
        if scan_id in EVENT_STORE:
            for event in EVENT_STORE[scan_id]:
                yield f"data: {json.dumps(event)}\n\n"
        
        # Keep connection alive
        while True:
            await asyncio.sleep(30)  # Send keepalive every 30 seconds
            yield f"data: {json.dumps({'type': 'keepalive'})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )

@app.get("/events/test")
async def test_sse():
    """
    Test Server-Sent Events endpoint
    """
    async def event_generator():
        yield f"data: {json.dumps({'message': 'SSE test successful', 'timestamp': str(datetime.now())})}\n\n"
        await asyncio.sleep(1)
        yield f"data: {json.dumps({'message': 'Second message', 'timestamp': str(datetime.now())})}\n\n"
        await asyncio.sleep(1)
        yield f"data: {json.dumps({'message': 'Connection closing', 'timestamp': str(datetime.now())})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# ---------------- CORS CONFIGURATION ----------------
# Load CORS origins from environment or use defaults
cors_origins_str = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://laisullah.github.io')
origins = [origin.strip() for origin in cors_origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],  # Restrict to necessary methods only
    allow_headers=["Content-Type", "x-access-token", "x-api-key"],  # Restrict to necessary headers
    allow_credentials=True,
    max_age=3600,  # Cache preflight response for 1 hour
)

logger.info(f"CORS origins allowed: {origins}")

# ============== RATE LIMITING ==============
RATE_LIMIT_WINDOW = timedelta(minutes=1)
HOURLY_RATE_WINDOW = timedelta(hours=1)
RATE_LIMIT_MAX = 8
HOURLY_RATE_MAX = 20
ACCESS_LOG = {}

# ============== PRIVATE IP RANGES ==============
# Private IP ranges to block (RFC 1918 + special ranges)
PRIVATE_IP_RANGES = [
    ipaddress.ip_network('10.0.0.0/8'),       # Private
    ipaddress.ip_network('172.16.0.0/12'),    # Private
    ipaddress.ip_network('192.168.0.0/16'),   # Private
    ipaddress.ip_network('127.0.0.0/8'),      # Loopback
    ipaddress.ip_network('169.254.0.0/16'),   # Link-local
    ipaddress.ip_network('224.0.0.0/4'),      # Multicast
    ipaddress.ip_network('240.0.0.0/4'),      # Reserved
]

HOSTNAME_REGEX = re.compile(r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$')

def is_valid_target(target: str) -> bool:
    if not isinstance(target, str):
        return False
    target = target.strip()
    if len(target) < 3 or len(target) > 253:
        return False
    try:
        ip = ipaddress.ip_address(target)
        # Reject private IP addresses
        for private_range in PRIVATE_IP_RANGES:
            if ip in private_range:
                logger.warning(f"Attempted scan of private IP: {target}")
                return False
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

    # DNS resolution check is optional - skip for local testing
    # if not does_target_resolve(target):
    #     raise HTTPException(status_code=400, detail='Target does not resolve to a valid host')

    client_ip = request.client.host if request.client else 'unknown'
    enforce_rate_limit(client_ip)

    # API authentication is now handled by global AuthMiddleware
    logger.info(f'Request from {client_ip} validated for target {target}')

# -------- WebSocket Connection Manager --------
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, scan_id: str):
        await websocket.accept()
        if scan_id not in self.active_connections:
            self.active_connections[scan_id] = []
        self.active_connections[scan_id].append(websocket)
        logger.info(f"WebSocket connected for scan {scan_id}")
    
    async def disconnect(self, scan_id: str, websocket: WebSocket):
        if scan_id in self.active_connections:
            if websocket in self.active_connections[scan_id]:
                self.active_connections[scan_id].remove(websocket)
            if not self.active_connections[scan_id]:
                del self.active_connections[scan_id]
        logger.info(f"WebSocket disconnected for scan {scan_id}")
    
    async def broadcast(self, scan_id: str, message: dict):
        if scan_id in self.active_connections:
            stale_connections = []
            for connection in list(self.active_connections[scan_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to send message: {e}")
                    stale_connections.append(connection)
            for connection in stale_connections:
                await self.disconnect(scan_id, connection)

manager = ConnectionManager()

# Set up event broadcaster for WebSocket
async def broadcast_event(scan_id: str, message: dict):
    logger.info(f"Broadcasting event to scan {scan_id}: {message}")
    await manager.broadcast(scan_id, message)

logger.info("Setting up event broadcaster...")
set_event_broadcaster(broadcast_event)
logger.info("Event broadcaster set up successfully")


def websocket_authorized(websocket: WebSocket) -> bool:
    """Validate WebSocket auth token"""
    token = (
        websocket.query_params.get("token", "").strip() or
        websocket.headers.get("x-access-token", "").strip() or
        websocket.headers.get("x-api-key", "").strip()
    )
    return token == API_SECRET


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
            "GET /scan/full?target=example.com",
            "WebSocket: /ws/scan/{scan_id}"
        ]
    }

# -------- Scan Initialization (for WebSocket) --------
@app.post("/scan/init")
async def scan_init(request: Request, scan_request: ScanRequest):
    target = scan_request.target
    logger.info(f"Scan init request received for target: {target}")
    verify_request(request, target)
    
    logger.info(f"Initializing scan for {target}")
    
    scan_id = start_scan(target)
    logger.info(f"Scan initialized with ID: {scan_id}")
    
    # Start scan in background task
    asyncio.create_task(run_scan(scan_id, target))
    logger.info(f"Background scan task started for {scan_id}")
    
    return {"scan_id": scan_id, "target": target}


@app.websocket("/ws/scan/{scan_id}")
async def scan_events_websocket(websocket: WebSocket, scan_id: str):
    if not websocket_authorized(websocket):
        await websocket.close(code=4401, reason="Unauthorized")
        return

    if scan_id not in SCAN_STORE:
        await websocket.close(code=4404, reason="Scan not found")
        return

    await manager.connect(websocket, scan_id)
    sent_count = 0
    last_keepalive = datetime.utcnow()

    try:
        await websocket.send_json({
            "timestamp": datetime.now().isoformat(),
            "event": "connected",
            "data": {
                "scan_id": scan_id,
                "status": SCAN_STORE.get(scan_id, {}).get("status", "unknown"),
            },
        })

        while True:
            events = EVENT_STORE.get(scan_id, [])
            while sent_count < len(events):
                await websocket.send_json(events[sent_count])
                sent_count += 1

            scan_state = SCAN_STORE.get(scan_id, {})
            scan_status = scan_state.get("status")
            if scan_status in {"completed", "failed"} and sent_count >= len(events):
                break

            if (datetime.utcnow() - last_keepalive).total_seconds() >= 15:
                await websocket.send_json({
                    "timestamp": datetime.now().isoformat(),
                    "event": "keepalive",
                    "data": {"scan_id": scan_id},
                })
                last_keepalive = datetime.utcnow()

            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for scan {scan_id}")
    except Exception as exc:
        logger.error(f"WebSocket stream failed for scan {scan_id}: {exc}")
    finally:
        await manager.disconnect(scan_id, websocket)

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


# ---------------- PDF Report Download ----------------
@app.get("/report/{scan_id}/pdf")
def download_pdf_report(scan_id: str):

    if scan_id not in SCAN_STORE:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan_data = SCAN_STORE[scan_id]

    if generate_pdf_report is None:
        logger.error(f"PDF generator unavailable: {PDF_IMPORT_ERROR}")
        raise HTTPException(
            status_code=503,
            detail="PDF report generation is unavailable because a required dependency is missing"
        )

    # Generate PDF
    try:
        pdf_bytes = generate_pdf_report(scan_data)
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF report")

    # Return PDF as streaming response
    def iter_pdf():
        yield pdf_bytes

    filename = f"security_report_{scan_data.get('target', 'unknown')}_{scan_id[:8]}.pdf"

    return StreamingResponse(
        iter_pdf(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# -------- Startup Event --------
@app.on_event("startup")
async def startup_event():
    """Start background cleanup task on app startup"""
    logger.info("Starting periodic cleanup task...")
    asyncio.create_task(periodic_cleanup())


# ---------------- Health ----------------
@app.get("/health")
def health():
    return {"status": "ok"}

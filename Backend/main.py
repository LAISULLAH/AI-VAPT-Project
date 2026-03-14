from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.scan import router as scan_router

app = FastAPI(
    title="AI Based VAPT Backend",
    version="1.0.0"
)

# Add CORS middleware to handle preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)

@app.get("/")
def root():
    return {
        "status": "Backend Running",
        "engine": "AI Based VAPT",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

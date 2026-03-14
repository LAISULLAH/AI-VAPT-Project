from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.scan import router as scan_router

app = FastAPI(
    title="AI Based VAPT Backend",
    version="1.0.0"
)

# Allowed frontend origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://laisullah.github.io"
    "https://laisullah.github.io/AI-VAPT-Project"
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(scan_router)

# Root endpoint
@app.get("/")
def root():
    return {
        "status": "Backend Running",
        "engine": "AI Based VAPT",
        "version": "1.0.0"
    }

# Health check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}

# 🔐 AI VAPT API Security Setup Guide

## ✅ What's Protected Now

All API endpoints are now **PRIVATE and REQUIRE AUTHENTICATION**:
- ✅ All scan endpoints (`/scan`, `/scan/full`, `/scan/init`)
- ✅ WebSocket endpoints (`/ws/scan/{scan_id}`)
- ✅ Report endpoints (`/report/{scan_id}/pdf`)
- ✅ Status endpoints (`/status/{scan_id}`)
- ✅ Event endpoints (`/events/{scan_id}`)

Public endpoints (no auth needed):
- `/` - Root
- `/health` - Health check
- `/docs` - Swagger documentation
- `/openapi.json` - OpenAPI schema

---

## 🚀 Quick Start

### 1. Set Your API Secret

```bash
# Copy the example file
cp .env.example .env

# Edit .env and set a STRONG SECRET KEY
nano .env
# Change: AI_VAPT_API_SECRET=your-super-secret-api-key-change-this-in-production
```

Generate a strong secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Start the Backend

```bash
cd Backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### 3. Make Authenticated Requests

**Using Header (Recommended):**
```bash
curl -X POST http://127.0.0.1:8000/scan \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-super-secret-api-key-change-this-in-production" \
  -d '{"target": "example.com"}'
```

**Using Query Parameter:**
```bash
curl http://127.0.0.1:8000/status/scan-id-here?api_key=your-secret-key
```

**Using x-access-token Header:**
```bash
curl -H "x-access-token: your-super-secret-api-key-change-this-in-production" \
  http://127.0.0.1:8000/health
```

---

## 🐍 Python Client Example

```python
import requests

API_KEY = "your-super-secret-api-key-change-this-in-production"
BASE_URL = "http://127.0.0.1:8000"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Start a scan
response = requests.post(
    f"{BASE_URL}/scan",
    headers=headers,
    json={"target": "example.com"}
)

print(response.json())
```

---

## 🔧 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `AI_VAPT_API_SECRET` | **YES** | API authentication key | None (fails if missing) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins | `http://localhost:3000,http://127.0.0.1:3000,https://laisullah.github.io` |

---

## ⚠️ IMPORTANT SECURITY NOTES

### For GitHub/Public Repo:

1. **NEVER commit `.env` file** - Already in `.gitignore`
   ```bash
   # Verify .env is ignored
   git check-ignore .env  # Should output: .env
   ```

2. **Generate Production Secrets:**
   ```python
   # Generate cryptographically secure random key
   import secrets
   secret = secrets.token_urlsafe(32)  # 32 bytes = 256 bits
   print(secret)
   ```

3. **Store Secrets Safely:**
   - GitHub Secrets (for CI/CD)
   - Environment variables (on hosting platform)
   - Secret management tools (HashiCorp Vault, AWS Secrets Manager, etc.)
   - Never in code, config files, or version control

4. **Production Deployment:**
   ```bash
   # On your server/cloud platform, set:
   export AI_VAPT_API_SECRET="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

---

## 🔑 API Key Locations (Checked in Order)

The middleware checks for API key in this order:
1. `x-api-key` header
2. `x-access-token` header
3. `token` query parameter
4. `api_key` query parameter

Example with all methods:
```bash
# Method 1: Header (Best Practice)
curl -H "x-api-key: SECRET" http://localhost:8000/health

# Method 2: Query Param (Less Secure - avoid in production)
curl http://localhost:8000/health?api_key=SECRET

# Method 3: x-access-token Header
curl -H "x-access-token: SECRET" http://localhost:8000/health
```

---

## ✅ Verify Setup

```bash
# 1. Health check (PUBLIC - no auth needed)
curl http://127.0.0.1:8000/health
# Response: {"status":"ok"}

# 2. Try without key (should fail)
curl -X POST http://127.0.0.1:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"target": "example.com"}'
# Response: 401 - Unauthorized

# 3. Try with key (should work)
curl -X POST http://127.0.0.1:8000/scan \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{"target": "example.com"}'
# Response: {"scan_id": "..."}
```

---

## 📋 Middleware Features

The `AuthMiddleware` provides:
- ✅ Global authentication on all endpoints (except public paths)
- ✅ Support for multiple auth header types
- ✅ Detailed logging of unauthorized attempts
- ✅ 401 Unauthorized responses with helpful error messages

---

## 🚨 Troubleshooting

### "API_SECRET environment variable is required"
- Copy `.env.example` to `.env`
- Set `AI_VAPT_API_SECRET` to a strong value
- Restart the server

### "Unauthorized: Invalid or missing API key"
- Ensure you're including the API key in headers or query params
- Verify the key matches the `AI_VAPT_API_SECRET` environment variable
- Check header name: use `x-api-key` or `x-access-token`

### CORS errors
- Verify your frontend origin is in `CORS_ORIGINS` env variable
- Default allowed: `http://localhost:3000`, `http://127.0.0.1:3000`

---

## 📚 Related Files

- `.env.example` - Template for environment variables
- `.gitignore` - Excludes sensitive files from git
- `main.py` - Contains `AuthMiddleware` implementation
- `requirements.txt` - Added `python-dotenv` dependency

---

## 🎯 Summary

Your API is now:
- ✅ **Private** - Requires authentication for all protected endpoints
- ✅ **Secure** - CORS restricted, SSL validation enabled, private IPs blocked
- ✅ **Protected** - Secrets never committed to GitHub
- ✅ **Production-ready** - Environment variable based configuration

**Never share your API secret, and always use `.env` for local development!**

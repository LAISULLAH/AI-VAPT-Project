FROM python:3.10-slim

WORKDIR /app

# Install system dependencies with build tools
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    nmap \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim

# Build arguments
ARG ENABLE_CONSOLE_OUTPUT=false

ENV PYTHONPATH=/app
ENV FLASK_ENV=production
ENV FLASK_APP=app.py
ENV ENABLE_CONSOLE_OUTPUT=${ENABLE_CONSOLE_OUTPUT}

# Create application directory and temp directory
RUN mkdir -p /app/temp && chmod 777 /app/temp
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
COPY . .
# Install system dependencies required for some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev

# Ensure the .local/bin is in PATH
ENV PATH=/root/.local/bin:$PATH

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]

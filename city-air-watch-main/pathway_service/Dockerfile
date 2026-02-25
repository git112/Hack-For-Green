# Pathway Service Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements or just install directly
RUN pip install pathway google-generativeai fastapi uvicorn python-dotenv

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the engine
CMD ["python", "pathway_engine.py"]

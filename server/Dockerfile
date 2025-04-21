FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for Python packages and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    # 图像处理相关依赖
    zlib1g-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libfreetype6-dev \
    libwebp-dev \
    # 清理
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the src directory to app directory
COPY src/ ./src/

# Copy other necessary files
COPY .env* ./

# Create necessary directories
RUN mkdir -p outputs
RUN mkdir -p templates
RUN mkdir -p generated_images
RUN mkdir -p minimaxi_videos
RUN mkdir -p videos
RUN mkdir -p magazine_cards
RUN mkdir -p uploads

# Set proper permissions
RUN chmod -R 755 /app

# Add app directory to Python path
ENV PYTHONPATH=/app:$PYTHONPATH

# Expose port for FastAPI
EXPOSE 8000

# Command to run the application using module path to ensure imports work correctly
CMD ["uvicorn", "src.api_service:app", "--host", "0.0.0.0", "--port", "8000"] 
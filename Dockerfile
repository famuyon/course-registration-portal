# Use Python 3.11 slim image (compatible with Django 5.0.1)
FROM python:3.11-slim

# Set working directory to backend
WORKDIR /app/backend

# Environment settings for Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for building wheels (Pillow, psycopg2, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the application
COPY . /app/

# Set environment variables
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=backend.settings.production

# Expose port
EXPOSE 8000

# Run migrations and start the server
CMD python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 
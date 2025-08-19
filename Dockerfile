# Use Python 3.11 slim image (compatible with Django 5.0.1)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=backend.settings.production

# Expose port
EXPOSE 8000

# Run migrations and start the server
CMD cd backend && python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 
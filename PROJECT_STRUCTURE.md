# Course Registration Portal - Project Structure

## Overview

The Course Registration Portal has been restructured for optimal deployment on Render. The project now follows a clear separation of concerns with dedicated frontend and backend directories.

## Final Project Structure

```
course_registration_portal/
├── backend/                           # Django Backend Application
│   ├── apps/                          # Django Applications
│   │   ├── users/                     # User management app
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── backends.py
│   │   ├── courses/                   # Course management app
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   └── registration/              # Registration process app
│   │       ├── models.py
│   │       ├── views.py
│   │       ├── serializers.py
│   │       ├── urls.py
│   │       └── admin.py
│   ├── settings/                      # Django Settings Configuration
│   │   ├── __init__.py
│   │   ├── base.py                    # Base settings (shared)
│   │   ├── development.py             # Development settings
│   │   └── production.py              # Production settings
│   ├── core/                          # Core configurations
│   ├── media/                         # Media files
│   ├── manage.py                      # Django management script
│   ├── requirements.txt               # Python dependencies
│   ├── build.sh                       # Build script for Render
│   ├── wsgi.py                        # WSGI configuration
│   ├── asgi.py                        # ASGI configuration
│   ├── urls.py                        # Main URL configuration
│   └── db.sqlite3                     # SQLite database (development)
├── frontend/                          # React Frontend Application
│   ├── src/                           # Source code
│   │   ├── components/                # React components
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # API services
│   │   ├── hooks/                     # Custom React hooks
│   │   └── utils/                     # Utility functions
│   ├── public/                        # Public assets
│   ├── build/                         # Production build
│   ├── package.json                   # Node.js dependencies
│   ├── package-lock.json              # Locked dependencies
│   ├── env.example                    # Environment variables example
│   ├── webpack.config.js              # Webpack configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── README.md                      # Frontend documentation
├── render.yaml                        # Render deployment configuration
├── DEPLOYMENT.md                      # Deployment guide
├── PROJECT_STRUCTURE.md               # This file
├── README.md                          # Main project documentation
└── Documentation files...
```

## Key Changes Made

### 1. Backend Restructuring
- **Moved Django apps** (`users`, `courses`, `registration`) to `backend/apps/`
- **Created modular settings** with separate files for development and production
- **Updated import paths** to reflect new structure (`apps.users`, `apps.courses`, etc.)
- **Added production-ready configurations** including PostgreSQL support
- **Included build script** for automated deployment

### 2. Frontend Organization
- **Maintained existing React structure** with proper build configuration
- **Added environment configuration** for API endpoints
- **Updated package.json** with proper build scripts
- **Prepared for static hosting** on Render

### 3. Deployment Configuration
- **Created render.yaml** for automated deployment
- **Configured separate services** for backend and frontend
- **Set up PostgreSQL database** integration
- **Added environment variable management**

## Benefits of New Structure

### 1. Clear Separation
- Frontend and backend are completely separate
- Each can be deployed independently
- Easier to maintain and scale

### 2. Production Ready
- Proper settings for development and production
- Database configuration for PostgreSQL
- Security settings for production deployment
- Static file handling with WhiteNoise

### 3. Deployment Optimized
- Automated deployment with Render
- Build scripts for both frontend and backend
- Environment variable management
- Database migration automation

### 4. Development Friendly
- Clear directory structure
- Separate configuration files
- Easy local development setup
- Proper import paths

## Next Steps

1. **Deploy to Render** using the provided `render.yaml`
2. **Set environment variables** in Render dashboard
3. **Test the application** in production environment
4. **Monitor logs** for any issues
5. **Scale as needed** using Render's scaling options

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp env.example .env
# Edit .env with your backend URL
npm start
```

## Deployment

Follow the detailed instructions in `DEPLOYMENT.md` for step-by-step deployment guidance on Render. 
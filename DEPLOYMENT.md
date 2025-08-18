# Deployment Guide for Course Registration Portal

This guide explains how to deploy the Course Registration Portal on Render.

## Project Structure

After restructuring, the project now has a clear separation between frontend and backend:

```
course_registration_portal/
├── backend/                    # Django Backend
│   ├── apps/                   # Django Applications
│   │   ├── users/
│   │   ├── courses/
│   │   └── registration/
│   ├── settings/               # Django Settings
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh
│   └── wsgi.py
├── frontend/                   # React Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── env.example
├── render.yaml                 # Render Configuration
└── README.md
```

## Deployment on Render

### 1. Backend Deployment

The backend is configured as a Python web service in `render.yaml`:

- **Environment**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn backend.wsgi:application`
- **Database**: PostgreSQL (automatically provisioned)

### 2. Frontend Deployment

The frontend is configured as a static site in `render.yaml`:

- **Environment**: Static
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Path**: `frontend/build`

### 3. Environment Variables

#### Backend Environment Variables (set in Render dashboard):

- `SECRET_KEY`: Django secret key (auto-generated)
- `DEBUG`: Set to `false` for production
- `ALLOWED_HOSTS`: `.onrender.com`
- `DATABASE_URL`: PostgreSQL connection string (auto-provided)
- `CORS_ALLOWED_ORIGINS`: Frontend URL
- `CSRF_TRUSTED_ORIGINS`: Frontend URL

#### Frontend Environment Variables:

- `REACT_APP_API_URL`: Backend API URL

## Local Development Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Start development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp env.example .env
```

4. Update `.env` with your backend URL:
```
REACT_APP_API_URL=http://localhost:8000/api
```

5. Start development server:
```bash
npm start
```

## Database Migration

When deploying to production, the database will be automatically migrated using the build script. For local development, you can run:

```bash
cd backend
python manage.py migrate
```

## Static Files

Static files are automatically collected and served using WhiteNoise. The build script handles this automatically.

## Security Considerations

- Production settings include HTTPS redirects
- CORS is properly configured for production
- CSRF protection is enabled
- Security headers are set
- Database connections use SSL

## Troubleshooting

### Common Issues:

1. **Import Errors**: Make sure all Django apps are properly referenced in `INSTALLED_APPS`
2. **Database Connection**: Ensure `DATABASE_URL` is properly set in production
3. **Static Files**: Check that `STATIC_ROOT` is properly configured
4. **CORS Issues**: Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL

### Logs:

Check Render logs for detailed error information:
- Backend logs: Available in the Render dashboard
- Frontend build logs: Available during deployment

## Support

For issues with the deployment, check:
1. Render documentation
2. Django deployment checklist
3. React build configuration 
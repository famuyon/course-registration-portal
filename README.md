# Course Registration Portal

A web-based course registration system built with Django (backend) and React (frontend).

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn
- PostgreSQL (optional, SQLite is configured by default)

## Setup Instructions

### Backend Setup

1. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Apply database migrations:
```bash
python manage.py migrate
```

4. Create a superuser (admin):
```bash
python manage.py createsuperuser
```

5. Run the development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_key_here
```

3. Start the development server:
```bash
npm start
```

The frontend application will be available at `http://localhost:3000`

## Running the Application

1. Start the backend server:
```bash
# Activate virtual environment if not already activated
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Run server
python manage.py runserver
```

2. In a separate terminal, start the frontend development server:
```bash
cd frontend
npm start
```

## Default User Roles

The system supports the following user roles:
- Student
- Registration Officer
- Head of Department (HOD)
- School Officer

To create users with different roles, use the Django admin interface at `http://localhost:8000/admin`

## Features

1. Student Features:
   - Course registration
   - View available courses
   - Track registration status
   - Download registration forms
   - View academic results

2. Administrative Features:
   - Manage departments and programs
   - Course management
   - Registration approval workflow
   - Digital signature system
   - Session management

3. System Features:
   - Real-time notifications
   - Role-based access control
   - Document generation
   - Audit trail

## Development

### Backend Structure
- `users/` - User management
- `courses/` - Course management
- `registration/` - Registration process
- `core/` - Core settings and configurations

### Frontend Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/services/` - API services
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions

## API Documentation

The API documentation is available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
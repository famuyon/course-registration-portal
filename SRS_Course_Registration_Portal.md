# Software Requirements Specification (SRS)
## Course Registration Portal System

---

### Document Information
- **Project Title:** Course Registration Portal
- **Version:** 1.0
- **Date:** July 2025
- **Institution:** Federal University of Technology, Akure (FUTA)
- **Document Type:** Software Requirements Specification

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Specifications](#6-technical-specifications)
7. [User Roles and Permissions](#7-user-roles-and-permissions)
8. [System Workflow](#8-system-workflow)

---

## 1. Introduction

### 1.1 Purpose
The Course Registration Portal is a comprehensive web-based application designed to streamline and digitize the course registration process for students at the Federal University of Technology, Akure (FUTA). The system facilitates online course registration, multi-level approval workflows, and generates printable course forms with digital signatures.

### 1.2 Scope
This system encompasses:
- Student course registration and management
- Multi-tiered approval system (Registration Officer → Head of Department → School Officer)
- Digital signature management
- Course form generation and printing
- User profile management
- Administrative oversight and control

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS:** Software Requirements Specification
- **FUTA:** Federal University of Technology, Akure
- **API:** Application Programming Interface
- **HOD:** Head of Department
- **UI/UX:** User Interface/User Experience
- **CRUD:** Create, Read, Update, Delete

### 1.4 References
- Django Documentation
- React.js Documentation
- REST API Design Standards
- University Academic Regulations

---

## 2. Overall Description

### 2.1 Product Perspective
The Course Registration Portal is a standalone web application consisting of:
- **Frontend:** React.js single-page application
- **Backend:** Django REST API
- **Database:** SQLite (development) / PostgreSQL (production ready)
- **Authentication:** JWT-based token authentication

### 2.2 Product Functions
1. **Student Management**
   - User registration and authentication
   - Profile management with photo upload
   - Course selection and registration
   - View registration status and approvals

2. **Administrative Functions**
   - Multi-level approval workflow
   - Digital signature upload and management
   - Course form generation
   - User management

3. **Reporting and Documentation**
   - Printable course registration forms
   - Approval tracking
   - Registration statistics

### 2.3 User Classes and Characteristics
1. **Students:** Primary users who register for courses
2. **Registration Officers:** Administrative staff who approve registrations
3. **Head of Department (HOD):** Academic heads who provide departmental approval
4. **School Officers:** Senior administrative officers who provide final endorsement

### 2.4 Operating Environment
- **Client Side:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server Side:** Cross-platform (Windows, Linux, macOS)
- **Database:** SQLite/PostgreSQL
- **Network:** Internet connectivity required

---

## 3. System Features

### 3.1 User Authentication and Authorization
**Description:** Secure login system with role-based access control
**Functional Requirements:**
- Multiple user types with different access levels
- Secure password authentication
- Session management
- Role-based dashboard access

**Credentials:**
- Student: Individual credentials
- Registration Officer: admin/admin123
- Head of Department: HOD/HOD123
- School Officer: schoolofficer/schoolofficer123

### 3.2 Course Registration Management
**Description:** Core functionality for course selection and registration
**Functional Requirements:**
- Browse available courses by department and level
- Add/remove courses from registration
- View course details (units, prerequisites, capacity)
- Registration status tracking
- Academic session management

### 3.3 Approval Workflow System
**Description:** Three-tier approval process for course registrations
**Functional Requirements:**
- Registration Officer approval (Level 1)
- Head of Department approval (Level 2)  
- School Officer endorsement (Level 3)
- Status tracking at each approval level
- Email notifications (future enhancement)

### 3.4 Digital Signature Management
**Description:** Upload and manage digital signatures for approvals
**Functional Requirements:**
- Signature image upload
- Signature attachment to approvals
- Signature display on course forms
- Profile-based signature management

### 3.5 Course Form Generation and Printing
**Description:** Generate printable course registration forms
**Functional Requirements:**
- Dynamic form generation with student details
- Integration of digital signatures
- Print-optimized layout (single page)
- Watermark for approved forms
- PDF generation capability

### 3.6 User Profile Management
**Description:** Comprehensive user profile management
**Functional Requirements:**
- Personal information management
- Profile picture upload
- Contact information updates
- Academic details (matriculation number, level, department)

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- **Responsive Web Interface:** Compatible with desktop and mobile devices
- **Intuitive Navigation:** Role-based menu systems
- **Modern UI Design:** Clean, professional appearance
- **Accessibility:** WCAG 2.1 compliant design

### 4.2 Hardware Interfaces
- Standard web server hardware requirements
- Client devices: Desktop computers, laptops, tablets, smartphones

### 4.3 Software Interfaces
- **Operating System:** Cross-platform compatibility
- **Web Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Database:** SQLite/PostgreSQL
- **File Storage:** Local file system for media uploads

### 4.4 Communication Interfaces
- **HTTP/HTTPS:** Secure web communication
- **REST API:** JSON-based data exchange
- **WebSocket:** Real-time updates (future enhancement)

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **Response Time:** Page loads within 3 seconds
- **Throughput:** Support 100+ concurrent users
- **Scalability:** Horizontally scalable architecture

### 5.2 Safety Requirements
- **Data Backup:** Regular automated backups
- **Error Recovery:** Graceful error handling
- **Data Integrity:** Transaction-based operations

### 5.3 Security Requirements
- **Authentication:** JWT token-based authentication
- **Authorization:** Role-based access control
- **Data Encryption:** HTTPS for data transmission
- **Input Validation:** Comprehensive server-side validation
- **SQL Injection Prevention:** Parameterized queries

### 5.4 Software Quality Attributes
- **Reliability:** 99.5% uptime
- **Usability:** Intuitive user interface
- **Maintainability:** Modular code architecture
- **Portability:** Cross-platform deployment

---

## 6. Technical Specifications

### 6.1 Architecture
**Frontend:**
- Framework: React.js 18+
- State Management: React Context API
- Routing: React Router
- Styling: CSS3 with responsive design
- Build Tool: Webpack

**Backend:**
- Framework: Django 5.0.1
- API: Django REST Framework
- Authentication: JWT (djangorestframework-simplejwt)
- CORS: django-cors-headers
- Database ORM: Django ORM

**Database Schema:**
- Users (Student, Staff profiles)
- Courses (Academic courses)
- Departments (Academic departments)
- Registrations (Course registrations)
- Registration Approvals (Approval workflow)
- Registration Signatures (Digital signatures)

### 6.2 API Endpoints
```
Authentication:
POST /api/auth/login/ - User login
POST /api/auth/logout/ - User logout
POST /api/auth/refresh/ - Token refresh

User Management:
GET /api/me/ - Current user profile
PUT /api/profile/update/ - Update profile
POST /api/upload/signature/ - Upload signature

Course Management:
GET /api/courses/ - List available courses
GET /api/courses/departments/ - List departments
GET /api/courses/registrations/status/ - Registration status

Registration:
POST /api/registrations/ - Create registration
GET /api/registrations/ - List registrations
PUT /api/registrations/{id}/approve/ - Approve registration
POST /api/registrations/{id}/append-signature/ - Append signature

Forms:
GET /api/forms/course-form/{id}/ - Generate course form
```

### 6.3 File Structure
```
course_registration_portal/
├── backend/                 # Django project
├── frontend/               # React application
├── courses/                # Course management app
├── users/                  # User management app
├── registration/           # Registration workflow app
├── media/                  # File uploads
├── static/                 # Static files
└── venv/                   # Virtual environment
```

---

## 7. User Roles and Permissions

### 7.1 Student
**Permissions:**
- View available courses
- Register for courses
- Update personal profile
- View registration status
- Print course forms (when approved)

### 7.2 Registration Officer
**Permissions:**
- All student permissions
- Approve/reject student registrations
- Upload and manage signature
- View all registrations
- Access admin panel

### 7.3 Head of Department (HOD)
**Permissions:**
- All Registration Officer permissions
- Department-level oversight
- Final academic approval
- Signature management

### 7.4 School Officer
**Permissions:**
- Profile management
- Signature upload and management
- Final endorsement of registrations
- View approved registrations

---

## 8. System Workflow

### 8.1 Course Registration Process
1. **Student Login:** Authenticate using credentials
2. **Course Selection:** Browse and select courses
3. **Registration Submission:** Submit course registration
4. **Level 1 Approval:** Registration Officer reviews and approves
5. **Level 2 Approval:** Head of Department provides academic approval
6. **Level 3 Endorsement:** School Officer provides final endorsement
7. **Form Generation:** System generates printable course form
8. **Signature Integration:** Digital signatures appear on printed form

### 8.2 Approval Workflow
```
Student Registration → Registration Officer → Head of Department → School Officer → Approved
                    ↓                      ↓                   ↓
                 Level 1               Level 2             Level 3
                Approval              Approval           Endorsement
```

### 8.3 Data Flow
1. Frontend sends API requests to Django backend
2. Django processes requests using business logic
3. Database operations via Django ORM
4. Response data serialized and sent to frontend
5. Frontend updates UI based on response

---

## 9. Implementation Details

### 9.1 Development Environment
- **Python:** 3.13.5
- **Node.js:** 22.16.0
- **Package Management:** pip (Python), npm (Node.js)
- **Version Control:** Git
- **IDE:** VS Code, PyCharm

### 9.2 Deployment Architecture
- **Development:** Local servers (Django dev server, Webpack dev server)
- **Production:** Gunicorn + Nginx, PostgreSQL
- **Static Files:** WhiteNoise (Django) or CDN
- **Media Files:** Local storage or cloud storage

### 9.3 Key Features Implemented
✅ Multi-user authentication system
✅ Role-based access control
✅ Course registration workflow
✅ Three-tier approval system
✅ Digital signature management
✅ Printable course forms with watermarks
✅ Responsive web design
✅ Profile management with file uploads
✅ RESTful API architecture
✅ Real-time status updates

---

## 10. Future Enhancements

### 10.1 Planned Features
- Email notification system
- Mobile application (React Native)
- Advanced reporting and analytics
- Integration with academic calendar
- Bulk course operations
- SMS notifications
- Multi-language support

### 10.2 Scalability Considerations
- Microservices architecture
- Container deployment (Docker)
- Load balancing
- Database clustering
- CDN integration
- Caching layer (Redis)

---

## 11. Conclusion

The Course Registration Portal successfully digitizes and streamlines the traditional course registration process, providing a modern, efficient, and user-friendly solution for academic institutions. The system's modular architecture, comprehensive feature set, and scalable design make it suitable for institutions of various sizes while maintaining security, reliability, and performance standards.

---

**Document Prepared By:** AI Development Team  
**Document Reviewed By:** System Architect  
**Approval Date:** July 2025  
**Next Review Date:** January 2026 
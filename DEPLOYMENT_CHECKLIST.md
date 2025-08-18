# Deployment Checklist - Course Registration Portal

## ✅ Step-by-Step Deployment Guide

### **Phase 1: GitHub Setup**

- [ ] **1.1** Go to [GitHub.com](https://github.com) and sign in
- [ ] **1.2** Click "+" → "New repository"
- [ ] **1.3** Repository name: `course-registration-portal`
- [ ] **1.4** Description: `Course Registration Portal - Django + React`
- [ ] **1.5** Make it **Public**
- [ ] **1.6** **DO NOT** check any boxes (README, .gitignore, license)
- [ ] **1.7** Click "Create repository"
- [ ] **1.8** Copy the repository URL (HTTPS)

### **Phase 2: Push Code to GitHub**

- [ ] **2.1** Open terminal in your project directory
- [ ] **2.2** Run: `git remote add origin https://github.com/YOUR_USERNAME/course-registration-portal.git`
- [ ] **2.3** Replace `YOUR_USERNAME` with your actual GitHub username
- [ ] **2.4** Run: `git push -u origin main`
- [ ] **2.5** Verify code is uploaded to GitHub

### **Phase 3: Render Setup**

- [ ] **3.1** Go to [render.com](https://render.com)
- [ ] **3.2** Click "Get Started"
- [ ] **3.3** Sign up with GitHub account
- [ ] **3.4** Complete signup process

### **Phase 4: Deploy with Blueprint**

- [ ] **4.1** In Render dashboard, click "New +"
- [ ] **4.2** Select "Blueprint"
- [ ] **4.3** Connect GitHub account (if not already connected)
- [ ] **4.4** Select repository: `course-registration-portal`
- [ ] **4.5** Click "Connect"
- [ ] **4.6** Wait for deployment to complete (5-10 minutes)

### **Phase 5: Configure Backend Environment**

- [ ] **5.1** Go to your backend service in Render
- [ ] **5.2** Click "Environment" tab
- [ ] **5.3** Add these environment variables:

```
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
```

- [ ] **5.4** For Gmail setup:
  - [ ] Enable 2-factor authentication
  - [ ] Generate App Password
  - [ ] Use App Password in EMAIL_HOST_PASSWORD

### **Phase 6: Configure Frontend Environment**

- [ ] **6.1** Go to your frontend service in Render
- [ ] **6.2** Click "Environment" tab
- [ ] **6.3** Add environment variable:
  ```
  REACT_APP_API_URL=https://your-backend-service-name.onrender.com/api
  ```
- [ ] **6.4** Replace `your-backend-service-name` with actual backend service name

### **Phase 7: Database Setup**

- [ ] **7.1** Go to your backend service in Render
- [ ] **7.2** Click "Shell" tab
- [ ] **7.3** Run: `python manage.py migrate`
- [ ] **7.4** Run: `python manage.py createsuperuser`
- [ ] **7.5** Follow prompts to create admin user:
  - Username: (your choice)
  - Email: (your email)
  - Password: (strong password)

### **Phase 8: Test Deployment**

- [ ] **8.1** Test Backend API: Visit `https://your-backend-name.onrender.com/api/`
- [ ] **8.2** Test Frontend: Visit `https://your-frontend-name.onrender.com`
- [ ] **8.3** Test Admin Panel: Visit `https://your-backend-name.onrender.com/admin/`
- [ ] **8.4** Login with superuser credentials
- [ ] **8.5** Test basic functionality

### **Phase 9: Troubleshooting (if needed)**

- [ ] **9.1** Check Render logs for errors
- [ ] **9.2** Verify environment variables are set correctly
- [ ] **9.3** Check database connection
- [ ] **9.4** Verify CORS settings
- [ ] **9.5** Test API endpoints

## 🔧 **Useful Commands**

### **Local Development**
```bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend
npm start
```

### **Render Shell Commands**
```bash
# Check logs
tail -f /var/log/app.log

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

## 📞 **Support**

If you encounter issues:

1. **Check Render logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Check the DEPLOYMENT.md** file for detailed instructions
4. **Review error messages** in the logs

## 🎉 **Success Indicators**

Your deployment is successful when:

- ✅ Backend API responds at `/api/`
- ✅ Frontend loads without errors
- ✅ Admin panel is accessible
- ✅ Database migrations completed
- ✅ Superuser can login
- ✅ No errors in Render logs

## 📝 **Notes**

- **Free tier limitations**: Render free tier has some limitations
- **Cold starts**: First request might be slow
- **Database**: PostgreSQL is automatically provisioned
- **SSL**: HTTPS is automatically enabled
- **Custom domains**: Can be added later if needed 
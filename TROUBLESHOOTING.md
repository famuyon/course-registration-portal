# Troubleshooting Guide - Course Registration Portal

## 🚨 Common Issues and Solutions

### **1. Build Failures**

#### **Issue**: Backend build fails
**Solution**:
- Check if `requirements.txt` is in the correct location (`backend/requirements.txt`)
- Verify all dependencies are listed
- Check Render logs for specific error messages

#### **Issue**: Frontend build fails
**Solution**:
- Ensure `package.json` is in the `frontend/` directory
- Check if all dependencies are properly listed
- Verify Node.js version compatibility

### **2. Database Connection Issues**

#### **Issue**: Database connection error
**Solution**:
- Verify `DATABASE_URL` environment variable is set
- Check if PostgreSQL service is running
- Ensure database migrations are run: `python manage.py migrate`

#### **Issue**: Migration errors
**Solution**:
- Run migrations manually in Render shell
- Check for conflicting migrations
- Reset database if needed (for development)

### **3. CORS Issues**

#### **Issue**: Frontend can't connect to backend
**Solution**:
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check `REACT_APP_API_URL` is set correctly
- Ensure backend is accessible

### **4. Static Files Issues**

#### **Issue**: Static files not loading
**Solution**:
- Run `python manage.py collectstatic` in Render shell
- Check `STATIC_ROOT` configuration
- Verify WhiteNoise is properly configured

### **5. Environment Variables**

#### **Issue**: Environment variables not working
**Solution**:
- Check variable names are correct (case-sensitive)
- Ensure variables are set in the correct service
- Restart the service after adding variables

### **6. Email Configuration**

#### **Issue**: Email not sending
**Solution**:
- Verify Gmail 2-factor authentication is enabled
- Use App Password instead of regular password
- Check email settings in environment variables

## 🔧 **Debugging Commands**

### **Check Service Status**
```bash
# In Render shell
ps aux | grep gunicorn
ps aux | grep node
```

### **Check Logs**
```bash
# Backend logs
tail -f /var/log/app.log

# System logs
dmesg | tail
```

### **Check Environment**
```bash
# List environment variables
env | grep -i django
env | grep -i database
```

### **Test Database Connection**
```bash
# In Django shell
python manage.py shell
>>> from django.db import connection
>>> cursor = connection.cursor()
```

## 📋 **Pre-Deployment Checklist**

Before deploying, ensure:

- [ ] All code is committed to Git
- [ ] `render.yaml` is in the root directory
- [ ] `requirements.txt` is in the backend directory
- [ ] `package.json` is in the frontend directory
- [ ] Environment variables are documented
- [ ] Database migrations are ready
- [ ] Static files are configured

## 🆘 **Getting Help**

### **1. Check Render Documentation**
- [Render Docs](https://render.com/docs)
- [Deployment Guide](https://render.com/docs/deploy-create-a-render-service)

### **2. Check Django Documentation**
- [Django Deployment](https://docs.djangoproject.com/en/5.0/howto/deployment/)
- [Django Settings](https://docs.djangoproject.com/en/5.0/topics/settings/)

### **3. Common Error Messages**

#### **"ModuleNotFoundError"**
- Check import paths in settings
- Verify app is in `INSTALLED_APPS`
- Check file structure

#### **"Database connection failed"**
- Verify `DATABASE_URL` format
- Check PostgreSQL service status
- Ensure database exists

#### **"Static files not found"**
- Run `collectstatic` command
- Check `STATIC_ROOT` path
- Verify WhiteNoise configuration

#### **"CORS policy blocked"**
- Check `CORS_ALLOWED_ORIGINS`
- Verify frontend URL format
- Ensure HTTPS is used in production

## 🎯 **Quick Fixes**

### **Reset Everything**
```bash
# In Render shell
python manage.py migrate --run-syncdb
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### **Check Service Health**
```bash
# Test API endpoint
curl https://your-backend.onrender.com/api/

# Test database
python manage.py check --database default
```

### **Common Environment Variables**
```bash
# Backend
SECRET_KEY=your-secret-key
DEBUG=false
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=postgresql://...
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com

# Frontend
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

## 📞 **Support Resources**

1. **Render Support**: [support.render.com](https://support.render.com)
2. **Django Community**: [forum.djangoproject.com](https://forum.djangoproject.com)
3. **Stack Overflow**: Tag with `django`, `react`, `render`
4. **GitHub Issues**: Check existing issues in similar projects

## 🎉 **Success Indicators**

Your deployment is working when:

- ✅ Backend responds at `/api/`
- ✅ Frontend loads without console errors
- ✅ Database migrations complete successfully
- ✅ Admin panel is accessible
- ✅ No 500 errors in logs
- ✅ Static files load properly
- ✅ CORS requests work
- ✅ Email functionality works (if configured) 
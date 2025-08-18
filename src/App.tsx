import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './pages/auth/RoleSelection';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import RegisteredCourses from './pages/courses/RegisteredCourses';
import RegisterCourses from './pages/courses/RegisterCourses';
import PrintCourseForm from './pages/courses/PrintCourseForm';
import AppendSignature from './pages/signature/AppendSignature';
import StudentSignature from './pages/signature/StudentSignature';
import AdminDashboard from './pages/admin/AdminDashboard';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import DashboardRoute from './components/auth/DashboardRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Role Selection Landing Page */}
          <Route path="/" element={<RoleSelection />} />
          
          {/* Login Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/:userType" element={<Login />} />
          
          {/* Legacy login route redirect to role selection */}
          <Route path="/login" element={<RoleSelection />} />
          
          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardRoute />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/append-signature"
            element={
              <PrivateRoute>
                <AdminProtectedRoute>
                  <Layout>
                    <AppendSignature />
                  </Layout>
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/registered-courses"
            element={
              <PrivateRoute>
                <Layout>
                  <RegisteredCourses />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/register-courses"
            element={
              <PrivateRoute>
                <Layout>
                  <RegisterCourses />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/print-course-form"
            element={
              <PrivateRoute>
                <Layout>
                  <PrintCourseForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/upload-signature"
            element={
              <PrivateRoute>
                <Layout>
                  <StudentSignature />
                </Layout>
              </PrivateRoute>
            }
          />

          
          {/* Admin Routes */}
          <Route
            path="/admin/registrations"
            element={
              <PrivateRoute>
                <AdminProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
 
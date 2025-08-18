import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dashboard from '../../pages/dashboard/Dashboard';
import Layout from '../layout/Layout';

const DashboardRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.user_type === 'school_officer') {
        // School officers go to append signature page
        navigate('/append-signature', { replace: true });
      } else {
        const isAdmin = user.user_type === 'registration_officer' || user.user_type === 'hod' || user.is_staff;
        
        if (isAdmin) {
          navigate('/admin/registrations', { replace: true });
        }
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading while determining user type
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: '500'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // If not admin or school officer, show dashboard
  const isAdmin = user?.user_type === 'registration_officer' || user?.user_type === 'hod' || user?.is_staff;
  const isSchoolOfficer = user?.user_type === 'school_officer';
  
  if (!isAdmin && !isSchoolOfficer) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  // Admin/school officer will be redirected by useEffect, but return null in the meantime
  return null;
};

export default DashboardRoute; 
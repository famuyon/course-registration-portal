import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      const isAdmin = user.user_type === 'registration_officer' || user.user_type === 'hod' || user.is_staff;
      
      if (isAdmin) {
        navigate('/admin/registrations', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading while determining redirect
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

  return null;
};

export default AdminRoute; 
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RegistrationApproval from './RegistrationApproval';
import CourseManagement from './CourseManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('registrations');

  if (!user || (user.user_type !== 'registration_officer' && user.user_type !== 'hod' && !user.is_staff)) {
    return (
      <div className="admin-dashboard-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'registrations':
        return <RegistrationApproval />;
      case 'courses':
        return <CourseManagement />;
      default:
        return <RegistrationApproval />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.username}! Manage your administrative tasks below.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          <span className="tab-icon">📋</span>
          Registration Approvals
        </button>
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <span className="tab-icon">📚</span>
          Course Management
        </button>
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 
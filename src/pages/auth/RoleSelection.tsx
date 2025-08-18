import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Clear any existing session when users land on role selection
  useEffect(() => {
    logout();
  }, [logout]);

  const handleRoleSelection = (role: string) => {
    switch (role) {
      case 'student':
        navigate('/login/student');
        break;
      case 'registration_officer':
        navigate('/login/registration-officer');
        break;
      case 'hod':
        navigate('/login/head-of-department');
        break;
      case 'school_officer':
        navigate('/login/school-officer');
        break;
      default:
        navigate('/login/student');
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-overlay">
        <div className="role-selection-card">
          <div className="welcome-header">
            <h1>Hi, welcome to the Course Registration Portal 👋</h1>
            <p>Please choose your role to continue:</p>
          </div>

          <div className="role-cards-container">
            {/* Student Portal */}
            <div className="role-card">
              <div className="role-icon">
                <div className="student-illustration">
                  <div className="student-figure">
                    <div className="student-head"></div>
                    <div className="student-body"></div>
                    <div className="student-laptop"></div>
                  </div>
                </div>
              </div>
              <div className="role-info">
                <h3>🎓 Student Portal</h3>
                <p>Access your courses and registration</p>
              </div>
              <button
                className="continue-btn student-btn"
                onClick={() => handleRoleSelection('student')}
              >
                Continue
              </button>
            </div>

            {/* Registration Officer */}
            <div className="role-card">
              <div className="role-icon">
                <div className="admin-illustration">
                  <div className="computer-screen">
                    <div className="screen-content">
                      <div className="screen-header"></div>
                      <div className="screen-body">
                        <div className="chart-bar bar1"></div>
                        <div className="chart-bar bar2"></div>
                        <div className="chart-bar bar3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="computer-base"></div>
                </div>
              </div>
              <div className="role-info">
                <h3>⚙️ Registration Officer</h3>
                <p>Manage course registrations and approvals</p>
              </div>
              <button
                className="continue-btn officer-btn"
                onClick={() => handleRoleSelection('registration_officer')}
              >
                Continue
              </button>
            </div>

            {/* Head of Department */}
            <div className="role-card">
              <div className="role-icon">
                <div className="admin-illustration">
                  <div className="computer-screen">
                    <div className="screen-content">
                      <div className="screen-header"></div>
                      <div className="screen-body">
                        <div className="chart-bar bar1"></div>
                        <div className="chart-bar bar2"></div>
                        <div className="chart-bar bar3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="computer-base"></div>
                </div>
              </div>
              <div className="role-info">
                <h3>👨‍💼 Head of Department</h3>
                <p>Oversee department operations and policies</p>
              </div>
              <button
                className="continue-btn hod-btn"
                onClick={() => handleRoleSelection('hod')}
              >
                Continue
              </button>
            </div>

            {/* School Officer */}
            <div className="role-card">
              <div className="role-icon">
                <div className="admin-illustration">
                  <div className="computer-screen">
                    <div className="screen-content">
                      <div className="screen-header"></div>
                      <div className="screen-body">
                        <div className="chart-bar bar1"></div>
                        <div className="chart-bar bar2"></div>
                        <div className="chart-bar bar3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="computer-base"></div>
                </div>
              </div>
              <div className="role-info">
                <h3>🏢 School Officer</h3>
                <p>Manage school documentation and signatures</p>
              </div>
              <button
                className="continue-btn school-officer-btn"
                onClick={() => handleRoleSelection('school_officer')}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 
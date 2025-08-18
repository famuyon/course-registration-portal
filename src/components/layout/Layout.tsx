import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRegistrationStatus } from '../../services/courses.service';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user, isLoading } = useAuth();
  const [hasApprovedCourses, setHasApprovedCourses] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const checkApprovedCourses = async () => {
      if (user && user.user_type === 'student') {
        try {
          const registrations = await getRegistrationStatus();
          const hasApproved = registrations.some(reg => reg.status === 'approved');
          setHasApprovedCourses(hasApproved);
        } catch (err) {
          console.error('Error checking approved courses:', err);
        }
      }
    };

    checkApprovedCourses();
  }, [user]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    const userType = user?.user_type;
    const isStaff = user?.is_staff;
    logout();
    setMobileMenuOpen(false);
    if (userType === 'registration_officer' || userType === 'hod' || userType === 'school_officer' || isStaff) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isAdmin = user?.user_type === 'registration_officer' || user?.user_type === 'hod' || user?.user_type === 'school_officer' || user?.is_staff;
  const isSchoolOfficer = user?.user_type === 'school_officer';

  if (isLoading) {
    return (
      <div className="layout">
        <div className="sidebar">
          <div className="nav-items">
            <div className="loading-nav">
              <div className="loading-text">Loading...</div>
            </div>
          </div>
        </div>
        <div className="main-content">
          {children}
        </div>
      </div>
    );
  }

  // Desktop sidebar
  const SidebarContent = (
    <>
      <div className="nav-items">
        {!isAdmin && (
          <>
            <div className="nav-item" onClick={() => handleNav('/dashboard')}>
              <span className="icon">📊</span>
              Dashboard
            </div>
            <div className="nav-item" onClick={() => handleNav('/register-courses')}>
              <span className="icon">📝</span>
              Register Courses
            </div>
            <div className="nav-item" onClick={() => handleNav('/registered-courses')}>
              <span className="icon">📚</span>
              My Courses
            </div>
            <div className="nav-item" onClick={() => handleNav('/print-course-form')}>
              <span className="icon">🖨️</span>
              Print Course Form
            </div>
            <div className="nav-item" onClick={() => handleNav('/upload-signature')}>
              <span className="icon">✍️</span>
              Upload Signature
            </div>
          </>
        )}
        <div className="nav-item" onClick={() => handleNav('/profile')}>
          <span className="icon">👤</span>
          Profile
        </div>
        {isAdmin && (
          <>
            <div className="nav-item" onClick={() => handleNav('/append-signature')}>
              <span className="icon">✍️</span>
              Append Signature
            </div>
            {!isSchoolOfficer && (
              <div className="nav-item admin-item" onClick={() => handleNav('/admin/registrations')}>
                <span className="icon">⚙️</span>
                Admin Panel
              </div>
            )}
          </>
        )}
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Log out
      </button>
    </>
  );

  return (
    <div className="layout">
      {/* Hamburger menu for mobile */}
      {windowWidth <= 768 && (
        <button
          className="mobile-menu-button print-hide"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          style={{ position: 'fixed', top: 20, left: 20, zIndex: 1100 }}
        >
          <span style={{ fontSize: '2rem' }}>☰</span>
        </button>
      )}

      {/* Sidebar for desktop */}
      <div className="sidebar" style={{ display: windowWidth > 768 ? 'flex' : 'none' }}>
        {SidebarContent}
      </div>

      {/* Mobile dropdown menu */}
      <div className={`mobile-menu${mobileMenuOpen ? ' active' : ''}`}>
        <div className="mobile-menu-header">
          <span style={{ fontWeight: 700, fontSize: '1.3rem' }}>Menu</span>
          <button className="close-menu" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>
        <div className="mobile-nav-links">
          {!isAdmin && (
            <>
              <div className="nav-item" onClick={() => handleNav('/dashboard')}>
                <span className="icon">📊</span>
                Dashboard
              </div>
              <div className="nav-item" onClick={() => handleNav('/register-courses')}>
                <span className="icon">📝</span>
                Register Courses
              </div>
              <div className="nav-item" onClick={() => handleNav('/registered-courses')}>
                <span className="icon">📚</span>
                My Courses
              </div>
              <div className="nav-item" onClick={() => handleNav('/print-course-form')}>
                <span className="icon">🖨️</span>
                Print Course Form
              </div>
              <div className="nav-item" onClick={() => handleNav('/upload-signature')}>
                <span className="icon">✍️</span>
                Upload Signature
              </div>
            </>
          )}
          <div className="nav-item" onClick={() => handleNav('/profile')}>
            <span className="icon">👤</span>
            Profile
          </div>
          {isAdmin && (
            <>
              <div className="nav-item" onClick={() => handleNav('/append-signature')}>
                <span className="icon">✍️</span>
                Append Signature
              </div>
              {!isSchoolOfficer && (
                <div className="nav-item admin-item" onClick={() => handleNav('/admin/registrations')}>
                  <span className="icon">⚙️</span>
                  Admin Panel
                </div>
              )}
            </>
          )}
          <button className="logout-button" onClick={handleLogout} style={{ marginTop: '2rem' }}>
            Log out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout; 
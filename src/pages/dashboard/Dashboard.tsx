import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourses, Course, getRegistrationStatus, RegistrationStatus } from '../../services/courses.service';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    registeredCourses: 0,
    availableCourses: 0
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch courses and registration status in parallel
        const [coursesData, statusData] = await Promise.all([
          getCourses(),
          getRegistrationStatus()
        ]);

        // Define standard course codes
        const standardCourseCodes = [
          'CSC508', 'CSC514',
          'SEN502', 'SEN504', 'SEN506',
          'SEN508', 'SEN510', 'SEN512'
        ];

        // Filter to only include standard courses
        const standardCourses = coursesData.filter(course => 
          standardCourseCodes.includes(course.code)
        );

        setCourses(standardCourses);
        
        // Filter out registrations with 0 total units (empty registrations)
        const activeRegistrations = statusData.filter(reg => reg.total_units > 0);
        
        // Calculate stats based on actual registration status
        let actualRegisteredCount = 0;
        if (activeRegistrations.length > 0) {
          // Count unique courses from active registrations
          const registeredCourseIds = new Set();
          activeRegistrations.forEach(registration => {
            if (registration.courses && registration.courses.length > 0) {
              registration.courses.forEach(regCourse => {
                if (regCourse.course?.id) {
                  registeredCourseIds.add(regCourse.course.id);
                }
              });
            }
          });
          actualRegisteredCount = registeredCourseIds.size;
        }
        
        setStats({
          totalCourses: standardCourses.length, // Use standard courses count
          registeredCourses: actualRegisteredCount,
          availableCourses: standardCourses.length - actualRegisteredCount
        });
        
        // Show recent 3 courses (only from standard courses)
        setRecentCourses(standardCourses.slice(0, 3));
        setRegistrationStatus(activeRegistrations);
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleRefresh = async () => {
    // Force refresh the data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch courses and registration status in parallel
        const [coursesData, statusData] = await Promise.all([
          getCourses(),
          getRegistrationStatus()
        ]);

        // Define standard course codes
        const standardCourseCodes = [
          'CSC508', 'CSC514',
          'SEN502', 'SEN504', 'SEN506',
          'SEN508', 'SEN510', 'SEN512'
        ];

        // Filter to only include standard courses
        const standardCourses = coursesData.filter(course => 
          standardCourseCodes.includes(course.code)
        );

        setCourses(standardCourses);
        
        // Filter out registrations with 0 total units (empty registrations)
        const activeRegistrations = statusData.filter(reg => reg.total_units > 0);
        
        // Calculate stats based on actual registration status
        let actualRegisteredCount = 0;
        if (activeRegistrations.length > 0) {
          // Count unique courses from active registrations
          const registeredCourseIds = new Set();
          activeRegistrations.forEach(registration => {
            if (registration.courses && registration.courses.length > 0) {
              registration.courses.forEach(regCourse => {
                if (regCourse.course?.id) {
                  registeredCourseIds.add(regCourse.course.id);
                }
              });
            }
          });
          actualRegisteredCount = registeredCourseIds.size;
        }
        
        setStats({
          totalCourses: standardCourses.length, // Use standard courses count
          registeredCourses: actualRegisteredCount,
          availableCourses: standardCourses.length - actualRegisteredCount
        });
        
        // Show recent 3 courses (only from standard courses)
        setRecentCourses(standardCourses.slice(0, 3));
        setRegistrationStatus(activeRegistrations);
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    await fetchData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>{getGreeting()}, {user?.username || 'Student'}!</h1>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Course Registration Portal</h2>
          <p>Manage your academic journey with ease</p>
        </div>

        {/* Dashboard content continues */}

        {!loading && (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <h2>TOTAL COURSES</h2>
                <div className="stat-number">{stats.totalCourses}</div>
                <p>Available in system</p>
              </div>

              <div className="stat-card">
                <h2>MY COURSES</h2>
                <div className="stat-number">{stats.registeredCourses}</div>
                <p>Currently registered</p>
              </div>
            </div>

            {/* Registration Status Section */}
            {registrationStatus.filter(reg => reg.total_units > 0).length > 0 ? (
              <div className="registration-status-section">
                <h2>Your Registration Status</h2>
                <div className="registration-status-container">
                  {registrationStatus.filter(reg => reg.total_units > 0).map((registration) => (
                    <div key={registration.id} className={`registration-status-card status-${registration.status}`}>
                      <div className="registration-header">
                        <h3>Course Registration</h3>
                        <span className={`status-badge status-${registration.status}`}>
                          {registration.status === 'pending' && '⏳ Pending'}
                          {registration.status === 'approved' && '✅ Approved'}
                          {registration.status === 'rejected' && '❌ Rejected'}
                        </span>
                      </div>
                      <div className="registration-details">
                        <p><strong>Session:</strong> {registration.session?.name || 'Current Session'}</p>
                        <p><strong>Level:</strong> {registration.level}</p>
                        <p><strong>Total Units:</strong> {registration.total_units}</p>
                        <p><strong>Submitted:</strong> {new Date(registration.submitted_at).toLocaleDateString()}</p>
                      </div>
                      {registration.courses && registration.courses.length > 0 && (
                        <div className="registered-courses-list">
                          <h4>Registered Courses:</h4>
                          <ul>
                            {registration.courses.map((regCourse, index) => (
                              <li key={index}>
                                {regCourse.course?.code} - {regCourse.course?.title} ({regCourse.course?.units} units)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {registration.status === 'approved' && registration.approvals && registration.approvals.length > 0 && (
                        <div className="approval-info">
                          <p><strong>Approved by:</strong> {registration.approvals[0].approved_by?.username}</p>
                          <p><strong>Approved on:</strong> {new Date(registration.approvals[0].approved_at).toLocaleDateString()}</p>
                          {registration.approvals[0].comments && (
                            <p><strong>Comments:</strong> {registration.approvals[0].comments}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="registration-status-section">
                <h2>Your Registration Status</h2>
                <div className="registration-status-container">
                  <div className="registration-status-card status-not-registered">
                    <div className="registration-header">
                      <h3>Course Registration</h3>
                      <span className="status-badge status-not-approved">
                        🚫 Not Approved
                      </span>
                    </div>
                    <div className="registration-details">
                      <p><strong>Status:</strong> No courses registered yet</p>
                      <p><strong>Action Required:</strong> Register for courses to submit for approval</p>
                    </div>
                    <div className="registration-help">
                      <p>📝 <strong>How to get approved:</strong></p>
                      <ol>
                        <li>Browse available courses below</li>
                        <li>Click "Register for Courses" to select your courses</li>
                        <li>Submit your registration for approval</li>
                        <li>Wait for admin approval</li>
                      </ol>
                    </div>
                    <div className="registration-actions">
                      <button 
                        className="register-now-btn"
                        onClick={() => navigate('/register-courses')}
                      >
                        📚 Register for Courses Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}



        {!loading && recentCourses.length > 0 && (
          <div className="dashboard-sections">
            <div className="dashboard-section">
              <h2>Recent Activity</h2>
              <div className="recent-courses">
                {recentCourses.map((course) => (
                  <div key={course.id} className="course-item">
                    <div className="course-info">
                      <h4>{course.code} - {course.title}</h4>
                      <p>{course.department.name} • {course.units} units</p>
                    </div>
                    <span className={`course-status ${course.is_registered ? 'status-registered' : 'status-pending'}`}>
                      {course.is_registered ? 'Registered' : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
              <a href="/registered-courses" className="view-all">
                View All Courses →
              </a>
            </div>
            
            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="recent-courses">
                <div className="course-item" onClick={() => navigate('/register-courses')} style={{ cursor: 'pointer' }}>
                  <div className="course-info">
                    <h4>Register for Courses</h4>
                    <p>Browse and register for new courses</p>
                  </div>
                  <span className="course-status status-pending">
                    Action
                  </span>
                </div>
                <div className="course-item" onClick={() => navigate('/registered-courses')} style={{ cursor: 'pointer' }}>
                  <div className="course-info">
                    <h4>My Registered Courses</h4>
                    <p>View your current course registrations</p>
                  </div>
                  <span className="course-status status-registered">
                    View
                  </span>
                </div>
                <div className="course-item" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                  <div className="course-info">
                    <h4>Profile Settings</h4>
                    <p>Update your personal information</p>
                  </div>
                  <span className="course-status status-pending">
                    Edit
                  </span>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
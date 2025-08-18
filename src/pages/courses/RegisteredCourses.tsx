import React, { useState, useEffect } from 'react';
import { getRegistrationStatus, RegistrationStatus, deregisterApprovedCourse } from '../../services/courses.service';
import './RegisteredCourses.css';

interface CourseInfo {
  id: number;
  code: string;
  title: string;
  units: number;
  level: number;
  semester: number;
  department: {
    name: string;
    code: string;
  };
}

const RegisteredCourses = () => {
  const [registrations, setRegistrations] = useState<RegistrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deregisteringCourse, setDeregisteringCourse] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      const data = await getRegistrationStatus();
      // Filter for approved registrations only
      const approvedRegistrations = data.filter(reg => reg.status === 'approved');
      setRegistrations(approvedRegistrations);
    } catch (err: any) {
      console.error('Error loading registration status:', err);
      setError(err.response?.data?.detail || 'Failed to load registered courses. Please try again later.');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeregister = async (courseId: number, courseCode: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to deregister from ${courseCode} - ${courseTitle}?`)) {
      return;
    }

    try {
      setDeregisteringCourse(courseId);
      setError('');
      setSuccessMessage('');
      
      const result = await deregisterApprovedCourse(courseId);
      
      // Check if registration was completely deleted or just updated
      if (result.registration_status === 'deleted') {
        setSuccessMessage(`Successfully deregistered from ${result.course_code}. ✅ All courses removed - you can now register for new courses.`);
      } else if (result.remaining_units === 0 && result.registration_status === 'pending') {
        setSuccessMessage(`Successfully deregistered from ${result.course_code}. ⚠️ All courses deregistered - your registration status has been reverted to PENDING approval.`);
      } else {
        setSuccessMessage(`Successfully deregistered from ${result.course_code}. Remaining units: ${result.remaining_units}`);
      }
      
      // Refresh the registrations list
      await loadRegistrations();
    } catch (err: any) {
      console.error('Error deregistering from course:', err);
      setError(err.response?.data?.detail || 'Failed to deregister from course. Please try again.');
    } finally {
      setDeregisteringCourse(null);
    }
  };

  // Extract all approved courses from registrations
  const getApprovedCourses = (): CourseInfo[] => {
    const courses: CourseInfo[] = [];
    registrations.forEach(registration => {
      if (registration.courses) {
        registration.courses.forEach(regCourse => {
          if (regCourse.course) {
            courses.push({
              id: regCourse.course.id,
              code: regCourse.course.code,
              title: regCourse.course.title,
              units: regCourse.course.units,
              level: regCourse.course.level,
              semester: regCourse.course.semester,
              department: regCourse.course.department
            });
          }
        });
      }
    });
    return courses;
  };

  const approvedCourses = getApprovedCourses();

  if (loading) {
    return (
      <div className="registered-courses">
        <div className="loading">Loading registered courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registered-courses">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadRegistrations}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="registered-courses">
      <h2>My Registered Courses</h2>
      
      {/* Success Message */}
      {successMessage && (
        <div className={`success-message ${successMessage.includes('⚠️') ? 'warning' : ''}`}>
          <p>{successMessage}</p>
        </div>
      )}
      
      {registrations.length === 0 ? (
        <div className="no-courses">
          <h3>No Approved Registrations</h3>
          <p>You don't have any approved course registrations yet.</p>
          <p>Submit a course registration and wait for approval.</p>
        </div>
      ) : (
        <>
          {/* Registration Summary */}
          <div className="registration-summary">
            <h3>Registration Summary</h3>
            {registrations.map(registration => (
              <div key={registration.id} className="registration-summary-card">
                <div className="summary-header">
                  <span className="status-badge approved">✅ Approved</span>
                  <span className="total-units">{registration.total_units} Units</span>
                </div>
                <div className="summary-details">
                  <p><strong>Session:</strong> {registration.session?.name || 'Current Session'}</p>
                  <p><strong>Level:</strong> {registration.level}</p>
                  <p><strong>Submitted:</strong> {new Date(registration.submitted_at).toLocaleDateString()}</p>
                  {registration.approvals && registration.approvals.length > 0 && (
                    <p><strong>Approved by:</strong> {registration.approvals[0].approved_by?.username} on {new Date(registration.approvals[0].approved_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Course Details */}
          {approvedCourses.length > 0 && (
            <div className="courses-section">
              <h3>Course Details ({approvedCourses.length} courses)</h3>
              <div className="courses-grid">
                {approvedCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-header">
                      <div className="course-code-badge">
                        {course.department.code}
                      </div>
                      <div className="course-info">
                        <h4>{course.code}</h4>
                        <h5>{course.title}</h5>
                      </div>
                    </div>
                    <div className="course-details">
                      <div className="detail-item">
                        <span className="label">Units:</span>
                        <span className="value">{course.units}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Level:</span>
                        <span className="value">{course.level}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Semester:</span>
                        <span className="value">{course.semester}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Department:</span>
                        <span className="value">{course.department.name}</span>
                      </div>
                    </div>
                    <div className="course-status">
                      <span className="status-indicator approved">
                        ✅ Registered & Approved
                      </span>
                    </div>
                    <div className="course-actions">
                      <button
                        className="deregister-button"
                        onClick={() => handleDeregister(course.id, course.code, course.title)}
                        disabled={deregisteringCourse === course.id}
                      >
                        {deregisteringCourse === course.id ? '🔄 Deregistering...' : '❌ Deregister'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RegisteredCourses; 
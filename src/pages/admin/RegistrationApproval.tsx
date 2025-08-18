import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllRegistrations, approveRegistration, PendingRegistration } from '../../services/courses.service';
import EditCoursesModal from '../../components/admin/EditCoursesModal';

import './RegistrationApproval.css';

const RegistrationApproval = () => {
  const { user } = useAuth();
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getAllRegistrations();
      setPendingRegistrations(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (registrationId: number, action: 'approve' | 'reject', comments?: string) => {
    try {
      setProcessingId(registrationId);
      await approveRegistration(registrationId, action, comments);
      setSuccess(`Registration ${action}d successfully!`);
      
      // Update the registration status in the list instead of removing it
      setPendingRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: action + 'd' }  // 'approved' or 'rejected'
            : reg
        )
      );
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${action} registration`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditCourses = (registration: PendingRegistration) => {
    setSelectedRegistration(registration);
    setEditModalOpen(true);
  };

  const handleCoursesUpdated = async (updatedRegistration: PendingRegistration) => {
    // Refresh the registrations list to get the latest data
    await fetchPendingRegistrations();
    
    // Show success message
    setSuccess('Courses updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedRegistration(null);
    // Refresh registrations when modal is closed
    fetchPendingRegistrations();
  };

  if (!user || (user.user_type !== 'registration_officer' && user.user_type !== 'hod' && !user.is_staff)) {
    return (
      <div className="approval-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="approval-container">
        <div className="loading">Loading pending registrations...</div>
      </div>
    );
  }

  return (
    <div className="approval-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {pendingRegistrations.length === 0 ? (
        <div className="no-registrations">
          <h3>🎉 No Registrations</h3>
          <p>No registrations found!</p>
        </div>
      ) : (
        <div className="registrations-grid">
          {pendingRegistrations.map((registration) => (
            <div key={registration.id} className={`registration-card ${registration.status}`}>
              <div className="registration-status">
                <span className={`status-badge ${registration.status}`}>
                  {registration.status === 'pending' && '⏳ Pending'}
                  {registration.status === 'approved' && '✅ Approved'}
                  {registration.status === 'rejected' && '❌ Rejected'}
                </span>
              </div>
              <div className="student-info">
                <div className="student-avatar">
                  {registration.student.first_name[0]}{registration.student.last_name[0]}
                </div>
                <div className="student-details">
                  <h3>{registration.student.first_name} {registration.student.last_name}</h3>
                  <p className="student-meta">
                    <strong>Username:</strong> {registration.student.username}<br/>
                    <strong>Email:</strong> {registration.student.email}<br/>
                    <strong>Matric No:</strong> {registration.student.matric_number}
                  </p>
                </div>
              </div>

              <div className="registration-info">
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Level:</strong> {registration.level}
                  </div>
                  <div className="info-item">
                    <strong>Semester:</strong> {registration.semester}
                  </div>
                  <div className="info-item">
                    <strong>Total Units:</strong> {registration.total_units}
                  </div>
                  <div className="info-item">
                    <strong>Submitted:</strong> {new Date(registration.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {registration.courses && registration.courses.length > 0 && (
                <div className="courses-section">
                  <h4>Registered Courses:</h4>
                  <div className="courses-list">
                    {registration.courses.map((regCourse, index) => (
                      <div key={index} className="course-item">
                        <span className="course-code">{regCourse.course?.code}</span>
                        <span className="course-title">{regCourse.course?.title}</span>
                        <span className="course-units">{regCourse.course?.units} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {registration.comments && (
                <div className="student-comments-section">
                  <h4>💬 Student Comments:</h4>
                  <div className="comments-box">
                    <p>{registration.comments}</p>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <button
                  className="edit-courses-btn"
                  onClick={() => handleEditCourses(registration)}
                  disabled={processingId === registration.id}
                >
                  📝 Edit Courses
                </button>
                
                {registration.status === 'pending' && (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => handleApproval(registration.id, 'approve')}
                      disabled={processingId === registration.id}
                    >
                      {processingId === registration.id ? '⏳ Approving...' : '✅ Approve'}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleApproval(registration.id, 'reject', 'Registration rejected by admin')}
                      disabled={processingId === registration.id}
                    >
                      {processingId === registration.id ? '⏳ Rejecting...' : '❌ Reject'}
                    </button>
                  </>
                )}
                
                {registration.status === 'approved' && (
                  <button
                    className="reject-btn"
                    onClick={() => handleApproval(registration.id, 'reject', 'Registration rejected by admin')}
                    disabled={processingId === registration.id}
                  >
                    {processingId === registration.id ? '⏳ Rejecting...' : '❌ Revoke Approval'}
                  </button>
                )}
                
                {registration.status === 'rejected' && (
                  <button
                    className="approve-btn"
                    onClick={() => handleApproval(registration.id, 'approve')}
                    disabled={processingId === registration.id}
                  >
                    {processingId === registration.id ? '⏳ Approving...' : '✅ Approve'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedRegistration && (
        <EditCoursesModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          registration={selectedRegistration}
          onSave={handleCoursesUpdated}
        />
      )}
    </div>
  );
};

export default RegistrationApproval; 
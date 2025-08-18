import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/axios.config';
import './AppendSignature.css';

interface Student {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  matric_number: string;
  department_name: string;
  level: number;
  profile_picture?: string;
}

interface RegistrationSignature {
  id: number;
  signed_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
  signed_at: string;
  signature_name: string;
  signature_title: string;
  signature_url?: string;
}

interface ApprovedRegistration {
  id: number;
  student: Student;
  session: any;
  total_units: number;
  submitted_at: string;
  courses: any[];
  signature_appended?: boolean;
  signatures: RegistrationSignature[];
}

const AppendSignature: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [currentSignature, setCurrentSignature] = useState<string>('');
  const [approvedRegistrations, setApprovedRegistrations] = useState<ApprovedRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Add signature order information
  const signatureOrder = [
    { type: 'registration_officer', title: 'Registration Officer' },
    { type: 'hod', title: 'Head of Department' },
    { type: 'school_officer', title: 'School Officer' }
  ];

  useEffect(() => {
    fetchCurrentSignature();
    fetchApprovedRegistrations();
  }, []);

  const fetchCurrentSignature = async () => {
    try {
      const response = await axios.get('/me/');
      const userData = response.data;
      console.log('User data received:', userData); // Debug log
      if (userData.signature) {
        const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';
        const signatureUrl = userData.signature.startsWith('http') 
          ? userData.signature 
          : `${baseUrl}${userData.signature}`;
        console.log('Setting signature URL:', signatureUrl); // Debug log
        setCurrentSignature(signatureUrl);
      } else {
        console.log('No signature found in user data'); // Debug log
        setCurrentSignature('');
      }
    } catch (err) {
      console.error('Error fetching current signature:', err);
    }
  };

  const fetchApprovedRegistrations = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      const response = await axios.get('/registrations/');
      const allRegistrations = response.data;
      
      if (!Array.isArray(allRegistrations)) {
        setError('Invalid response format from server');
        return;
      }
      
      // Filter only approved registrations
      const approved = allRegistrations.filter((reg: any) => reg.status === 'approved');
      setApprovedRegistrations(approved);
      
      if (approved.length === 0 && allRegistrations.length === 0) {
        setError('No registrations found in the system. Please create some test registrations first.');
      } else if (approved.length === 0) {
        const uniqueStatuses = Array.from(new Set(allRegistrations.map(r => r.status)));
        setError(`No approved registrations found. Found ${allRegistrations.length} total registrations with statuses: ${uniqueStatuses.join(', ')}`);
      }
    } catch (err: any) {
      console.error('Error fetching approved registrations:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please make sure you are logged in as a Registration Officer or Head of Department.');
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please contact system administrator.');
      } else {
        setError(`Failed to load approved registrations: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSignatureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSignaturePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleUploadSignature = async () => {
    if (!signatureFile) {
      setError('Please select a signature image');
      return;
    }

    setUploadingSignature(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('signature', signatureFile);

      const response = await axios.patch('/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Signature uploaded successfully!');
      setSignatureFile(null);
      setSignaturePreview('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Fetch the updated signature from server to ensure persistence
      await fetchCurrentSignature();
    } catch (err: any) {
      console.error('Error uploading signature:', err);
      setError(err.response?.data?.detail || 'Failed to upload signature');
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleAppendSignature = async (registrationId: number) => {
    // First check if we have a signature in state, if not try to fetch it
    if (!currentSignature) {
      await fetchCurrentSignature();
      // Check again after fetching
      if (!currentSignature) {
        setError('Please upload your signature first');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      
      // Call API to append signature to this registration
      await axios.post(`/registrations/${registrationId}/append-signature/`);
      
      setSuccess('Signature appended successfully!');
      
      // Refresh the registrations list to update the status
      await fetchApprovedRegistrations();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error appending signature:', err);
      setError(err.response?.data?.detail || 'Failed to append signature');
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePictureUrl = (student: Student) => {
    if (student.profile_picture) {
      if (student.profile_picture.startsWith('http')) {
        return student.profile_picture;
      }
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';
      return `${baseUrl}${student.profile_picture}`;
    }
    return null;
  };

  const getUserTypeDisplay = () => {
    switch (user?.user_type) {
      case 'registration_officer': return 'Registration Officer';
      case 'hod': return 'Head of Department';
      case 'school_officer': return 'School Officer';
      default: return 'Admin';
    }
  };

  const hasCurrentUserSigned = (registration: ApprovedRegistration) => {
    if (!user || !registration.signatures) return false;
    return registration.signatures.some(sig => sig.signed_by.id === user.id);
  };

  const getCurrentUserSignature = (registration: ApprovedRegistration) => {
    if (!user || !registration.signatures) return null;
    return registration.signatures.find(sig => sig.signed_by.id === user.id);
  };

  const getOtherSignatures = (registration: ApprovedRegistration) => {
    if (!user || !registration.signatures) return [];
    return registration.signatures.filter(sig => sig.signed_by.id !== user.id);
  };

  const getSignatureOrderStatus = (registration: ApprovedRegistration) => {
    const signatures = registration.signatures || [];
    const signedTypes = signatures.map(sig => sig.signed_by.user_type);
    
    return signatureOrder.map(role => ({
      ...role,
      signed: signedTypes.includes(role.type),
      canSign: user?.user_type === role.type && (
        role.type === 'registration_officer' ? true : // First can always sign
        role.type === 'hod' ? signedTypes.includes('registration_officer') : // HOD needs registration officer
        signedTypes.includes('hod') // School officer needs HOD
      )
    }));
  };

  if (!user || (user.user_type !== 'registration_officer' && user.user_type !== 'hod' && user.user_type !== 'school_officer' && !user.is_staff)) {
    return (
      <div className="append-signature-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="append-signature-container">
      <div className="signature-header">
        <h1>Append Signature</h1>
        <p>Upload your digital signature and append it to approved course registrations</p>
        <div className="signature-order-info">
          <h3>Required Signature Order:</h3>
          <div className="signature-order-steps">
            {signatureOrder.map((role, index) => (
              <div key={role.type} className="signature-step">
                <span className="step-number">{index + 1}</span>
                <span className="step-title">{role.title}</span>
                {index < signatureOrder.length - 1 && <span className="step-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signature Upload Section */}
      <div className="signature-upload-section">
        <h2>Your Digital Signature</h2>
        
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <span>✅</span>
            <strong>Success:</strong> {success}
          </div>
        )}

        <div className="signature-display">
          {currentSignature ? (
            <div className="current-signature">
              <h3>Current Signature:</h3>
              <div className="signature-preview">
                <img src={currentSignature} alt="Current signature" />
              </div>
            </div>
          ) : (
            <div className="no-signature">
              <span className="signature-icon">✍️</span>
              <p>No signature uploaded yet</p>
            </div>
          )}
        </div>

        <div className="upload-section">
          <div className="upload-controls">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSignatureChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="select-file-btn"
            >
              📁 Select Signature Image
            </button>
          </div>

          {signaturePreview && (
            <div className="signature-preview-section">
              <h4>Preview:</h4>
              <div className="signature-preview">
                <img src={signaturePreview} alt="Signature preview" />
              </div>
              <button
                type="button"
                onClick={handleUploadSignature}
                disabled={uploadingSignature}
                className="upload-btn"
              >
                {uploadingSignature ? '⏳ Uploading...' : '💾 Upload Signature'}
              </button>
            </div>
          )}
        </div>

        <div className="signature-guidelines">
          <h4>Guidelines:</h4>
          <ul>
            <li>Upload a clear image of your signature</li>
            <li>Supported formats: JPG, PNG, GIF</li>
            <li>Maximum file size: 5MB</li>
            <li>For best results, use a transparent background</li>
          </ul>
        </div>
      </div>

      {/* Approved Registrations Section */}
      <div className="approved-registrations-section">
        <h2>Approved Course Registrations</h2>
        <p>Students with approved registrations ready for signature</p>

        {loading && (
          <div className="loading">
            <span className="loading-spinner"></span>
            Loading registrations...
          </div>
        )}

        {!loading && approvedRegistrations.length === 0 && (
          <div className="no-registrations">
            <span className="icon">📄</span>
            <h3>No Approved Registrations</h3>
            <p>There are currently no approved course registrations requiring signatures.</p>
          </div>
        )}

        {!loading && approvedRegistrations.length > 0 && (
          <div className="registrations-list">
            {approvedRegistrations.map((registration) => (
              <div key={registration.id} className="registration-card">
                <div className="student-info">
                  <div className="student-avatar">
                    {getProfilePictureUrl(registration.student) ? (
                      <img 
                        src={getProfilePictureUrl(registration.student)!} 
                        alt="Student"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {registration.student.first_name?.[0] || registration.student.username?.[0] || 'S'}
                      </div>
                    )}
                  </div>
                  <div className="student-details">
                    <h3>
                      {registration.student.first_name && registration.student.last_name
                        ? `${registration.student.first_name} ${registration.student.last_name}`
                        : registration.student.username}
                    </h3>
                    <p className="matric-number">{registration.student.matric_number}</p>
                    <p className="department">{registration.student.department_name}</p>
                    <p className="level-units">Level {registration.student.level} • {registration.total_units} Units</p>
                    <p className="session-info">
                      <strong>Session:</strong> {registration.session?.name || 'Current Session'}
                    </p>
                  </div>
                </div>
                
                <div className="registration-actions">
                  <div className="registration-meta">
                    <span className="registration-date">
                      <strong>Submitted:</strong> {new Date(registration.submitted_at).toLocaleDateString()}
                    </span>
                    <span className="courses-count">
                      <strong>Courses:</strong> {registration.courses.length} registered
                    </span>
                    <span className="status-info">
                      <strong>Status:</strong> ✅ Approved
                    </span>
                  </div>
                  
                  {/* Course List */}
                  {registration.courses && registration.courses.length > 0 && (
                    <div className="courses-preview">
                      <strong>Registered Courses:</strong>
                      <div className="courses-mini-list">
                        {registration.courses.slice(0, 3).map((regCourse, index) => (
                          <span key={index} className="course-tag">
                            {regCourse.course?.code}
                          </span>
                        ))}
                        {registration.courses.length > 3 && (
                          <span className="more-courses">+{registration.courses.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="signature-status-section">
                    {/* Show signature order status */}
                    <div className="signature-order-status">
                      {getSignatureOrderStatus(registration).map((role) => (
                        <div 
                          key={role.type} 
                          className={`signature-status-item ${role.signed ? 'signed' : ''} ${role.canSign ? 'can-sign' : ''}`}
                        >
                          <span className="status-icon">
                            {role.signed ? '✅' : role.canSign ? '✍️' : '⏳'}
                          </span>
                          <span className="status-title">{role.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Show current user's signature status */}
                    {hasCurrentUserSigned(registration) ? (
                      <div className="signature-status">
                        <span className="signature-appended">
                          ✅ Your signature appended as {getUserTypeDisplay()}
                        </span>
                        <span className="signature-date">
                          on {new Date(getCurrentUserSignature(registration)?.signed_at || '').toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAppendSignature(registration.id)}
                        disabled={
                          !currentSignature || 
                          loading || 
                          !getSignatureOrderStatus(registration).find(
                            role => role.type === user?.user_type
                          )?.canSign
                        }
                        className="append-signature-btn"
                      >
                        {!currentSignature ? '⚠️ Upload Signature First' : 
                         loading ? '⏳ Processing...' :
                         !getSignatureOrderStatus(registration).find(
                           role => role.type === user?.user_type
                         )?.canSign ? '⏳ Waiting for Previous Signatures' :
                         '✍️ Append Your Signature'}
                      </button>
                    )}
                    
                    {/* Show other signatures */}
                    {getOtherSignatures(registration).length > 0 && (
                      <div className="other-signatures">
                        <strong>Other signatures:</strong>
                        {getOtherSignatures(registration).map((sig, index) => (
                          <span key={index} className="other-signature">
                            ✅ {sig.signature_title} ({sig.signature_name}) - {new Date(sig.signed_at).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppendSignature; 
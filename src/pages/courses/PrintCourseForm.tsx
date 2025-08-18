import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRegistrationStatus, RegistrationStatus } from '../../services/courses.service';
import { QRCodeSVG } from 'qrcode.react';
import axios from '../../services/axios.config';
import './PrintCourseForm.css';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  matric_number: string;
  level: number;
  department: {
    id: number;
    name: string;
    code: string;
  };
  department_name?: string;
  department_code?: string;
  phone_number?: string;
  profile_picture?: string;
  signature?: string;
}

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

const PrintCourseForm: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationStatus[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get registration status to find approved courses
        const registrationData = await getRegistrationStatus();
        console.log('Registration data:', registrationData); // Debug log
        
        // Include all registrations that have courses, regardless of status
        const activeRegistrations = registrationData.filter(reg => reg.courses && reg.courses.length > 0);
        setRegistrations(activeRegistrations);

        // Try to get detailed profile, but fallback to existing user data
        try {
          const profileResponse = await axios.get('/me/');
          setUserProfile(profileResponse.data);
        } catch (profileError) {
          // Use user data from context as fallback
          if (user) {
            setUserProfile({
              id: user.id,
              username: user.username,
              email: user.email,
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              matric_number: user.matric_number || '',
              level: user.level || 500,
              department: {
                id: user.department || 0,
                name: user.department_name || 'Software Engineering',
                code: user.department_code || 'SEN'
              },
              department_name: user.department_name,
              department_code: user.department_code,
              phone_number: user.phone_number,
              profile_picture: user.profile_picture
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Extract all courses from registrations
  const getApprovedCourses = (): CourseInfo[] => {
    const courses: CourseInfo[] = [];
    registrations.forEach(registration => {
      // Only include courses from approved registrations
      if (registration.courses && registration.status === 'approved') {
        registration.courses.forEach(regCourse => {
          // Check if the course object exists and has required properties
          if (regCourse && regCourse.course) {
            // Check if course is not already added (avoid duplicates)
            if (!courses.some(c => c.code === regCourse.course.code)) {
              courses.push({
                id: regCourse.course.id,
                code: regCourse.course.code,
                title: regCourse.course.title,
                units: regCourse.course.units,
                level: regCourse.course.level,
                semester: regCourse.course.semester,
                department: {
                  name: regCourse.course.department.name,
                  code: regCourse.course.department.code
                }
              });
            }
          }
        });
      }
    });
    
    // Sort courses by code for consistent display
    return courses.sort((a, b) => a.code.localeCompare(b.code));
  };

  const handlePrint = () => {
    window.print();
  };

  const approvedCourses = getApprovedCourses();
  const totalUnits = approvedCourses.reduce((sum, course) => sum + course.units, 0);
  const currentDate = new Date().toLocaleDateString('en-GB');
  const academicSession = `2ND SEMESTER 2025/2026 ACADEMIC SESSION`;

  // Get profile picture URL
  const getProfilePictureUrl = () => {
    const profilePic = userProfile?.profile_picture || user?.profile_picture;
    if (profilePic) {
      if (profilePic.startsWith('http')) {
        return profilePic;
      }
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';
      return `${baseUrl}${profilePic}`;
    }
    return null;
  };

  // Get display data with fallbacks
  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name.toUpperCase()} ${userProfile.last_name.toUpperCase()}`;
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`;
    }
    return user?.username?.toUpperCase() || 'STUDENT NAME';
  };

  const getMatricNumber = () => {
    const matric = userProfile?.matric_number || user?.matric_number || user?.username || 'N/A';
    // Format matric number to match the style in image (e.g., SEN190/716)
    if (matric && matric.length > 3 && !matric.includes('/')) {
      const prefix = matric.substring(0, 3);
      const remaining = matric.substring(3);
      if (remaining.length >= 3) {
        return `${prefix}${remaining.substring(0, 3)}/${remaining.substring(3)}`;
      }
    }
    return matric;
  };

  const getDepartmentName = () => {
    return (userProfile?.department_name || user?.department_name || 'SOFTWARE ENGINEERING').toUpperCase();
  };

  const getLevel = () => {
    return userProfile?.level || user?.level || 500;
  };

  const getContactInfo = () => {
    const phone = userProfile?.phone_number || user?.phone_number || '';
    const email = userProfile?.email || user?.email || '';
    
    if (phone && email) {
      return `${phone}/${email}`;
    }
    return email || phone || 'N/A';
  };

  const getSignatureByTitle = (title: string) => {
    if (!registrations[0]?.signatures) return null;
    return registrations[0].signatures.find((sig: any) => sig.signature_title === title);
  };

  const getStudentSignatureUrl = () => {
    const studentSignature = userProfile?.signature || user?.signature;
    if (studentSignature) {
      if (studentSignature.startsWith('http')) {
        return studentSignature;
      }
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';
      return `${baseUrl}${studentSignature}`;
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading course registration form...</div>;
  }

  // Show message if no courses
  if (approvedCourses.length === 0) {
    return (
      <div className="print-course-form">
        <div className="no-approved-courses">
          <div className="message-container">
            <h3>📋 Course Registration Form</h3>
            <p>Your course registration form will be available here once you have registered for courses.</p>
            <div className="status-info">
              <span className="status-icon">⏳</span>
              <span>No courses registered yet...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="print-course-form">
      <div className="no-print">
        <button onClick={handlePrint} className="print-btn">
          🖨️ Print Course Form
        </button>
        <p className="course-info">
          {approvedCourses.length > 0 ? 
            `Found ${approvedCourses.length} approved courses (${totalUnits} units)` : 
            'No approved course registrations found'
          }
        </p>
      </div>

      <div className="course-form-document">
        {/* Header */}
        <div className="document-header">
          <div className="header-content">
            <div className="university-logo">
              <img src="/futa-logo.png" alt="FUTA Logo" />
            </div>
            <div className="university-info">
              <h1>FEDERAL UNIVERSITY OF TECHNOLOGY, AKURE</h1>
              <p>PMB 704, AKURE, ONDO STATE OF NIGERIA</p>
              <p>{academicSession} COURSE REGISTRATION REPORT</p>
            </div>
            <div className="student-photo">
              {getProfilePictureUrl() ? (
                <img src={getProfilePictureUrl()!} alt="Student" />
              ) : (
                <div className="no-photo">
                  {userProfile?.first_name?.[0] || user?.first_name?.[0] || user?.username?.[0] || 'S'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Name - Large and Centered */}
        <div className="student-name-section">
          <h2>{getDisplayName()}</h2>
        </div>

        {/* Student Information */}
        <div className="student-info-section">
          <div className="info-layout">
            <div className="qr-section">
              <QRCodeSVG 
                value={getMatricNumber()}
                size={80}
              />
            </div>
            
            <div className="details-section">
              <div className="detail-row">
                <span className="label">Reg./Matric No.:</span>
                <span className="value">{getMatricNumber()}</span>
              </div>
              <div className="detail-row">
                <span className="label">School:</span>
                <span className="value">COMPUTING</span>
              </div>
              <div className="detail-row">
                <span className="label">Course of Study:</span>
                <span className="value">{getDepartmentName()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Level/Status:</span>
                <span className="value">{getLevel()} [RETURNING]</span>
              </div>
              <div className="detail-row">
                <span className="label">Semester/Session:</span>
                <span className="value">2ND[2025/2026]</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone/Email:</span>
                <span className="value">{getContactInfo()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Information */}
        <div className="course-info-section">
          <h3>COURSE INFORMATION</h3>
          
          <div className="table-container">
            <div className="approved-watermark">APPROVED</div>
            <table className="course-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="sn-header-left">S/N</th>
                  <th colSpan={2} className="carryover-section-header">CarryOver Courses</th>
                  <th rowSpan={2} className="sn-header-right">S/N</th>
                  <th colSpan={2} className="proposed-section-header">Proposed Courses</th>
                  <th rowSpan={2} className="unit-header">UNIT</th>
                </tr>
                <tr>
                  <th className="course-summary-header">COURSE SUMMARY</th>
                  <th className="course-code-header">COURSE CODE</th>
                  <th className="course-code-header">COURSE CODE</th>
                  <th className="course-title-header">COURSE TITLE</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(8, approvedCourses.length) }).map((_, index) => {
                  const course = approvedCourses[index];
                  return (
                    <tr key={index} className="course-row">
                      <td className="sn-cell-left">{index + 1}</td>
                      <td className="course-summary-cell"></td>
                      <td className="carryover-code-cell"></td>
                      <td className="sn-cell-right">{index + 1}</td>
                      <td className="course-code-cell">
                        {course ? course.code : ''}
                      </td>
                      <td className="course-title-cell">
                        {course ? course.title : ''}
                      </td>
                      <td className="course-unit-cell">
                        {course ? `${course.units}u` : ''}
                      </td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td className="sn-cell-left"></td>
                  <td className="course-summary-cell"></td>
                  <td className="carryover-code-cell total-label">TOTAL UNITS</td>
                  <td className="sn-cell-right"></td>
                  <td className="course-code-cell"></td>
                  <td className="course-title-cell"></td>
                  <td className="course-unit-cell total-units"><strong>{totalUnits}Unit(s)</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Signature */}
        <div className="signature-section">
          <div className="student-signature">
            <span className="signature-label">Student's Signature:</span>
            <div className="signature-container">
              {getStudentSignatureUrl() ? (
                <div className="signature-image-container">
                  <img 
                    src={getStudentSignatureUrl()!} 
                    alt="Student Signature" 
                    className="student-signature-image"
                  />
                </div>
              ) : (
                <div className="signature-line"></div>
              )}
            </div>
            <span className="date-label">Date:</span>
            <div className="date-line">{currentDate}</div>
          </div>
        </div>

        {/* Official Use Section */}
        <div className="official-section">
          <h3>FOR OFFICIAL USE ONLY</h3>
          
          <div className="approval-items">
            <div className="approval-item">
              <span className="approval-label">(i) Approval of Departmental Registration Officer</span>
              <div className="approval-line">
                <div className="name-signature-line">
                  <span className="field-label">Name/Signature:</span>
                  {getSignatureByTitle('Registration Officer') ? (
                    <div className="inline-signature">
                      <span className="officer-name">
                        {getSignatureByTitle('Registration Officer')?.signature_name}
                      </span>
                      <img 
                        src={getSignatureByTitle('Registration Officer')?.signature_url} 
                        alt="Registration Officer Signature"
                        className="inline-signature-image"
                      />
                    </div>
                  ) : (
                    <div className="signature-placeholder"></div>
                  )}
                </div>
                <div className="date-section">
                  <span className="field-label">Date:</span>
                  <span className="date-value">
                    {getSignatureByTitle('Registration Officer') ? 
                      new Date(getSignatureByTitle('Registration Officer')?.signed_at).toLocaleDateString() : 
                      ''
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="approval-item">
              <span className="approval-label">(ii) Approval of Head of Department</span>
              <div className="approval-line">
                <div className="name-signature-line">
                  <span className="field-label">Name/Signature:</span>
                  {getSignatureByTitle('Head of Department') ? (
                    <div className="inline-signature">
                      <span className="officer-name">
                        {getSignatureByTitle('Head of Department')?.signature_name}
                      </span>
                      <img 
                        src={getSignatureByTitle('Head of Department')?.signature_url} 
                        alt="Head of Department Signature"
                        className="inline-signature-image"
                      />
                    </div>
                  ) : (
                    <div className="signature-placeholder"></div>
                  )}
                </div>
                <div className="date-section">
                  <span className="field-label">Date:</span>
                  <span className="date-value">
                    {getSignatureByTitle('Head of Department') ? 
                      new Date(getSignatureByTitle('Head of Department')?.signed_at).toLocaleDateString() : 
                      ''
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="approval-item">
              <span className="approval-label">
                (iii) Endorsement of School Officer [for Dean]
              </span>
              <div className="approval-line">
                <div className="name-signature-line">
                  <span className="field-label">Name/Signature:</span>
                  {getSignatureByTitle('School Officer') ? (
                    <div className="inline-signature">
                      <span className="officer-name">
                        {getSignatureByTitle('School Officer')?.signature_name}
                      </span>
                      <img 
                        src={getSignatureByTitle('School Officer')?.signature_url} 
                        alt="School Officer Signature"
                        className="inline-signature-image"
                      />
                    </div>
                  ) : (
                    <div className="signature-placeholder"></div>
                  )}
                </div>
                <div className="date-section">
                  <span className="field-label">Date:</span>
                  <span className="date-value">
                    {getSignatureByTitle('School Officer') ? 
                      new Date(getSignatureByTitle('School Officer')?.signed_at).toLocaleDateString() : 
                      ''
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="document-footer">
          <div className="footer-content">
            <span>Page 1/1</span>
            <span>STUDENT COURSE REGISTRATION REPORT, FUTA</span>
            <span>{new Date().toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }).toUpperCase()}</span>
            <span>© FUHARS 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCourseForm; 
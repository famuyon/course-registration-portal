import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourses, registerForCourses, Course } from '../../services/courses.service';
import './RegisterCourses.css';

const RegisterCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [comments, setComments] = useState('');
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Load courses
        const coursesData = await getCourses();
        
        console.log('Loaded courses:', coursesData);
        
        // Filter to show only the initial 8 standard courses
        const standardCourseCodes = [
          'CSC508', 'CSC514',
          'SEN502', 'SEN504', 'SEN506',
          'SEN508', 'SEN510', 'SEN512'
        ];
        
        const availableCourses = coursesData.filter((course: Course) => {
          return course.is_active && standardCourseCodes.includes(course.code);
        });
        
        setCourses(availableCourses);
        
        console.log('Available courses:', availableCourses);
        
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.detail || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  // Update Select All checkbox state when individual courses are selected/deselected
  useEffect(() => {
    if (courses.length > 0) {
      const allSelected = courses.every(course => selectedCourses.includes(course.id));
      setSelectAllChecked(allSelected);
    }
  }, [selectedCourses, courses]);

  const handleCourseSelect = (courseId: number, units: number) => {
    setSelectedCourses(prev => {
      const isSelected = prev.includes(courseId);
      let newSelected;
      let newTotalUnits;

      if (isSelected) {
        newSelected = prev.filter(id => id !== courseId);
        newTotalUnits = totalUnits - units;
      } else {
        if (totalUnits + units > 24) {
          setError('Maximum units (24) exceeded');
          return prev;
        }
        newSelected = [...prev, courseId];
        newTotalUnits = totalUnits + units;
      }

      setTotalUnits(newTotalUnits);
      setError('');
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAllChecked) {
      // Deselect all courses
      setSelectedCourses([]);
      setTotalUnits(0);
      setSelectAllChecked(false);
      setError('');
    } else {
      // Select courses up to 24 units limit
      let newSelected: number[] = [];
      let newTotalUnits = 0;
      let coursesAdded = 0;
      let coursesSkipped = 0;
      
      // Sort courses by units (ascending) to fit more courses within the limit
      const sortedCourses = [...courses].sort((a, b) => a.units - b.units);
      
      for (const course of sortedCourses) {
        if (newTotalUnits + course.units <= 24) {
          newSelected.push(course.id);
          newTotalUnits += course.units;
          coursesAdded++;
        } else {
          coursesSkipped++;
        }
      }
      
      setSelectedCourses(newSelected);
      setTotalUnits(newTotalUnits);
      setSelectAllChecked(newSelected.length === courses.length);
      
      if (coursesSkipped > 0) {
        setError(`${coursesAdded} courses selected (${coursesSkipped} courses skipped due to 24-unit limit)`);
      } else {
        setError('');
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }

    if (totalUnits < 15) {
      setError('Minimum units (15) not met');
      return;
    }

    try {
      setLoading(true);
      const response = await registerForCourses(selectedCourses, comments);
      setSuccess(`${response.detail} Your registration is now pending approval.`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register courses');
    } finally {
      setLoading(false);
    }
  };

  console.log('All available courses:', courses);
  console.log('Total courses loaded:', courses.length);

  if (loading) {
    return (
      <div className="register-courses-container">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="register-courses-container">
      {/* Header Section */}
      <div className="header-section">
        <h1 className="main-title">COURSE REGISTRATION</h1>
      </div>

      {/* Main Content Layout */}
      <div className="main-content">
        {/* Course Content Area */}
        <div className="course-content-area">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Course Display Section */}
          <div className="course-display-section">
            {/* Tab Header */}
            <div className="tab-header">
              <button 
                className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
                onClick={() => setActiveTab('available')}
              >
                Available Courses
              </button>
            </div>

            {/* Select All Section */}
            {courses.length > 0 && (
              <div className="select-all-section">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={handleSelectAll}
                    className="select-all-checkbox"
                  />
                  <span className="select-all-text">
                    Select All Courses
                    <span className="select-all-hint">
                      (Smart selection respects 24-unit limit)
                    </span>
                  </span>
                </label>
              </div>
            )}

            {/* Course Table */}
            <div className="course-table-container">
              {courses.length === 0 ? (
                <div className="no-courses-message">
                  <p>No courses available at this time.</p>
                  <p>Please contact the academic office if you need assistance.</p>
                </div>
              ) : (
                <table className="new-courses-table">
                  <colgroup>
                    <col style={{ width: '50px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: 'auto' }} />
                    <col style={{ width: '80px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectAllChecked}
                          onChange={handleSelectAll}
                          title="Select/Deselect All Courses"
                        />
                      </th>
                      <th>COURSE CODE</th>
                      <th>C</th>
                      <th>COURSE TITLE</th>
                      <th>UNIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseSelect(course.id, course.units)}
                          />
                        </td>
                        <td className="course-code">{course.code}</td>
                        <td className="course-type">C</td>
                        <td className="course-title">{course.title}</td>
                        <td className="course-units">{course.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Outstanding Section - For Carryover Courses Only */}
              <div className="outstanding-section">
                <div className="outstanding-header">OUTSTANDING</div>
                <div className="outstanding-message">
                  <p>This section is reserved for carryover courses only.</p>
                  <p>If you have any carryover courses, please contact the academic office for manual addition.</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <div className="comments-header">
                  <h3>💬 Additional Comments (Optional)</h3>
                  <p className="comments-subtitle">Add any special notes or requests for the registration officer</p>
                </div>
                <textarea
                  className="comments-textarea"
                  placeholder="Enter any additional comments, special requests, or information for the registration officer..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
                <div className="character-count">
                  {comments.length}/500 characters
                </div>
              </div>

              {/* Total and Submit */}
              <div className="form-footer">
                <div className="total-units">Total: {totalUnits}</div>
                <div className="legend">
                  <span>C = Compulsory</span>
                  <span>E = Elective</span>
                </div>
                <button 
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={selectedCourses.length === 0 || loading}
                >
                  {loading ? 'SUBMITTING...' : 'SUBMIT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCourses; 
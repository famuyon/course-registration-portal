import React, { useState, useEffect } from 'react';
import { Course, PendingRegistration, getCourses, editRegistrationCourses } from '../../services/courses.service';
import axiosInstance from '../../services/axios.config';
import './EditCoursesModal.css';

interface EditCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: PendingRegistration;
  onSave: (updatedRegistration: PendingRegistration) => void;
}

// Function to parse course codes from student comments
const parseCourseCodesFromComments = (comments: string): string[] => {
  if (!comments) return [];
  // Match codes like CSC101, csc 101, CSC-101, CSC_101, etc., case-insensitive, with optional space/dash/underscore
  const courseCodePattern = /\b([A-Z]{2,4})[\s\-_]*([0-9]{3,4})\b/gi;
  const matches = Array.from(comments.matchAll(courseCodePattern));
  if (!matches) return [];
  // Join groups, uppercase, and strip trailing punctuation/parentheses
  return matches.map(m => (m[1] + m[2]).toUpperCase().replace(/[).,;:!?\s]+$/, ''));
};

// Function to extract keywords that might indicate course requests
const extractCourseKeywords = (comments: string): string[] => {
  if (!comments) return [];
  
  const keywords = [
    'carry over', 'carryover', 'retake', 'repeat', 'failed', 'outstanding',
    'missed', 'add', 'include', 'register', 'additional', 'extra'
  ];
  
  const foundKeywords = keywords.filter(keyword => 
    comments.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return foundKeywords;
};

const EditCoursesModal: React.FC<EditCoursesModalProps> = ({
  isOpen,
  onClose,
  registration,
  onSave
}) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterSemester, setFilterSemester] = useState<string>('');
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [manualSuggestions, setManualSuggestions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCourseCode, setCreateCourseCode] = useState('');
  const [createCourseTitle, setCreateCourseTitle] = useState('');
  const [createCourseUnits, setCreateCourseUnits] = useState(2);
  const [createCourseLevel, setCreateCourseLevel] = useState(registration.level || 100);
  const [createCourseSemester, setCreateCourseSemester] = useState(registration.semester || '1');
  const [createCourseLoading, setCreateCourseLoading] = useState(false);
  const [createCourseError, setCreateCourseError] = useState('');
  const [createCourseSuccess, setCreateCourseSuccess] = useState('');
  const [allDetectedCodes, setAllDetectedCodes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCourses();
      // Initialize selected courses from registration
      const currentCourseIds = registration.courses?.map(c => c.course?.id).filter(Boolean) || [];
      setSelectedCourses(currentCourseIds);
    }
  }, [isOpen, registration]);

  useEffect(() => {
    if (allCourses.length > 0 && registration.comments !== undefined) {
      findSuggestedCourses();
    }
  }, [allCourses, registration.comments]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const courses = await getCourses();
      setAllCourses(courses);
    } catch (err: any) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const findSuggestedCourses = () => {
    if (!registration.comments) {
      setSuggestedCourses([]);
      setManualSuggestions([]);
      setAllDetectedCodes([]);
      return;
    }

    const courseCodes = parseCourseCodesFromComments(registration.comments);
    setAllDetectedCodes(courseCodes);
    const keywords = extractCourseKeywords(registration.comments);
    
    const suggestions: Course[] = [];
    const manual: string[] = [];
    
    // Find courses by exact code match
    courseCodes.forEach(code => {
      const course = allCourses.find(c => c.code.toUpperCase() === code.toUpperCase());
      if (course && !suggestions.some(s => s.id === course.id)) {
        suggestions.push(course);
      } else if (!course && !manual.includes(code)) {
        manual.push(code);
      }
    });

    // If we have carryover/retake keywords, suggest courses from lower levels
    if (keywords.some(k => ['carry over', 'carryover', 'retake', 'repeat', 'failed'].includes(k.toLowerCase()))) {
      const carryoverCourses = allCourses.filter(course => 
        course.level < registration.level && 
        course.department.id === registration.department?.id &&
        !suggestions.some(s => s.id === course.id) &&
        !registration.courses?.some(regCourse => regCourse.course?.id === course.id)
      ).slice(0, 3); // Limit to 3 suggestions
      
      suggestions.push(...carryoverCourses);
    }

    setSuggestedCourses(suggestions);
    setManualSuggestions(manual);
  };

  const addSuggestedCourse = (courseId: number) => {
    if (!selectedCourses.includes(courseId)) {
      setSelectedCourses(prev => [...prev, courseId]);
    }
  };

  const addAllSuggestedCourses = () => {
    const suggestedIds = suggestedCourses.map(c => c.id);
    const newCourses = suggestedIds.filter(id => !selectedCourses.includes(id));
    
    const newTotal = [...selectedCourses, ...newCourses].reduce((total, courseId) => {
      const course = allCourses.find(c => c.id === courseId);
      return total + (course?.units || 0);
    }, 0);
    
    if (newTotal <= 24) {
      setSelectedCourses(prev => [...prev, ...newCourses]);
    } else {
      setError('Cannot add all suggested courses - would exceed 24 unit limit');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || course.level.toString() === filterLevel;
    const matchesSemester = !filterSemester || course.semester.toString() === filterSemester;
    
    return matchesSearch && matchesLevel && matchesSemester;
  });

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const getTotalUnits = () => {
    return selectedCourses.reduce((total, courseId) => {
      const course = allCourses.find(c => c.id === courseId);
      return total + (course?.units || 0);
    }, 0);
  };

  const getRegisteredCourseIds = () => {
    return registration.courses?.map(c => c.course?.id).filter(Boolean) || [];
  };

  const getAvailableCourseIds = () => {
    const registeredIds = getRegisteredCourseIds();
    return filteredCourses
      .filter(course => !registeredIds.includes(course.id))
      .map(course => course.id);
  };

  const removeAllCourses = () => {
    const registeredIds = getRegisteredCourseIds();
    setSelectedCourses(prev => prev.filter(id => !registeredIds.includes(id)));
  };

  const addAllVisibleAvailable = () => {
    const availableIds = getAvailableCourseIds();
    const newTotal = [...selectedCourses, ...availableIds].reduce((total, courseId) => {
      const course = allCourses.find(c => c.id === courseId);
      return total + (course?.units || 0);
    }, 0);
    
    if (newTotal <= 24) {
      setSelectedCourses(prev => [...prev, ...availableIds.filter(id => !prev.includes(id))]);
    } else {
      setError('Cannot add all courses - would exceed 24 unit limit');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Save the updated courses
      const updatedRegistration = await editRegistrationCourses(registration.id, selectedCourses);
      
      // Reload all courses to get fresh data
      await loadCourses();
      
      // Call the onSave callback with the updated registration
      onSave(updatedRegistration);
      
      // Close the modal
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save changes');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Create course handler
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateCourseLoading(true);
    setCreateCourseError('');
    setCreateCourseSuccess('');
    try {
      const response = await axiosInstance.post('/courses/courses/', {
        code: createCourseCode,
        title: createCourseTitle,
        units: parseInt(createCourseUnits.toString()),
        level: parseInt(createCourseLevel.toString()),
        semester: parseInt(createCourseSemester),
        department_id: registration.department?.id,
        description: `${createCourseTitle} course for ${createCourseCode}`,
        is_active: true,
        capacity: 50,
        prerequisites: [],
        enrolled_students: 0,
        is_registered: false
      });

      // Add the new course to allCourses
      const newCourse = response.data;
      setAllCourses(prev => [...prev, newCourse]);
      
      // Add the new course to selectedCourses
      setSelectedCourses(prev => [...prev, newCourse.id]);

      // Update the registration's courses
      const updatedCourses = [...(registration.courses || []), newCourse];
      onSave({
        ...registration,
        courses: updatedCourses
      });

      setCreateCourseSuccess('Course created successfully!');
      setShowCreateModal(false);

      // Refresh the course list
      loadCourses();

      // Clear the form
      setCreateCourseTitle('');
      setCreateCourseUnits(2);
      setCreateCourseError('');

    } catch (err: any) {
      console.error('Error creating course:', err.response?.data);
      const errorDetail = err.response?.data?.detail || err.response?.data;
      const errorMessage = typeof errorDetail === 'object' 
        ? Object.entries(errorDetail).map(([key, value]) => `${key}: ${value}`).join(', ')
        : errorDetail;
      setCreateCourseError(errorMessage || 'Failed to create course. Please check all fields and try again.');
    } finally {
      setCreateCourseLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-courses-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Courses for {registration.student.first_name} {registration.student.last_name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          <div className="student-info-summary">
            <p><strong>Student:</strong> {registration.student.first_name} {registration.student.last_name}</p>
            <p><strong>Matric No:</strong> {registration.student.matric_number}</p>
            <p><strong>Level:</strong> {registration.level} | <strong>Semester:</strong> {registration.semester}</p>
            <p><strong>Current Total Units:</strong> {getTotalUnits()}</p>
          </div>

          <div className="filters-section">
            <div className="search-filters">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="filter-select"
              >
                <option value="">All Levels</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="filter-select"
              >
                <option value="">All Semesters</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          <div className="courses-section">
            {/* Currently Registered Courses */}
            <div className="registered-courses-section">
              <div className="section-header">
                <div>
                  <h3>📚 Currently Registered Courses</h3>
                  <p className="section-subtitle">Uncheck courses to remove them from the student's registration</p>
                </div>
                <button 
                  className="quick-action-btn remove-all-btn"
                  onClick={removeAllCourses}
                  type="button"
                >
                  🗑️ Remove All
                </button>
              </div>
              <div className="courses-list registered-courses">
                {(() => {
                  const registeredCourses = filteredCourses.filter(course => 
                    registration.courses?.some(regCourse => regCourse.course?.id === course.id)
                  );
                  
                  if (registeredCourses.length === 0) {
                    return (
                      <div className="no-courses-message">
                        <p>No courses currently registered for this student.</p>
                      </div>
                    );
                  }
                  
                  return registeredCourses.map(course => (
                    <div 
                      key={course.id} 
                      className={`course-item registered-course ${selectedCourses.includes(course.id) ? 'selected' : 'being-removed'}`}
                      onClick={() => toggleCourseSelection(course.id)}
                    >
                      <div className="course-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                        />
                      </div>
                      <div className="course-details">
                        <div className="course-code-title">
                          <strong>{course.code}</strong> - {course.title}
                          {!selectedCourses.includes(course.id) && (
                            <span className="removal-indicator">🗑️ Will be removed</span>
                          )}
                        </div>
                        <div className="course-meta">
                          Level {course.level} | Semester {course.semester} | {course.units} units | {course.department.code}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Available Additional Courses */}
            <div className="additional-courses-section">
              <div className="section-header">
                <div>
                  <h3>➕ Add Additional Courses (including Carryover)</h3>
                  <p className="section-subtitle">Check courses to add them to the student's registration</p>
                </div>
                <button 
                  className="quick-action-btn add-all-btn"
                  onClick={addAllVisibleAvailable}
                  type="button"
                >
                  ✅ Add All Visible
                </button>
              </div>

              {/* Student Comment-Based Suggestions */}
              {registration.comments && allDetectedCodes.length > 0 && showSuggestions && (
                <div className="suggested-courses-section">
                  <div className="suggestion-header">
                    <div>
                      <h4>💡 Suggested Courses from Student Comments</h4>
                      <p className="suggestion-subtitle">
                        Based on: <em>"{registration.comments.length > 100 ? registration.comments.substring(0, 100) + '...' : registration.comments}"</em>
                      </p>
                    </div>
                    <div className="suggestion-actions">
                      <button 
                        className="add-all-suggestions-btn"
                        onClick={addAllSuggestedCourses}
                        type="button"
                      >
                        ✅ Add All Suggestions
                      </button>
                      <button 
                        className="hide-suggestions-btn"
                        onClick={() => setShowSuggestions(false)}
                        type="button"
                      >
                        ❌ Hide
                      </button>
                    </div>
                  </div>
                  
                  <div className="courses-list suggested-courses">
                    {allDetectedCodes.map(code => {
                      const course = allCourses.find(c => c.code.toUpperCase() === code.toUpperCase());
                      if (course) {
                        return (
                          <div key={code} className="course-item suggested-course">
                            <div className="course-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedCourses.includes(course.id)}
                                onChange={() => toggleCourseSelection(course.id)}
                              />
                            </div>
                            <div className="course-details">
                              <div className="course-code-title">
                                <strong>{course.code}</strong> - {course.title}
                                <span className="suggestion-badge">💡 Suggested</span>
                                {selectedCourses.includes(course.id) && (
                                  <span className="addition-indicator">✅ Will be added</span>
                                )}
                                {course.level !== registration.level && (
                                  <span className="carryover-badge">📚 Carryover</span>
                                )}
                              </div>
                              <div className="course-meta">
                                Level {course.level} | Semester {course.semester} | {course.units} units | {course.department.code}
                              </div>
                            </div>
                            <button 
                              className="quick-add-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                addSuggestedCourse(course.id);
                              }}
                              type="button"
                            >
                              ➕ Add
                            </button>
                          </div>
                        );
                      } else {
                        return (
                          <div key={code} className="course-item suggested-course manual-suggestion">
                            <div className="course-details">
                              <div className="course-code-title">
                                <strong>{code}</strong>
                                <span className="manual-badge">⚠️ Not in course list</span>
                              </div>
                              <div className="course-meta">
                                <span className="manual-meta">This course code was detected in the comment but is not in the course list. Add manually if needed.</span>
                              </div>
                            </div>
                            <button className="quick-add-btn" onClick={() => { setCreateCourseCode(code); setShowCreateModal(true); }}>➕ Create Course</button>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}

              {/* Show message if suggestions were hidden */}
              {registration.comments && suggestedCourses.length > 0 && !showSuggestions && (
                <div className="hidden-suggestions-notice">
                  <p>
                    💡 {suggestedCourses.length} course(s) suggested from student comments. 
                    <button 
                      className="show-suggestions-btn"
                      onClick={() => setShowSuggestions(true)}
                      type="button"
                    >
                      Show Suggestions
                    </button>
                  </p>
                </div>
              )}

              {/* Show original comment if suggestions couldn't be parsed */}
              {registration.comments && suggestedCourses.length === 0 && (
                <div className="no-suggestions-notice">
                  <div className="student-comment-display">
                    <h4>💬 Student Comment:</h4>
                    <p className="comment-text">"{registration.comments}"</p>
                    <p className="comment-note">
                      <strong>Note:</strong> No specific courses could be automatically identified from this comment. 
                      Please review manually and add appropriate courses below.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="courses-list additional-courses">
                {filteredCourses.filter(course => 
                  !registration.courses?.some(regCourse => regCourse.course?.id === course.id)
                ).map(course => (
                  <div 
                    key={course.id} 
                    className={`course-item additional-course ${selectedCourses.includes(course.id) ? 'selected being-added' : ''}`}
                    onClick={() => toggleCourseSelection(course.id)}
                  >
                    <div className="course-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => toggleCourseSelection(course.id)}
                      />
                    </div>
                    <div className="course-details">
                      <div className="course-code-title">
                        <strong>{course.code}</strong> - {course.title}
                        {selectedCourses.includes(course.id) && (
                          <span className="addition-indicator">✅ Will be added</span>
                        )}
                        {course.level !== registration.level && (
                          <span className="carryover-badge">📚 Carryover</span>
                        )}
                      </div>
                      <div className="course-meta">
                        Level {course.level} | Semester {course.semester} | {course.units} units | {course.department.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {loading && <div className="loading">Loading courses...</div>}
          </div>
        </div>

        <div className="modal-footer">
          <div className="changes-summary">
            <div className="unit-summary">
              <strong>Total Units: {getTotalUnits()}</strong>
              {getTotalUnits() > 24 && (
                <span className="unit-warning"> (Exceeds 24 unit limit)</span>
              )}
            </div>
            <div className="changes-details">
              {(() => {
                const registeredIds = getRegisteredCourseIds();
                const coursesToRemove = registeredIds.filter(id => !selectedCourses.includes(id));
                const coursesToAdd = selectedCourses.filter(id => !registeredIds.includes(id));
                
                return (
                  <>
                    {coursesToRemove.length > 0 && (
                      <div className="change-summary remove-summary">
                        <span className="change-count">🗑️ {coursesToRemove.length} course(s) will be removed</span>
                      </div>
                    )}
                    {coursesToAdd.length > 0 && (
                      <div className="change-summary add-summary">
                        <span className="change-count">✅ {coursesToAdd.length} course(s) will be added</span>
                      </div>
                    )}
                    {coursesToRemove.length === 0 && coursesToAdd.length === 0 && (
                      <div className="change-summary no-changes">
                        <span className="change-count">ℹ️ No changes to be made</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <div className="modal-buttons">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="save-button" 
              onClick={handleSave}
              disabled={saving || getTotalUnits() > 24}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-course-modal" onClick={e => e.stopPropagation()}>
            <h3>Create New Course</h3>
            <form onSubmit={handleCreateCourse}>
              <label>Course Code</label>
              <input type="text" value={createCourseCode} readOnly />
              <label>Title</label>
              <input type="text" value={createCourseTitle} onChange={e => setCreateCourseTitle(e.target.value)} required />
              <label>Units</label>
              <input type="number" value={createCourseUnits} min={1} max={6} onChange={e => setCreateCourseUnits(Number(e.target.value))} required />
              <label>Level</label>
              <input type="number" value={createCourseLevel} min={100} max={800} step={100} onChange={e => setCreateCourseLevel(Number(e.target.value))} required />
              <label>Semester</label>
              <select value={createCourseSemester} onChange={e => setCreateCourseSemester(e.target.value)} required>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
              {createCourseError && <div className="error-message">{createCourseError}</div>}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" disabled={createCourseLoading}>{createCourseLoading ? 'Creating...' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCoursesModal; 
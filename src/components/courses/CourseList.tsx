import React, { useState, useEffect } from 'react';
import { Course } from '../../types/api';
import axiosInstance from '../../services/axios.config';
import './CourseList.css';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [registering, setRegistering] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get<Course[]>('/courses/courses/');
      setCourses(response.data);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      setError(error.response?.data?.detail || 'Failed to load courses. Please try again later.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (courseId: number) => {
    try {
      setRegistering(courseId);
      setError('');
      await axiosInstance.post(`/courses/courses/${courseId}/register/`);
      
      // Update the course in the list to show it's registered
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, is_registered: true, enrolled_students: course.enrolled_students + 1 }
            : course
        )
      );
    } catch (error: any) {
      console.error('Error registering for course:', error);
      setError(error.response?.data?.detail || 'Failed to register for course. Please try again.');
    } finally {
      setRegistering(null);
    }
  };

  const getCourseLetter = (courseCode: string) => {
    return courseCode.substring(0, 3).toUpperCase();
  };

  const getSemesterText = (semester: number) => {
    return semester === 1 ? 'First' : 'Second';
  };

  const getLevelText = (level: number) => {
    return `${level} Level`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={loadCourses}>Try Again</button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="no-courses">
        <h2>No Courses Available</h2>
        <p>There are currently no courses available for registration.</p>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-image">
              {getCourseLetter(course.code)}
            </div>
            
            <div className="course-content">
              <div className="course-header">
                <h3>{course.title}</h3>
                <span className="course-code">{course.code}</span>
              </div>
              
              <p className="course-description">{course.description}</p>
              
              <div className="course-details">
                <div className="course-detail-item">
                  <span className="label">Level</span>
                  <span className="value">{getLevelText(course.level)}</span>
                </div>
                <div className="course-detail-item">
                  <span className="label">Semester</span>
                  <span className="value">{getSemesterText(course.semester)}</span>
                </div>
                <div className="course-detail-item">
                  <span className="label">Units</span>
                  <span className="value">{course.units}</span>
                </div>
              </div>
              
              <div className="course-meta">
                <div className="course-stats">
                  <div className="course-stat">
                    {course.enrolled_students}/{course.capacity}
                  </div>
                  <div className="course-stat">
                    {course.department.name}
                  </div>
                </div>
                
                <div className="course-actions">
                  <button
                    onClick={() => handleRegister(course.id)}
                    disabled={course.is_registered || registering === course.id || course.enrolled_students >= course.capacity}
                    className="register-button"
                  >
                    {course.is_registered 
                      ? 'Registered' 
                      : registering === course.id 
                        ? 'Registering...' 
                        : course.enrolled_students >= course.capacity
                          ? 'Full'
                          : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList; 
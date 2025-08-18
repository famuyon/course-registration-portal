import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getDepartments,
  Course,
  Department 
} from '../../services/courses.service';
import './CourseManagement.css';

interface CourseFormData {
  code: string;
  title: string;
  description: string;
  units: number;
  level: number;
  semester: number;
  department_id: number;
  is_active: boolean;
}

const CourseManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | ''>('');
  const [filterSemester, setFilterSemester] = useState<number | ''>('');
  const [filterDepartment, setFilterDepartment] = useState<number | ''>('');

  const [formData, setFormData] = useState<CourseFormData>({
    code: '',
    title: '',
    description: '',
    units: 3,
    level: 100,
    semester: 1,
    department_id: 0,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, departmentsData] = await Promise.all([
        getCourses(),
        getDepartments()
      ]);
      setCourses(coursesData);
      setDepartments(departmentsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.title || !formData.department_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        setSuccess('Course updated successfully');
      } else {
        await createCourse(formData);
        setSuccess('Course created successfully');
      }
      
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save course');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description,
      units: course.units,
      level: course.level,
      semester: course.semester,
      department_id: course.department.id,
      is_active: course.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCourse(courseId);
      setSuccess('Course deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete course');
      setTimeout(() => setError(''), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      units: 3,
      level: 100,
      semester: 1,
      department_id: 0,
      is_active: true
    });
    setEditingCourse(null);
    setShowAddForm(false);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === '' || course.level === filterLevel;
    const matchesSemester = filterSemester === '' || course.semester === filterSemester;
    const matchesDepartment = filterDepartment === '' || course.department.id === filterDepartment;
    
    return matchesSearch && matchesLevel && matchesSemester && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="course-management-container">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="course-management-container">
      <div className="course-management-header">
        <h2>Course Management</h2>
        <p>Add, edit, or remove courses from the system</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="course-management-controls">
        <button 
          className="add-course-btn"
          onClick={() => setShowAddForm(true)}
        >
          <span className="btn-icon">➕</span>
          Add New Course
        </button>

        <div className="filters-container">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value === '' ? '' : Number(e.target.value))}
            className="filter-select"
          >
            <option value="">All Levels</option>
            <option value={100}>100 Level</option>
            <option value={200}>200 Level</option>
            <option value={300}>300 Level</option>
            <option value={400}>400 Level</option>
            <option value={500}>500 Level</option>
          </select>

          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value === '' ? '' : Number(e.target.value))}
            className="filter-select"
          >
            <option value="">All Semesters</option>
            <option value={1}>First Semester</option>
            <option value={2}>Second Semester</option>
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value === '' ? '' : Number(e.target.value))}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {showAddForm && (
        <div className="course-form-overlay">
          <div className="course-form-container">
            <div className="course-form-header">
              <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., CSC101"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Units *</label>
                  <input
                    type="number"
                    name="units"
                    value={formData.units}
                    onChange={handleInputChange}
                    min="1"
                    max="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={100}>100 Level</option>
                    <option value={200}>200 Level</option>
                    <option value={300}>300 Level</option>
                    <option value={400}>400 Level</option>
                    <option value={500}>500 Level</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={1}>First Semester</option>
                    <option value={2}>Second Semester</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Active (Course available for registration)
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="courses-table-container">
        <div className="courses-summary">
          <h3>Courses ({filteredCourses.length})</h3>
          <div className="summary-stats">
            <span>Active: {filteredCourses.filter(c => c.is_active).length}</span>
            <span>Inactive: {filteredCourses.filter(c => !c.is_active).length}</span>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>No courses found matching your criteria.</p>
          </div>
        ) : (
          <div className="courses-table">
            <div className="table-header">
              <div className="header-cell">Code</div>
              <div className="header-cell">Title</div>
              <div className="header-cell">Department</div>
              <div className="header-cell">Level</div>
              <div className="header-cell">Semester</div>
              <div className="header-cell">Units</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>

            {filteredCourses.map(course => (
              <div key={course.id} className="table-row">
                <div className="table-cell">
                  <span className="course-code">{course.code}</span>
                </div>
                <div className="table-cell">
                  <span className="course-title">{course.title}</span>
                  {course.description && (
                    <span className="course-description">{course.description}</span>
                  )}
                </div>
                <div className="table-cell">
                  <span className="department-name">{course.department.name}</span>
                </div>
                <div className="table-cell">
                  <span className="level-badge">{course.level}</span>
                </div>
                <div className="table-cell">
                  <span className="semester-badge">{course.semester === 1 ? 'First' : 'Second'}</span>
                </div>
                <div className="table-cell">
                  <span className="units-badge">{course.units}</span>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${course.is_active ? 'active' : 'inactive'}`}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(course)}
                      title="Edit Course"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(course.id)}
                      title="Delete Course"
                    >
                      🗑️
                    </button>
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

export default CourseManagement; 
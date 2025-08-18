import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/axios.config';
import { getDepartments, Department } from '../../services/courses.service';
import './Profile.css';

const Profile = () => {
  const { user, setUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');


  // Form data state
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    matric_number: user?.matric_number || '',
    department: '',
    level: '',
    user_type: ''
  });

  // Load departments on component mount
  useEffect(() => {
    console.log('Loading departments...');
    loadDepartments();
  }, []);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      console.log('User data updated:', user);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        matric_number: user.matric_number || '',
        department: user.department?.toString() || '',
        level: user.level?.toString() || '',
        user_type: user.user_type || ''
      });
      
      // Set profile picture preview if exists
      if (user.profile_picture) {
        const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';
        const profilePicUrl = user.profile_picture.startsWith('http') 
          ? user.profile_picture 
          : `${baseUrl}${user.profile_picture}`;
        setProfilePicturePreview(profilePicUrl);
      }

    }
  }, [user]);

  const loadDepartments = async () => {
    try {
      const departmentsList = await getDepartments();
      console.log('Departments loaded:', departmentsList);
      setDepartments(departmentsList);
    } catch (error) {
      console.error('Error loading departments:', error);
      setError('Failed to load departments');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }

      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicturePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };



  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== EDIT BUTTON CLICKED ===');
    console.log('Current isEditing:', isEditing);
    console.log('Event target:', e.target);
    
    // Clear any existing messages
    setError('');
    setSuccess('');
    
    // Reset profile picture states
    setProfilePictureFile(null);
    setProfilePicturePreview('');
    
    // Force state update
    setIsEditing(true);
    console.log('Edit mode should now be active');
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('first_name', formData.first_name.trim());
      formDataToSend.append('last_name', formData.last_name.trim());
      
      // Only update email if it's changed
      if (formData.email.trim() !== user?.email) {
        formDataToSend.append('email', formData.email.trim());
      }
      
      formDataToSend.append('phone_number', formData.phone_number.trim());
      formDataToSend.append('matric_number', formData.matric_number.trim());
      
      if (formData.level) {
        formDataToSend.append('level', formData.level);
      }
      
      if (formData.department) {
        formDataToSend.append('department', formData.department);
      }
      
      // Add profile picture if selected
      if (profilePictureFile) {
        formDataToSend.append('profile_picture', profilePictureFile);
      }

      console.log('Sending update data with profile picture');
      const response = await axios.patch('/me/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        console.log('Profile updated successfully:', response.data);
        updateUser(response.data);
        setSuccess('Profile updated successfully! ✨');
        setIsEditing(false);
        setProfilePictureFile(null);
        setProfilePicturePreview('');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.response?.data) {
        // Handle specific API error messages
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          setError(`Failed to update profile: ${errorMessages}`);
        } else {
          setError(`Failed to update profile: ${errorData}`);
        }
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked, setting isEditing to false');
    setIsEditing(false);
    setProfilePictureFile(null);
    setProfilePicturePreview('');
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        matric_number: user.matric_number || '',
        department: user.department?.toString() || '',
        level: user.level?.toString() || '',
        user_type: user.user_type || ''
      });
    }
    setError('');
    setSuccess('');
  };

  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case 'student': return 'Student';
      case 'registration_officer': return 'Registration Officer';
      case 'hod': return 'Head of Department';
      case 'school_officer': return 'School Officer';
      default: return userType;
    }
  };

  const getProfilePictureUrl = () => {
    if (!user?.profile_picture) return undefined;
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';
    return user.profile_picture.startsWith('http') 
      ? user.profile_picture 
      : `${baseUrl}${user.profile_picture}`;
  };



  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  console.log('Rendering Profile component. isEditing:', isEditing);

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-picture-container" onClick={handleProfilePictureClick}>
          {profilePicturePreview || user?.profile_picture ? (
            <img
              src={profilePicturePreview || getProfilePictureUrl()}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">
              <i className="fas fa-user"></i>
            </div>
          )}
          {isEditing && (
            <div className="profile-picture-overlay">
              <i className="fas fa-camera"></i>
              <span>Change Photo</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <div className="form-group">
          <label>Account Type</label>
          <input
            type="text"
            value={getUserTypeDisplay(user?.user_type || '')}
            disabled
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="form-control"
            required
          />
          <small className="form-text text-muted">Make sure to use a valid email address</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-control"
              required
            />
          </div>

          {user?.user_type === 'student' && (
            <div className="form-group">
              <label>Matric Number</label>
              <input
                type="text"
                name="matric_number"
                value={formData.matric_number}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-control"
                required
              />
            </div>
          )}
        </div>

        {user?.user_type === 'student' && (
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-control"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-control"
                required
              >
                <option value="">Select Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
            </div>
          </div>
        )}

        <div className="button-group">
          {!isEditing ? (
            <button type="button" onClick={handleEditClick} className="edit-button">
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          ) : (
            <>
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Changes
                  </>
                )}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                <i className="fas fa-times"></i> Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;
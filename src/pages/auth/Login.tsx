import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userType } = useParams<{ userType: string }>();

  // Determine login type and display info
  const isAdminLogin = userType === 'registration-officer' || userType === 'head-of-department' || userType === 'school-officer';
  const isStudentLogin = userType === 'student';
  const isRegistrationOfficer = userType === 'registration-officer';
  const isHeadOfDepartment = userType === 'head-of-department';
  const isSchoolOfficer = userType === 'school-officer';

  const getLoginInfo = () => {
    if (isRegistrationOfficer) {
      return {
        title: 'Registration Officer Portal',
        subtitle: 'Registration Officer Access',
        placeholder: {
          username: 'Enter admin username',
          password: 'Enter admin password'
        },
        credentials: 'Use: admin / admin123'
      };
    } else if (isHeadOfDepartment) {
      return {
        title: 'Head of Department Portal',
        subtitle: 'Head of Department Access',
        placeholder: {
          username: 'Enter HOD username',
          password: 'Enter HOD password'
        },
        credentials: 'Use: HOD / HOD123'
      };
    } else if (isSchoolOfficer) {
      return {
        title: 'School Officer Portal',
        subtitle: 'School Officer Access',
        placeholder: {
          username: 'Enter school officer username',
          password: 'Enter school officer password'
        },
        credentials: 'Use: schoolofficer / schoolofficer123'
      };
    } else {
      return {
        title: 'Student Portal',
        subtitle: 'Please sign in to access your courses',
        placeholder: {
          username: 'Enter your username',
          password: 'Enter your password'
        },
        credentials: 'Use: student1 / password123 or student2 / password123'
      };
    }
  };

  const loginInfo = getLoginInfo();

  // Removed automatic redirect - users should always be able to login with fresh credentials

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    console.log('Login attempt:', { username: trimmedUsername, password: trimmedPassword ? '***' : 'empty' });

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending login request...');
      await login(trimmedUsername, trimmedPassword);
      console.log('Login successful');
      
      // Navigate after successful login
      const from = location.state?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (isSchoolOfficer) {
        // School officers go directly to append signature page
        navigate('/append-signature', { replace: true });
      } else if (isAdminLogin) {
        // Registration officers and HODs go to admin registrations
        navigate('/admin/registrations', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 401) {
        if (isAdminLogin) {
          setError('Invalid admin credentials. Please check your username and password.');
        } else {
          setError('Invalid username or password');
        }
      } else if (err.response?.status === 400) {
        setError('Invalid request. Please check your input and try again.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRoleSelection = () => {
    navigate('/', { replace: true });
  };



  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <button 
            className="back-button"
            onClick={handleBackToRoleSelection}
            type="button"
          >
            ← Back to Role Selection
          </button>
          <h1>{loginInfo.title}</h1>
          <p className="login-subtitle">{loginInfo.subtitle}</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder={loginInfo.placeholder.username}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(''); // Clear error when user types
              }}
              required
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder={loginInfo.placeholder.password}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Clear error when user types
              }}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 
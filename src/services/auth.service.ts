import axiosInstance from './axios.config';
import type { User, AuthResponse } from '../types/api';

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Auth service: Making login request with:', { username, password: password ? '***' : 'empty' });
    const response = await axiosInstance.post<AuthResponse>('/token/', { username, password });
    console.log('Auth service: Login response received:', response.data);
    const { access, refresh, user } = response.data;
    
    // Store tokens
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    
    // Store user data
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    // Configure axios instance with new token
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    return response.data;
  } catch (error: any) {
    console.error('Auth service: Login error:', error);
    console.error('Auth service: Error response:', error.response?.data);
    console.error('Auth service: Error status:', error.response?.status);
    // Clear any existing tokens and user data on login failure
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete axiosInstance.defaults.headers.common['Authorization'];
};

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/me/');
  // Store updated user data
  localStorage.setItem('user', JSON.stringify(response.data));
  return response.data;
};

export const updateProfile = async (userData: Partial<User> | FormData): Promise<User> => {
  const response = await axiosInstance.patch<User>('/me/', userData);
  // Store updated user data
  localStorage.setItem('user', JSON.stringify(response.data));
  return response.data;
};

// Add authorization header to requests if token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 
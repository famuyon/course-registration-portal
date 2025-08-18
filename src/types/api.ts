import { ReactNode } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  user_type: string;
  matric_number?: string;
  department?: number;
  department_name?: string;
  department_code?: string;
  level?: number;
  phone_number?: string;
  profile_picture?: string;
  signature?: string;
  is_active: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  department: Department;
  level: number;
  semester: number;
  units: number;
  is_active: boolean;
  prerequisites: any[];
  is_registered: boolean;
  enrolled_students: number;
  capacity: number;
}

export interface CourseRegistration {
  id: number;
  course: Course;
  student: User;
  registration_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ApiError {
  detail: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface Department {
  id: number;
  name: string;
  code: string;
} 
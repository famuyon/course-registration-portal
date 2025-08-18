import axios from './axios.config';

export interface Department {
  id: number;
  name: string;
  code: string;
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

export const getDepartments = async (): Promise<Department[]> => {
  const response = await axios.get('/courses/departments/');
  return response.data;
};

export const createDepartment = async (departmentData: Partial<Department>): Promise<Department> => {
  const response = await axios.post('/courses/departments/', departmentData);
  return response.data;
};

export const updateDepartment = async (id: number, departmentData: Partial<Department>): Promise<Department> => {
  const response = await axios.put(`/courses/departments/${id}/`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await axios.delete(`/courses/departments/${id}/`);
};

export const getCourses = async (): Promise<Course[]> => {
  const response = await axios.get('/courses/courses/');
  
  // Log each course being serialized for debugging
  response.data.forEach((course: any) => {
    console.log(`Serializing course ${course.code}:`, JSON.stringify(course, null, 2));
  });
  
  return response.data;
};

export const createCourse = async (courseData: any): Promise<Course> => {
  const response = await axios.post('/courses/courses/', courseData);
  return response.data;
};

export const updateCourse = async (id: number, courseData: any): Promise<Course> => {
  const response = await axios.put(`/courses/courses/${id}/`, courseData);
  return response.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  await axios.delete(`/courses/courses/${id}/`);
};

export const getRegisteredCourses = async (): Promise<Course[]> => {
  const response = await axios.get('/courses/registered/');
  return response.data;
};

export const registerForCourse = async (courseId: number): Promise<void> => {
  await axios.post(`/courses/courses/${courseId}/register/`);
};

export const unregisterFromCourse = async (courseId: number): Promise<void> => {
  await axios.post(`/courses/courses/${courseId}/unregister/`);
};

export const deregisterApprovedCourse = async (courseId: number): Promise<any> => {
  const response = await axios.post(`/courses/courses/${courseId}/deregister_approved_course/`);
  return response.data;
};

// New Registration Workflow Functions
export interface RegistrationRequest {
  course_ids: number[];
}

export interface RegistrationResponse {
  detail: string;
  registration_id: number;
  status: string;
  total_units: number;
  courses: {
    id: number;
    code: string;
    title: string;
  }[];
}

export interface RegistrationStatus {
  id: number;
  student: any;
  session: any;
  department: any;
  level: number;
  semester: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  updated_at: string;
  total_units: number;
  courses: any[];
  approvals: any[];
  signatures?: any[];
  signature_appended?: boolean;
}

export interface PendingRegistration {
  id: number;
  student: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    matric_number: string;
  };
  session: any;
  department: any;
  level: number;
  semester: string;
  status: string;
  submitted_at: string;
  total_units: number;
  courses: any[];
  comments?: string;
}

// Student: Register for multiple courses (creates pending registration)
export const registerForCourses = async (courseIds: number[], comments?: string): Promise<RegistrationResponse> => {
  const response = await axios.post('/courses/courses/register_courses/', {
    course_ids: courseIds,
    comments: comments || ''
  });
  return response.data;
};

// Student: Get registration status
export const getRegistrationStatus = async (): Promise<RegistrationStatus[]> => {
  const response = await axios.get('/courses/registrations/status/');
  return response.data;
};

// Admin: Get pending registrations
export const getPendingRegistrations = async (): Promise<PendingRegistration[]> => {
  const response = await axios.get('/courses/registrations/pending/');
  return response.data;
};

// Admin: Get all registrations (pending, approved, rejected)
export const getAllRegistrations = async (): Promise<PendingRegistration[]> => {
  const response = await axios.get('/courses/registrations/all/');
  return response.data;
};

// Admin: Approve or reject registration
export const approveRegistration = async (registrationId: number, action: 'approve' | 'reject', comments?: string) => {
  const response = await axios.patch(`/courses/registrations/${registrationId}/approve/`, {
    action,
    comments: comments || ''
  });
  return response.data;
};

// Admin: Edit registration courses (add/remove courses)
export interface EditRegistrationRequest {
  course_ids: number[];
  action: 'add' | 'remove' | 'replace';
}

export const editRegistrationCourses = async (
  registrationId: number, 
  courseIds: number[], 
  action: 'add' | 'remove' | 'replace' = 'replace'
): Promise<PendingRegistration> => {
  const response = await axios.patch(`/courses/registrations/${registrationId}/edit_courses/`, {
    course_ids: courseIds,
    action
  });
  return response.data;
};

// Admin: Get specific registration details
export const getRegistrationDetails = async (registrationId: number): Promise<PendingRegistration> => {
  const response = await axios.get(`/courses/registrations/${registrationId}/`);
  return response.data;
}; 
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const { state } = JSON.parse(authData);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth API calls
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateDetails: (data) => API.put('/auth/updatedetails', data),
  updatePassword: (data) => API.put('/auth/updatepassword', data),
  forgotPassword: (data) => API.post('/auth/forgotpassword', data),
  resetPassword: (token, data) => API.put(`/auth/resetpassword/${token}`, data),
  verifyEmail: (token) => API.get(`/auth/verifyemail/${token}`)
};

// Course API calls
export const courseAPI = {
  getAllCourses: (params) => API.get('/courses', { params }),
  getCourse: (id) => API.get(`/courses/${id}`),
  getCourseBySlug: (slug) => API.get(`/courses/slug/${slug}`),
  createCourse: (data) => API.post('/courses', data),
  updateCourse: (id, data) => API.put(`/courses/${id}`, data),
  deleteCourse: (id) => API.delete(`/courses/${id}`),
  getInstructorCourses: () => API.get('/courses/instructor/my-courses'),
  togglePublish: (id) => API.put(`/courses/${id}/publish`),
  getFeaturedCourses: () => API.get('/courses/featured'),
  searchCourses: (params) => API.get('/courses/search', { params })
};

// Enrollment API calls
export const enrollmentAPI = {
  enrollCourse: (courseId) => API.post(`/enrollments/${courseId}`),
  getMyEnrollments: () => API.get('/enrollments/my-courses'),
  getEnrollment: (id) => API.get(`/enrollments/${id}`),
  getEnrollmentByCourse: (courseId) => API.get(`/enrollments/course/${courseId}`),
  checkEnrollment: (courseId) => API.get(`/enrollments/check/${courseId}`),
  updateProgress: (enrollmentId, lessonId, data) => 
    API.put(`/enrollments/${enrollmentId}/progress/${lessonId}`, data)
};

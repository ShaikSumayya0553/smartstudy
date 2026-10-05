import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth API
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getMe = () => API.get('/auth/me');

// Profile API
export const getProfile = () => API.get('/profile');
export const saveProfile = (profileData) => API.post('/profile', profileData);

// Study Plan API
export const generateStudyPlan = (requestData) => API.post('/study-plan/generate', requestData || {});
export const getLatestStudyPlan = () => API.get('/study-plan');

// Tasks API
export const getTasks = () => API.get('/tasks');
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTask = (taskId, updateData) => API.put(`/tasks/${taskId}`, updateData);
export const deleteTask = (taskId) => API.delete(`/tasks/${taskId}`);

// Predict & Performance API
export const getPrediction = (predictData) => API.post('/predict', predictData);
export const logPerformanceScore = (logData) => API.post('/predict/log-score', logData);
export const getPerformanceHistory = () => API.get('/predict/history');

// Dashboard API
export const getDashboardData = () => API.get('/dashboard');

export default API;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('findora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// Items API
export const itemsAPI = {
  getItems: (params) => api.get('/items', { params }),
  getItemById: (id) => api.get(`/items/${id}`),
  createItem: (data) => api.post('/items', data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  resolveItem: (id) => api.patch(`/items/${id}/resolve`),
  deleteItem: (id) => api.delete(`/items/${id}`),
  getMyItems: () => api.get('/items/my'),
  getStats: () => api.get('/items/stats'),
  getMatches: (id) => api.get(`/items/${id}/matches`)
};

// Claims API
export const claimsAPI = {
  createClaim: (itemId, data) => api.post(`/claims/${itemId}`, data),
  getMyClaims: () => api.get('/claims/my'),
  getIncomingClaims: () => api.get('/claims/incoming'),
  approveClaim: (claimId) => api.patch(`/claims/${claimId}/approve`),
  rejectClaim: (claimId) => api.patch(`/claims/${claimId}/reject`)
};

// Admin API
export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, status) => api.patch(`/admin/reports/${id}/status`, { status }),
  deleteReport: (id) => api.delete(`/admin/reports/${id}`),
  getClaims: () => api.get('/admin/claims')
};

export default api;

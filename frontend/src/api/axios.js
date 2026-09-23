import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('spendiq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spendiq_token');
      localStorage.removeItem('spendiq_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// ---- Records ----
export const recordsAPI = {
  getAll: (params) => API.get('/records', { params }),
  getSummary: (params) => API.get('/records/summary', { params }),
  getOptions: () => API.get('/records/options'),
  create: (data) => API.post('/records', data),
  update: (id, data) => API.put(`/records/${id}`, data),
  delete: (id) => API.delete(`/records/${id}`),
};

export default API;

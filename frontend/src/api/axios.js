import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach the JWT token (if we have one) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ia_perma_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
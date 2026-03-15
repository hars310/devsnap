import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
});

// Attach API key from localStorage on every request
api.interceptors.request.use(config => {
  const key = localStorage.getItem('devsnap_api_key');
  if (key) config.headers['x-api-key'] = key;
  return config;
});
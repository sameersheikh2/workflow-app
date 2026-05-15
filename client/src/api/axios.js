import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/api',
});

api.defaults.withCredentials = true;

// Handle 401 Unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

export const TOKEN_KEY = 'devcollab_socket_token';

export const getSocketToken = () => localStorage.getItem(TOKEN_KEY);
export const setSocketToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearSocketToken = () => localStorage.removeItem(TOKEN_KEY);

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('devcolab_token');
  localStorage.removeItem('devcollab_token');
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthCheck = error.config?.url?.includes('/auth/me');

    if (status === 401) {
      clearAuthToken();
      if (
        !isAuthCheck &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup') &&
        !window.location.pathname.includes('/invite/accept') &&
        !window.location.pathname.includes('/terms') &&
        !window.location.pathname.includes('/privacy') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const unwrap = (response) => response.data?.data ?? response.data;

export default api;
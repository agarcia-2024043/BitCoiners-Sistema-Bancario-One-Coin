import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore.js';

// Instancia para servicios de autenticación y clientes
const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Instancia para servicios administrativos
const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de solicitudes - Instancia Auth
axiosAuth.interceptors.request.use((config) => {
  config._axiosClient = 'auth';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de solicitudes - Instancia Admin
axiosAdmin.interceptors.request.use((config) => {
  config._axiosClient = 'admin';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Variables de control para el refresco del Token
let _isRefreshing = false;
let failedQueue = [];

function _processQueue(_error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => (_error ? reject(_error) : resolve(token)));
  failedQueue = [];
}

// Manejador del interceptor de respuestas fallidas (Manejo de 401/403)
const handleRefreshToken = async function (_error) {
  const _original = _error.config;
  if (!_original || _original._retry) return Promise.reject(_error);

  const status = _error.response?.status;
  const errorCode = _error.response?.data?.error;
  const isRefreshEndpoint = (_original.url || '').includes('/auth/refresh');

  const shouldRefresh =
    (!isRefreshEndpoint && status === 401) ||
    (!isRefreshEndpoint && status === 403 && errorCode === 'TOKEN_EXPIRED');

  if (shouldRefresh) {
    const retryClient = _original._axiosClient === 'admin' ? axiosAdmin : axiosAuth;

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          _original.headers['Authorization'] = 'Bearer ' + token;
          return retryClient(_original);
        })
        .catch((err) => Promise.reject(err));
    }

    _original._retry = true;
    _isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(_error);
    }

    try {
      const response = await axiosAuth.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken, expiresIn, userDetails } = response.data;
      
      useAuthStore.setState({
        token: accessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresIn,
        user: userDetails || useAuthStore.getState().user,
        isAuthenticated: true,
      });

      _processQueue(null, accessToken);
      _original.headers['Authorization'] = 'Bearer ' + accessToken;
      return retryClient(_original);
    } catch (err) {
      _processQueue(err, null);
      useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      _isRefreshing = false;
    }
  }

  return Promise.reject(_error);
};

// Asignación de interceptores de respuesta
axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);
axiosAdmin.interceptors.response.use((res) => res, handleRefreshToken);

export { axiosAuth, axiosAdmin, handleRefreshToken };
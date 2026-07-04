// src/shared/api/authClient.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ENDPOINTS from '../constants/endpoints.js';
import useAuthStore from '../store/authStore.js';

const REFRESH_TOKEN_KEY = 'onecoin_refresh_token';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const attachAuthInterceptors = (axiosInstance, skipRefreshUrls = []) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);

      const isSkipUrl = skipRefreshUrls.some((url) => 
        originalRequest.url && originalRequest.url.endsWith(url)
      );

      if (error.response?.status === 401 && !originalRequest._retry && !isSkipUrl) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(`${ENDPOINTS.AUTH}/refresh`, {
            refreshToken,
          });

          const { accessToken, newRefreshToken } = response.data;

          useAuthStore.getState().setAccessToken(accessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
          }

          processQueue(null, accessToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          await useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(authClient, [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/resend-verification',
]);

export default authClient;

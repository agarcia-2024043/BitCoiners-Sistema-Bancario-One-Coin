// src/shared/constants/endpoints.js

export const ENDPOINTS = {
  AUTH: process.env.EXPO_PUBLIC_AUTH_URL || "http://192.168.1.2:5109/api/auth",
  USER: process.env.EXPO_PUBLIC_USER_URL || "http://192.168.1.2:3000"
};

export default ENDPOINTS;

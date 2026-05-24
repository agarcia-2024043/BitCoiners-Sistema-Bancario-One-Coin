import { axiosAuth } from './api.js';

export const login = async (data) => {
  return await axiosAuth.post('/auth/login', data);
};



export const register = async (data) => {
  return await axiosAuth.post('/auth/register', data);
};

export const verifyEmail = async (token) => {
  return await axiosAuth.post('/auth/verify-email', { token });
};

export const getAllUsers = async () => {
  const { data } = await axiosAuth.get('/management/users');
  return { users: data };
};

export const toggleUserActive = async (id) => {
  return await axiosAuth.patch(`/management/users/${id}/toggle-active`);
};
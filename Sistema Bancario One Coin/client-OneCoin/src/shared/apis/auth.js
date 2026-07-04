import { axiosAuth, axiosAdmin } from './api.js';

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
  return { users: Array.isArray(data) ? data : [] };
};

export const toggleUserActive = async (id) => {
  return await axiosAuth.patch(`/management/users/${id}/toggle-active`);
};

export const updateUser = async (id, data) => {
  return await axiosAuth.put(`/management/users/${id}`, data);
};

export const deleteUser = async (id) => {
  return await axiosAuth.delete(`/management/users/${id}`);
};

export const getAccountsByMovements = async (order = 'desc') => {
  const { data } = await axiosAdmin.get(`/accounts/by-movements?order=${order}`);
  return data;
};
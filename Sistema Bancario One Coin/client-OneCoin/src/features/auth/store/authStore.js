import { create } from 'zustand';
import { login as loginApi } from '../../../shared/apis/auth.js';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (data) => {
  set({ isLoading: true });
  try {
    const res = await loginApi(data); 
    const { token, refreshToken, user } = res.data;
    set({
      token,
      refreshToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    return user;
  } catch (err) {
    set({ isLoading: false });
    throw err;
  }
},

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    
  },
}));
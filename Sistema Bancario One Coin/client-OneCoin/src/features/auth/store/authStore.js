import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi } from '../../../shared/apis/auth.js';

export const useAuthStore = create(
  persist(
    (set) => ({
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
          const payload = res.data || {};

          if (payload.success === false || payload.Success === false) {
            set({ isLoading: false });
            const msg = (payload.message || payload.Message || '').toLowerCase();
            if (msg.includes('deshabilitada') || msg.includes('disabled') || msg.includes('desactivada')) {
              throw new Error('ACCOUNT_DISABLED');
            }
            throw new Error('Credenciales inválidas');
          }

          const { token, refreshToken, user } = payload;

          const normalizedUser = user ? { ...user } : null;
          if (normalizedUser) {
            if (!normalizedUser.role && Array.isArray(normalizedUser.roles) && normalizedUser.roles.length > 0) {
              normalizedUser.role = normalizedUser.roles[0];
            }
          }

          if (normalizedUser && normalizedUser.isActive === false) {
            set({ isLoading: false });
            throw new Error('ACCOUNT_DISABLED');
          }

          set({
            token,
            refreshToken,
            user: normalizedUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return normalizedUser;
        } catch (err) {
          set({ isLoading: false });
          const msg = (err?.response?.data?.message || err?.response?.data?.Message || '').toLowerCase();
          if (msg.includes('deshabilitada') || msg.includes('disabled') || msg.includes('desactivada')) {
            throw new Error('ACCOUNT_DISABLED');
          }
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

      checkAuth: async () => {},
    }),
    {
      name: 'onecoin-auth',
    }
  )
);
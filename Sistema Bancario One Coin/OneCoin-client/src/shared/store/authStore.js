// src/shared/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'onecoin_refresh_token';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: async (accessToken, user, refreshToken) => {
        if (refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
        set({
          token: accessToken,
          user,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setAccessToken: (token) => {
        set({ token });
      },

      updateUser: (user) => {
        set({ user });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          state.setHasHydrated(true);
        }
      },
      partialize: (state) => {
        const { _hasHydrated, ...rest } = state;
        return rest;
      }
    }
  )
);

export default useAuthStore;

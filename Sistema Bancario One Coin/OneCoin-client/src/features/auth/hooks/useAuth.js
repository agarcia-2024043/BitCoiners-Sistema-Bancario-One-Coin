// src/features/auth/hooks/useAuth.js
import { useState } from 'react';
import authClient from '../../../shared/api/authClient.js';
import useAuthStore from '../../../shared/store/authStore.js';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.post('/login', { email, password });
      const { token, accessToken, user, refreshToken } = response.data;
      // El servidor ahora devuelve todos los datos del cliente en el objeto user
      const fullUser = {
        id:           user?.id,
        username:     user?.username,
        email:        user?.email,
        role:         user?.role,
        isActive:     user?.isActive,
        fullName:     user?.fullName     || user?.FullName     || '',
        dpi:          user?.dpi          || user?.Dpi          || '',
        address:      user?.address      || user?.Address      || '',
        phoneNumber:  user?.phoneNumber  || user?.PhoneNumber  || '',
        jobName:      user?.jobName      || user?.JobName      || '',
        monthlyIncome: user?.monthlyIncome !== undefined
          ? Number(user.monthlyIncome)
          : (user?.MonthlyIncome !== undefined ? Number(user.MonthlyIncome) : 0),
      };
      await loginStore(token || accessToken, fullUser, refreshToken);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Nota: el registro de clientes ya NO se hace desde el celular.
  // Según las reglas del banco, solo un administrador puede crear cuentas
  // de cliente (ver panel web de administración). Por eso se removió
  // handleRegister de aquí — el endpoint /register del backend sigue
  // existiendo, pero esta app ya no lo llama.

  const logout = async () => {
    setLoading(true);
    try {
      await logoutStore();
    } catch (err) {
      setError(err.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
    error,
    logout,
  };
};

export default useAuth;

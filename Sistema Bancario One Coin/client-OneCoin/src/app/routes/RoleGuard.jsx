import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';

export const RoleGuard = ({ allowedRoles }) => {
  const user = useAuthStore((s) => s.user);
  return allowedRoles.includes(user?.role) ? <Outlet /> : <Navigate to="/dashboard" />;
};
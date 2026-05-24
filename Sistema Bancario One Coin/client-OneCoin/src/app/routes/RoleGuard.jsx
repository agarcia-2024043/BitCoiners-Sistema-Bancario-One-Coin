import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';

export const RoleGuard = ({ allowedRoles }) => {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/home" replace />;

  const userRoles = [];
  if (user.role) userRoles.push(user.role);
  if (Array.isArray(user.roles)) userRoles.push(...user.roles);

  const allowedLower = (allowedRoles || []).map((r) => String(r).toLowerCase());
  const userLower = userRoles.map((r) => String(r || '').toLowerCase());

  const has = userLower.some((r) => allowedLower.includes(r));

  return has ? <Outlet /> : <Navigate to="/home" replace />;
};
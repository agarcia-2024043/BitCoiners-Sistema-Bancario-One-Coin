import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoutes } from './ProtectedRoutes.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import { LoginPage } from '../../features/auth/components/LoginPage.jsx';
import { ForgotPassword } from '../../features/auth/components/ForgotPassword.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<div style={{ color: 'var(--cream)' }}>Dashboard Usuario</div>} />

        <Route element={<RoleGuard allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<div style={{ color: 'var(--gold)' }}>Dashboard Admin</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};
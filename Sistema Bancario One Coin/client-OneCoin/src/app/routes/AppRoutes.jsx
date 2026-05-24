
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoutes }      from './ProtectedRoutes.jsx';
import { RoleGuard }            from './RoleGuard.jsx';
import { useAuthStore }         from '../../features/auth/store/authStore.js';

import { LoginPage }            from '../../features/auth/components/LoginPage.jsx';
import { ForgotPassword }       from '../../features/auth/components/ForgotPassword.jsx';

import { DashboardPage }        from '../layouts/DashboardPage.jsx';

import { AdminHomePage }        from '../../features/admin/pages/AdminHomePage.jsx';
import { AdminUsersPage }       from '../../features/admin/pages/AdminUsersPage.jsx';
import { AdminLimitsPage }      from '../../features/admin/pages/AdminLimitsPage.jsx';
import { AdminReversalsPage }   from '../../features/admin/pages/AdminReversalsPage.jsx';

import { ClientHomePage }       from '../../features/client/page/ClientHomePage.jsx';
import { AccountPage }          from '../../features/client/page/AccountPage.jsx';
import { TransactionPage }      from '../../features/client/page/TransactionPage.jsx';
import { DepositWithdrawPage }  from '../../features/client/page/DepositWithdrawPage.jsx';
import { CurrencyPage }         from '../../features/client/page/CurrencyPage.jsx';
import { FavoritesPage }        from '../../features/client/page/FavoritesPage.jsx';

const AuthRedirect = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated && user) {
    const role = (user.role ?? '').toLowerCase();
    if (role === 'admin') return <Navigate to="/admin/home" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/"               element={<AuthRedirect><LoginPage /></AuthRedirect>} />
      <Route path="/login"          element={<AuthRedirect><LoginPage /></AuthRedirect>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoutes />}>

        {/* ── Rutas de cliente ── */}
        <Route element={<DashboardPage role="cliente" />}>
          <Route path="/home"           element={<ClientHomePage />} />
          <Route path="/cuentas"        element={<AccountPage />} />
          <Route path="/transacciones"  element={<TransactionPage />} />
          <Route path="/depositar"      element={<DepositWithdrawPage />} />
          <Route path="/divisas"        element={<CurrencyPage />} />
          <Route path="/favoritos"      element={<FavoritesPage />} />
        </Route>

        {/* ── Rutas de admin ── */}
        <Route element={<RoleGuard allowedRoles={['Admin']} />}>
          <Route element={<DashboardPage role="admin" />}>
            <Route path="/admin/home"      element={<AdminHomePage />} />
            <Route path="/admin/usuarios"  element={<AdminUsersPage />} />
            <Route path="/admin/limites"   element={<AdminLimitsPage />} />
            <Route path="/admin/reversiones" element={<AdminReversalsPage />} />
          </Route>
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
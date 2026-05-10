// src/app/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoutes }      from './ProtectedRoutes.jsx';
import { RoleGuard }            from './RoleGuard.jsx';
import { useAuthStore }         from '../../features/auth/store/authStore.js';

// Auth
import { RoleSelector }         from '../../features/auth/components/RoleSelector.jsx';
import { LoginPage }            from '../../features/auth/components/LoginPage.jsx';
import { ForgotPassword }       from '../../features/auth/components/ForgotPassword.jsx';

// Layout
import { DashboardPage }        from '../layouts/DashboardPage.jsx';

// Admin pages
import { AdminHomePage }        from '../../features/admin/pages/AdminHomePage.jsx';
import { AdminUsersPage }       from '../../features/admin/pages/AdminUsersPage.jsx';

// Cliente pages
import { ClientHomePage }       from '../../features/client/page/ClientHomePage.jsx';
import { AccountPage }          from '../../features/client/page/AccountPage.jsx';
import { TransactionPage }      from '../../features/client/page/TransactionPage.jsx';

// Componente que redirige al usuario ya logueado a su dashboard
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
      {/* Pantalla inicial — selector de portal (redirige si ya hay sesión) */}
      <Route path="/" element={<AuthRedirect><RoleSelector /></AuthRedirect>} />
      <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── Rutas protegidas ── */}
      <Route element={<ProtectedRoutes />}>

        {/* CLIENTE */}
        <Route element={<DashboardPage role="cliente" />}>
          <Route path="/home"          element={<ClientHomePage />} />
          <Route path="/cuentas"       element={<AccountPage />} />
          <Route path="/transacciones" element={<TransactionPage />} />
          <Route path="/seguridad"     element={<PlaceholderPage title="Seguridad" />} />
        </Route>

        {/* ADMIN — solo rol Admin */}
        <Route element={<RoleGuard allowedRoles={['Admin']} />}>
          <Route element={<DashboardPage role="admin" />}>
            <Route path="/admin/home"      element={<AdminHomePage />} />
            <Route path="/admin/usuarios"  element={<AdminUsersPage />} />
            <Route path="/admin/seguridad" element={<PlaceholderPage title="Seguridad Admin" />} />
          </Route>
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function PlaceholderPage({ title }) {
  return (
    <div style={{ color: '#fff', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h1>
      <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Próximamente...</p>
    </div>
  );
}
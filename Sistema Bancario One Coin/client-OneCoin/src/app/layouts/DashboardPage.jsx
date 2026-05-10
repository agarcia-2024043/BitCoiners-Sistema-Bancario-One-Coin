// src/app/layouts/DashboardPage.jsx
import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import bgImage from '../../assets/img/images.png';
import logo from '../../assets/img/PUVLO.png';

const NAV_ADMIN = [
  { to: '/admin/home',      label: 'Inicio',    icon: <HomeIcon /> },
  { to: '/admin/usuarios',  label: 'Usuarios',  icon: <UsersIcon /> },
  { to: '/admin/seguridad', label: 'Seguridad', icon: <ShieldIcon /> },
];

const NAV_CLIENTE = [
  { to: '/home',          label: 'Inicio',        icon: <HomeIcon /> },
  { to: '/cuentas',       label: 'Cuentas',       icon: <CardIcon /> },
  { to: '/transacciones', label: 'Transacciones', icon: <TransferIcon /> },
  { to: '/seguridad',     label: 'Seguridad',     icon: <ShieldIcon /> },
];

export const DashboardPage = ({ role = 'cliente' }) => {
  const navigate = useNavigate();
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);

  const nav         = role === 'admin' ? NAV_ADMIN : NAV_CLIENTE;
  const initials    = (user?.firstName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();
  const displayName = user?.firstName ?? user?.email?.split('@')[0] ?? 'Usuario';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: "'DM Sans', 'Sora', sans-serif",
      color: '#fff',
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        minHeight: '100vh',
        background: '#000000',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Subtle glow top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)',
        }} />

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '1.4rem 1.3rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <img
          src={logo}
          alt="OneCoin"
          style={{
            width: 36, height: 36, borderRadius: 10,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.3))',
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', lineHeight: 1 }}>
            One <span style={{ color: '#00E5FF' }}>Coin</span>
          </div>
          {role === 'admin' && (
            <div style={{ fontSize: '0.62rem', color: 'rgba(0,229,255,0.5)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Admin
            </div>
          )}
        </div>
      </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.6rem', marginBottom: '0.5rem' }}>
            Menú principal
          </div>
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to} to={to} end
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.62rem 0.85rem',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#00E5FF' : 'rgba(255,255,255,0.4)',
                background: isActive ? 'rgba(37, 181, 197, 0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #00E5FF' : '2px solid transparent',
                transition: 'all .14s',
              })}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.62rem 0.85rem', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem',
              fontFamily: 'inherit', transition: 'all .14s', width: '100%',
              borderLeft: '2px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff4d4f'; e.currentTarget.style.background = 'rgba(255,77,79,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogoutIcon />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 64,
          background: '#000000',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* Left: breadcrumb area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#00E5FF', boxShadow: '0 0 8px #00E5FF',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>Panel</span>
          </div>

          {/* Right: user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.2 }}>
                Hola, <span style={{ color: '#00E5FF' }}>{displayName}</span>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.51)', fontSize: '0.7rem', marginTop: 2 }}>
                {user?.email ?? ''}
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(30, 119, 131, 0.15)',
              border: '1px solid rgba(0,229,255,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontWeight: 700, fontSize: '0.95rem',
            }}>
              {initials}
            </div>
            <div style={{
              width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'transparent' }}>
          <Outlet />
        </main>

        {/* Security bar */}
        <div style={{
          background: '#000000',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          padding: '0.45rem 2rem',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <ShieldIcon size={12} color="#ffa2f7" />
          <span style={{ color: 'rgb(255, 255, 255)', fontSize: '0.68rem' }}>
            Seguridad Empresarial ONECOIN <strong style={{ color: 'rgba(0,229,255,0.7)' }}>Activada</strong>
          </span>
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
            color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem',
          }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 4px #34d399' }} />
            Conexión segura
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Icons ── */
function HomeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function UsersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function CardIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function TransferIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>; }
function ShieldIcon({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function LogoutIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
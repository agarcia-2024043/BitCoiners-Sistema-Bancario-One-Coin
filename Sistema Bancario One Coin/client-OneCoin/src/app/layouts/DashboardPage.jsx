// src/app/layouts/DashboardPage.jsx
import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import logo from '../../assets/img/PUVLO.png';

const NAV_ADMIN = [
  { to: '/admin/home',        label: 'Inicio',      icon: <HomeIcon /> },
  { to: '/admin/usuarios',    label: 'Usuarios',    icon: <UsersIcon /> },
  { to: '/admin/limites',     label: 'Límites',     icon: <ShieldIcon /> },
  { to: '/admin/reversiones', label: 'Reversiones', icon: <UndoIcon /> },
];

const NAV_CLIENTE = [
  {
    group: 'Principal',
    items: [
      { to: '/home',         label: 'Inicio',        icon: <HomeIcon /> },
      { to: '/cuentas',      label: 'Cuentas',       icon: <CardIcon /> },
    ],
  },
  {
    group: 'Operaciones',
    items: [
      { to: '/depositar',    label: 'Dep. / Retiro',  icon: <DepositIcon /> },
      { to: '/transacciones', label: 'Transferencias', icon: <TransferIcon /> },
    ],
  },
  {
    group: 'Herramientas',
    items: [
      { to: '/divisas',      label: 'Divisas',       icon: <CurrencyIcon /> },
      { to: '/favoritos',    label: 'Favoritas',     icon: <StarIcon /> },
    ],
  },
  
];

export const DashboardPage = ({ role = 'cliente' }) => {
  const navigate = useNavigate();
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin     = role === 'admin';
  const initials    = (user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Usuario';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen w-full flex bg-[#FFFFFF] text-[#0A0A0A] font-sans antialiased overflow-x-hidden items-stretch">

      {/* Overlay móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] border-r border-zinc-900
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:top-0 md:self-stretch md:min-h-full md:flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-900">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <img src={logo} alt="OneCoin" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">One</span>
              <span className="text-white text-sm font-black tracking-wider uppercase">Coin</span>
            </div>
            {isAdmin && (
              <span className="ml-auto text-[9px] font-bold tracking-widest text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 rounded border border-[#C5A880]/20 uppercase">Admin</span>
            )}
          </div>

          {/* Nav */}
          <nav className="p-4 flex flex-col gap-1 overflow-y-auto flex-1">
            {isAdmin ? (
              <>
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest px-3 mb-2">Menú Admin</div>
                {NAV_ADMIN.map(({ to, label, icon }) => (
                  <NavLink
                    key={to} to={to} end
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${isActive ? 'text-white bg-zinc-900 border border-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? 'text-[#C5A880]' : 'text-zinc-500'}>{icon}</span>
                        <span>{label}</span>
                        {isActive && <span className="w-1 h-1 rounded-full bg-[#C5A880] ml-auto" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </>
            ) : (
              NAV_CLIENTE.map(({ group, items }) => (
                <div key={group} className="mb-3">
                  <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.18em] px-3 mb-1.5">{group}</div>
                  {items.map(({ to, label, icon }) => (
                    <NavLink
                      key={to} to={to} end
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                        ${isActive ? 'text-white bg-zinc-900 border border-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={isActive ? 'text-[#C5A880]' : 'text-zinc-500'}>{icon}</span>
                          <span>{label}</span>
                          {isActive && <span className="w-1 h-1 rounded-full bg-[#C5A880] ml-auto" />}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              ))
            )}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/40">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
          >
            <span className="text-zinc-600 group-hover:text-red-400 transition-colors"><LogoutIcon /></span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#FFFFFF]">

        {/* TOPBAR */}
        <header className="h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-xl text-zinc-600 hover:bg-zinc-50 active:bg-zinc-100 md:hidden transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              <span>Panel Operativo</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-[#0A0A0A] leading-none">
                Hola, <span className="text-[#A3845B]">{displayName}</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">{user?.email ?? 'usuario@onecoin.com'}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#A3845B] font-bold text-sm shadow-sm">
              {initials}
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 p-6 md:p-10 max-w-screen-2xl w-full mx-auto bg-[#FFFFFF]">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-[#A3845B]"><ShieldIcon size={14} /></span>
            <span>
              Seguridad Empresarial <span className="text-[#0A0A0A] font-bold">ONECOIN</span>{' '}
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] ml-1 font-extrabold border border-emerald-200/50 uppercase">Activa</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Conexión cifrada de extremo a extremo
          </div>
        </footer>
      </div>
    </div>
  );
};

/* ── ICONOS ── */
function HomeIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function UsersIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function CardIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function TransferIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>; }
function ShieldIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function LogoutIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function DepositIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>; }
function CurrencyIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function StarIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function UndoIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>; }
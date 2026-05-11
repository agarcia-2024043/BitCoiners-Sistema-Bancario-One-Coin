// src/features/auth/components/RoleSelector.jsx
// Pantalla de selección de portal — aparece ANTES del login
// Ruta: /  (ver AppRoutes.jsx)

import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/img/PUVLO.png';
import bgImage from '../../../assets/img/images.png';

export const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Mismo fondo que LoginPage */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.85) contrast(1.15) saturate(1.25)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-[#0b1220]/40 to-black/70" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className="rounded-2xl border border-white/10 p-10 flex flex-col items-center gap-8"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(24px)' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={logo}
              alt="OneCoin"
              className="w-24 opacity-60 hover:opacity-90 transition drop-shadow-[0_0_25px_rgba(0,229,255,0.25)]"
            />
            <h1 className="text-white text-2xl font-bold tracking-tight">Banca Digital</h1>
            <p className="text-white/40 text-[11px] uppercase tracking-widest">
              Seleccione su tipo de acceso
            </p>
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* Opciones */}
          <div className="w-full flex flex-col gap-4">

            {/* Administrador → /login?role=admin */}
            <button
              onClick={() => navigate('/login?role=admin')}
              className="group w-full flex items-center gap-4 px-6 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00bcd4]/10 hover:border-[#00bcd4]/40 transition-all duration-200 text-left"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.3)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00bcd4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Iniciar como Administrador</span>
                <span className="text-white/35 text-xs mt-0.5">Acceso al panel de gestión</span>
              </div>
              <svg
                className="ml-auto opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition-all"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* Cliente → /login?role=cliente */}
            <button
              onClick={() => navigate('/login?role=cliente')}
              className="group w-full flex items-center gap-4 px-6 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-[#ffc107]/10 hover:border-[#ffc107]/40 transition-all duration-200 text-left"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.25)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffc107" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Iniciar como Cliente</span>
                <span className="text-white/35 text-xs mt-0.5">Acceda a su cuenta personal</span>
              </div>
              <svg
                className="ml-auto opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition-all"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="text-white/20 text-xs">
            OneCoin &copy; {new Date().getFullYear()} · Sistema protegido
          </p>
        </div>
      </div>
    </div>
  );
};

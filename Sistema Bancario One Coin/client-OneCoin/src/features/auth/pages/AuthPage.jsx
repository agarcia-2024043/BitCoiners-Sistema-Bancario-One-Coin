// src/app/pages/AuthPage.jsx
import { useState } from 'react';
import { LoginForm } from '../components/LoginPage.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import logo from '../../assets/img/PUVLO.png';

export const AuthPage = () => {
  const [isForgot, setIsForgot] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-[#FFFFFF] text-[#0A0A0A] font-sans antialiased overflow-x-hidden">
      
      {/* ── PANEL IZQUIERDO: Estética Corporativa Oscura (Oculto en móviles si deseas, o responsivo) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0A] p-12 flex-col justify-between relative border-r border-zinc-900">
        {/* Glow sutil superior */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent" />
        
        {/* Branding Superior */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
            <img 
              src={logo} 
              alt="PUVLO Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">One</span>
            <span className="text-white text-sm font-black tracking-wider uppercase">Coin</span>
          </div>
        </div>

        {/* Mensaje Central Inspirador */}
        <div className="max-w-md">
          <div className="w-12 h-[2px] bg-[#C5A880] mb-6" />
          <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-4">
            Tu dinero,<br />
            <span className="text-[#C5A880]">un solo lugar.</span>
          </h2>
          <p className="text-zinc-500 text-sm font-medium">
            Gestiona accesos, seguridad y operaciones desde el núcleo administrativo de OneCoin.
          </p>
        </div>

        {/* Footer del Panel Oscuro */}
        <div className="inline-flex items-center gap-2 text-[11px] text-zinc-600 font-medium border border-zinc-900 bg-zinc-950/40 px-3 py-1.5 rounded-xl w-fit">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C5A880]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Portal de Autenticación Seguro</span>
        </div>
      </div>

      {/* ── PANEL DERECHO: Formulario Limpio / Premium ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#FFFFFF]">
        <div className="w-full max-w-md flex flex-col">
          
          {/* Logo visible solo en móviles/tabletas (cuando el panel izquierdo se oculta) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
              <img 
                src={logo} 
                alt="PUVLO Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase">One</span>
              <span className="text-[#0A0A0A] text-sm font-black tracking-wider uppercase">Coin</span>
            </div>
          </div>

          {/* Badge de Contexto */}
          <div className="mb-4">
            <span className="inline-flex items-center text-[10px] font-bold tracking-widest text-[#A3845B] bg-[#FAF6F0] border border-[#EFE6D9] px-2.5 py-1 rounded-full uppercase">
              {isForgot ? 'Seguridad' : 'Portal Administrativo'}
            </span>
          </div>

          {/* Cabecera del Formulario */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">
              {isForgot ? 'Recuperar Contraseña' : 'Bienvenido de nuevo'}
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              {isForgot
                ? 'Ingresa tu correo electrónico para restablecer tus credenciales.'
                : 'Ingresa tus datos de acceso para continuar al panel de control.'}
            </p>
          </div>

          {/* Renderizado Dinámico de Formularios */}
          <div className="bg-white dynamic-form-container">
            {isForgot ? (
              <ForgotPassword
                onSwitch={() => {
                  setIsForgot(false);
                }}
              />
            ) : (
              <LoginForm
                onForgot={() => {
                  setIsForgot(true);
                }}
              />
            )}
          </div>

          {/* Footer de Términos legal sutil */}
          <p className="mt-8 text-center text-[11px] text-zinc-400 font-medium">
            Al ingresar aceptas nuestros{' '}
            <a href="#" className="text-[#A3845B] hover:underline font-semibold">Términos de servicio</a>
            {' '}y{' '}
            <a href="#" className="text-[#A3845B] hover:underline font-semibold">Política de privacidad</a>.
          </p>

        </div>
      </div>

    </div>
  );
};
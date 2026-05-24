// src/features/auth/components/RoleSelector.jsx
// Pantalla de selección de portal — Diseño premium y 100% Responsivo (Mobile Friendly)
// Ruta: / (ver AppRoutes.jsx)

import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/img/PUVLO.png'; // Tu logo/imagen de marca
import bgImage from '../../../assets/img/images.png'; // Tu imagen de fondo principal

export const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FFFFFF]">
      
      {/* ======================================================================= */}
      {/* PANEL IZQUIERDO: Imagen Limpia (Se oculta en móviles: hidden md:flex)   */}
      {/* ======================================================================= */}
      <div className="w-full md:w-5/12 lg:w-1/2 flex flex-col justify-between p-8 relative overflow-hidden bg-zinc-100 hidden md:flex">
        
        {/* IMAGEN DE FONDO COMPLETA */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        {/* Branding sutil flotando en la esquina superior */}
        <div className="flex items-center gap-3 z-10 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl self-start shadow-sm border border-white/20">
          <div className="bg-[#0A0A0A] text-white font-black w-7 h-7 rounded-lg flex items-center justify-center text-sm tracking-tighter">
            C
          </div>
          <span className="text-[#0A0A0A] text-xs font-black tracking-wider uppercase">OneCoin</span>
        </div>

        {/* Footer flotante discreto sobre la imagen */}
        <div className="z-10 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-xl self-start text-[10px] text-zinc-700 tracking-wide font-medium border border-white/20">
          256-bit SSL · Regulado · FDIC Insured
        </div>
      </div>


      {/* ======================================================================= */}
      {/* PANEL DERECHO: Centro de Interacción (Se adapta perfectamente a teléfonos) */}
      {/* ======================================================================= */}
      <div className="w-full md:w-7/12 lg:w-1/2 bg-[#FFFFFF] flex flex-col justify-between p-6 sm:p-10 md:p-16 lg:p-24 overflow-y-auto">
        
        {/* Espaciador superior (solo visible en pantallas grandes) */}
        <div className="hidden md:block" />

        <div className="w-full max-w-md mx-auto flex flex-col my-auto py-4 md:py-8">
          
          {/* 1. IMAGEN SUPERIOR DECORATIVA (Excelente branding en móvil) */}
          <div className="w-full max-w-[80px] sm:max-w-[100px] mb-5 md:mb-6">
            <img 
              src={logo} 
              alt="Ilustración Marca" 
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* Tag de contexto */}
          <div className="self-start mb-4">
            <span className="inline-flex items-center gap-1.5 bg-[#FAF6F0] text-[#A3845B] text-[11px] sm:text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border border-[#EFE6D9]">
              Portal Oficial
            </span>
          </div>

          {/* 2. INFORMACIÓN DE BIENVENIDA */}
          <div className="mb-6 md:mb-8">
            <div className="w-10 h-[3px] bg-[#C5A880] mb-4" />
            <h1 className="text-[#0A0A0A] text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2.5 sm:mb-3 leading-tight">
              Tu dinero, <span className="text-zinc-500 font-normal">un solo lugar</span><span className="text-[#C5A880]">.</span>
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed">
              Bienvenido de vuelta. Por favor, selecciona tu tipo de acceso para continuar gestionando tus finanzas de manera segura.
            </p>
          </div>

          {/* 3. BOTONES DE SELECCIÓN DE ROL (Tamaño de toque optimizado para móviles) */}
          <div className="space-y-3.5 w-full mb-6 md:mb-8">
            
            {/* Opción Administrador */}
            <button
              onClick={() => navigate('/login?role=admin')}
              className="group w-full flex items-center justify-between p-4 sm:p-5 rounded-xl border border-zinc-200 bg-white hover:border-[#0A0A0A] active:bg-zinc-50 md:hover:bg-zinc-50 transition-all duration-200 text-left shadow-sm touch-manipulation"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-sm shadow-sm md:group-hover:scale-105 transition-transform flex-shrink-0">
                  AD
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[#0A0A0A] font-bold text-sm truncate">
                    Panel Administrativo
                  </span>
                  <span className="text-zinc-400 text-xs mt-0.5 sm:block hidden truncate">
                    Auditoría, control de accesos y métricas
                  </span>
                  <span className="text-zinc-400 text-[11px] mt-0.5 sm:hidden block">
                    Gestión y control global
                  </span>
                </div>
              </div>
              <svg 
                className="text-zinc-300 md:group-hover:text-[#0A0A0A] md:group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" 
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Opción Cliente */}
            <button
              onClick={() => navigate('/login?role=cliente')}
              className="group w-full flex items-center justify-between p-4 sm:p-5 rounded-xl border border-zinc-200 bg-white hover:border-[#0A0A0A] active:bg-zinc-50 md:hover:bg-zinc-50 transition-all duration-200 text-left shadow-sm touch-manipulation"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] border border-[#EFE6D9] text-[#A3845B] flex items-center justify-center font-bold text-sm md:group-hover:scale-105 transition-transform flex-shrink-0">
                  CL
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[#0A0A0A] font-bold text-sm truncate">
                    Banca Personal / Cliente
                  </span>
                  <span className="text-zinc-400 text-xs mt-0.5 sm:block hidden truncate">
                    Saldos, transferencias y criptoactivos
                  </span>
                  <span className="text-zinc-400 text-[11px] mt-0.5 sm:hidden block">
                    Consultas, pagos y cripto
                  </span>
                </div>
              </div>
              <svg 
                className="text-zinc-300 md:group-hover:text-[#0A0A0A] md:group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" 
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

          </div>

          {/* 4. VIÑETAS RESUMIDAS */}
          <div className="border-t border-zinc-100 pt-5">
            <ul className="grid grid-cols-2 gap-2 text-zinc-500 text-[11px] font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                Transferencias 24/7
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                Cripto Integrado
              </li>
            </ul>
          </div>

        </div>

        {/* Footer del Formulario */}
        <p className="text-zinc-400 text-center text-[11px] sm:text-xs mt-auto pt-6">
          OneCoin &copy; {new Date().getFullYear()} · Sistema protegido
        </p>
      </div>

    </div>
  );
};
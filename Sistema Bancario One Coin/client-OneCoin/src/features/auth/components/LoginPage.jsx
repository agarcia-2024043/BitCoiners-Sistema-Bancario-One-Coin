import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import logoIcon from '../../../assets/img/C1.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login({ email: data.email, password: data.password, username: '' });
      const role = (user?.role ?? '').toLowerCase();
      toast.success('Bienvenido al sistema');
      if (role === 'admin') {
        navigate('/admin/home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      if (err?.message === 'ACCOUNT_DISABLED') {
        toast.error('Tu cuenta está deshabilitada. Contacta al administrador.');
      } else {
        toast.error('Credenciales incorrectas');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden">

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)',
        }}
      />

      <div className="relative w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-white/[0.07]">

        {/* ───── LEFT PANEL ───── */}
        <div className="hidden md:flex w-[55%] flex-col justify-between bg-[#0A0A0A] p-10 border-r border-white/[0.06]">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <img src={logoIcon} alt="One Coin icon" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <p className="text-white/40 text-[10px] tracking-[3px] uppercase leading-none">ONE</p>
              <p className="text-white font-black text-base tracking-[2px] leading-tight">COIN</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center py-10">
            <div className="w-8 h-[3px] bg-[#C9A84C] rounded-full mb-6" />
            <h1 className="text-white text-3xl font-bold leading-tight mb-3">
              Tus finanzas,<br />siempre contigo<span className="text-[#C9A84C]">.</span>
            </h1>
            <p className="text-white/40 text-sm mb-10">Gestión financiera inteligente y sin límites</p>

            <ul className="space-y-4">
              {[
                'Movimientos en tiempo real, 24/7',
                'Cifrado bancario de extremo a extremo',
                'Accede desde cualquier dispositivo',
                'Cripto y portafolio en un solo panel',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0" />
                  <span className="text-white/50 text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 w-fit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span className="text-white/30 text-[11px]">Privacidad · Seguridad · Confianza</span>
          </div>
        </div>

        {/* ───── RIGHT PANEL ───── */}
        <div className="w-full md:w-[45%] bg-white flex flex-col justify-center px-9 py-10">

          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
              <img src={logoIcon} alt="One Coin" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-black text-[#0A0A0A] tracking-widest text-sm">ONE COIN</span>
          </div>

          <h2 className="text-[#0A0A0A] text-xl font-bold mb-1">Bienvenido de vuelta</h2>
          <p className="text-[#888] text-sm mb-7">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div>
              <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#ccc]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="usuario@correo.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#fafafa] border border-[#e0e0e0] text-[#0A0A0A] placeholder-[#ccc] text-sm outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                  {...register('email', { required: 'Campo requerido' })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#ccc]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#fafafa] border border-[#e0e0e0] text-[#0A0A0A] placeholder-[#ccc] text-sm outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                  {...register('password', { required: 'Campo requerido' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#888] transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[#C9A84C] text-xs hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1a1a1a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export const LoginForm = LoginPage;
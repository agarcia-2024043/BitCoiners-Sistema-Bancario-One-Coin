import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bgImage from '../../../assets/img/images.png'; 
import logo from '../../../assets/img/PUVLO.png'; 

export const LoginPage = () => {
  const navigate = useNavigate();
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
    const user = await login({ email: data.email, password: data.password });
    toast.success('Bienvenido al sistema');
    navigate(user?.role === 'Admin' ? '/admin/dashboard' : '/dashboard');
  } catch {
    toast.error('Credenciales incorrectas');
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      
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

      
      <div className="relative w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl">

        
        <div className="hidden md:flex w-1/2 flex-col justify-center p-10">

          
          <img
            src={logo}
            alt="logo"
            className="w-32 mb-6 mx-auto opacity-60 hover:opacity-90 transition drop-shadow-[0_0_25px_rgba(0,229,255,0.25)]"
          />

          <h1 className="text-white text-3xl font-bold text-center mb-2">
            Banca Digital
          </h1>

          <p className="text-white/50 text-sm text-center">
            Accede a tu cuenta con seguridad empresarial
          </p>

          
          <div className="mt-10 h-1 w-24 mx-auto bg-[#00E5FF] rounded-full opacity-70" />
        </div>

        
        <div className="w-full md:w-1/2 p-10 bg-black/40 backdrop-blur-2xl">

          <h2 className="text-white text-xl font-semibold mb-6">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            
            <div>
              <label className="text-white/40 text-[11px] uppercase tracking-widest">
                Email o Username
              </label>

              <input
                type="text"
                placeholder="correo@example.com"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 outline-none transition"
                {...register('email', {
                  required: 'Campo requerido',
                })}
              />

              {errors.emailOrUsername && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.emailOrUsername.message}
                </p>
              )}
            </div>

            
            <div>
              <label className="text-white/40 text-[11px] uppercase tracking-widest">
                Contraseña
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 outline-none transition"
                {...register('password', {
                  required: 'Campo requerido',
                })}
              />

              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-black bg-[#00E5FF] hover:bg-[#00cfee] transition shadow-lg shadow-[#00E5FF]/20"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="w-full text-center text-white/30 hover:text-[#00E5FF] text-sm transition"
            >
              ¿Olvidaste tu contraseña?
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};
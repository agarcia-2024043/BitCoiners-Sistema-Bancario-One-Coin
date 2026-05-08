import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import bgImage from '../../../assets/img/images.png'; 
import logo from '../../../assets/img/PUVLO.png';
import { useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    toast.success('Te enviamos instrucciones a tu correo');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.85) contrast(1.1) saturate(1.2)',
        }}
      />

      
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-[#0b1220]/40 to-black/70" />

      
      <div className="relative w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl">

        {/* 🧠 PANEL IZQUIERDO */}
        <div className="hidden md:flex w-1/2 flex-col justify-center p-10 relative">

          
          <img
            src={logo}
            alt="logo"
            className="mx-auto mb-6 w-32 opacity-60 hover:opacity-90 transition duration-300 drop-shadow-[0_0_25px_rgba(0,229,255,0.25)]"
          />

          <h1 className="text-white text-2xl font-bold mb-2">
            Recupera tu acceso
          </h1>

          <p className="text-white/50 text-sm">
            Te enviaremos un enlace seguro para restablecer tu contraseña
          </p>
        </div>

        
        <div className="w-full md:w-1/2 p-10 bg-black/40 backdrop-blur-2xl">

          <h2 className="text-white text-xl font-semibold mb-6">
            ¿Olvidaste tu contraseña?
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
                {...register('email', { required: true })}
              />

              {errors.email && (
                <p className="text-red-400 text-xs mt-1">Campo requerido</p>
              )}
            </div>

            
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-black bg-[#00E5FF] hover:bg-[#00cfee] transition shadow-lg shadow-[#00E5FF]/20"
            >
              Enviar enlace
            </button>

            
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-center text-white/30 hover:text-[#00E5FF] text-sm mt-3 transition"
            >
              Volver al login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};
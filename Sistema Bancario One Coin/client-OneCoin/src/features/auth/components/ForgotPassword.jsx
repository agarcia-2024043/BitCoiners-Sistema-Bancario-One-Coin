import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import logoIcon from '../../../assets/img/C1.png';

const API = '';

async function apiFetch(path, body) {
  const res = await fetch(`${API}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Error inesperado');
  return data;
}

// ── Íconos ───────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconCheck = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconSpin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);

// ── Fuerza de contraseña ──────────────────────────────────────────────────────
const strengthRules = (pw = '') => [
  { label: 'Mínimo 8 caracteres',          ok: pw.length >= 8 },
  { label: 'Al menos una mayúscula',        ok: /[A-Z]/.test(pw) },
  { label: 'Al menos un número',            ok: /\d/.test(pw) },
  { label: 'Al menos un símbolo (!@#...)',  ok: /[^a-zA-Z0-9]/.test(pw) },
];

const PasswordStrength = ({ password }) => {
  const rules  = strengthRules(password);
  const passed = rules.filter((r) => r.ok).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-[#C9A84C]'];
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
            ${i < passed ? colors[passed - 1] : 'bg-[#e8e8e8]'}`} />
        ))}
      </div>
      <ul className="space-y-1">
        {rules.map(({ label, ok }) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors
              ${ok ? 'bg-[#C9A84C]' : 'bg-[#ddd]'}`} />
            <span className={`text-[11px] transition-colors ${ok ? 'text-[#444]' : 'text-[#bbb]'}`}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Input helper ──────────────────────────────────────────────────────────────
const InputField = ({ label, icon, rightSlot, error, inputProps }) => (
  <div>
    <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#ccc]">
        {icon}
      </span>
      <input
        className={`w-full pl-9 ${rightSlot ? 'pr-10' : 'pr-4'} py-2.5 rounded-lg
          bg-[#fafafa] border text-[#0A0A0A] placeholder-[#ccc] text-sm outline-none transition
          ${error
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-[#e0e0e0] focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20'
          }`}
        {...inputProps}
      />
      {rightSlot && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

// ── Layout wrappers ───────────────────────────────────────────────────────────
const PageShell = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage:
        'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),' +
        'repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)',
    }} />
    <div className="relative w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-white/[0.07]">
      {children}
    </div>
  </div>
);

const RightPanel = ({ children }) => (
  <div className="w-full md:w-[45%] bg-white flex flex-col justify-center px-9 py-10">
    {children}
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
export const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step,        setStep]        = useState(1);
  const [email,       setEmail]       = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const step1 = useForm();
  const step2 = useForm();
  const step3 = useForm();
  const pw = step3.watch('password', '');

  // ── PASO 1: enviar correo → POST /api/auth/forgot-password ───────────────
  const handleStep1 = async (data) => {
    setLoading(true);
    try {
      await apiFetch('/api/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      toast.success('Código enviado. Revisa tu correo.');
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 2: verificar OTP → POST /api/auth/verify-otp ────────────────────
  const handleStep2 = async (data) => {
  setLoading(true);
  try {
    await apiFetch('/api/auth/verify-otp', { email, otpCode: data.code });
    setOtpCode(data.code);
    toast.success('Código verificado correctamente.');
    setStep(3);
  } catch (err) {
    step2.setError('code', { message: err.message });
  } finally {
    setLoading(false);
  }
};

  // ── PASO 3: nueva contraseña → POST /api/auth/reset-password ─────────────
  const handleStep3 = async (data) => {
  setLoading(true);
  try {
    await apiFetch('/api/auth/reset-password', {
      email,
      otpCode:         otpCode,
      newPassword:     data.password,
      confirmPassword: data.confirm,
    });
    toast.success('¡Contraseña actualizada!');
    setStep(4);
  } catch (err) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};

  // ── Reenviar código ───────────────────────────────────────────────────────
  const resendCode = async () => {
    try {
      await apiFetch('/api/auth/forgot-password', { email });
      toast.success('Nuevo código enviado a tu correo.');
    } catch {
      toast.error('No se pudo reenviar. Intenta de nuevo.');
    }
  };

  // ── Componentes compartidos ───────────────────────────────────────────────
  const stepLabels = ['Correo', 'Verificación', 'Contraseña'];

  const SubmitBtn = ({ label }) => (
    <button type="submit" disabled={loading}
      className="w-full py-3 rounded-lg bg-[#0A0A0A] text-white font-semibold text-sm
        hover:bg-[#1a1a1a] active:scale-[0.98] transition-all flex items-center justify-center
        gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
      {loading ? <><IconSpin /> Procesando...</> : <><IconArrow /> {label}</>}
    </button>
  );

  const Footer = () => (
    <p className="mt-8 text-center text-[10px] text-[#ccc]">
      Al ingresar aceptas nuestros{' '}
      <span className="text-[#C9A84C] cursor-pointer hover:underline">Términos de servicio</span>
      {' '}y{' '}
      <span className="text-[#C9A84C] cursor-pointer hover:underline">Política de privacidad</span>
    </p>
  );

  const LeftPanel = ({ title, subtitle, extra }) => (
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
        <h1 className="text-white text-3xl font-bold leading-tight mb-3">{title}</h1>
        <p className="text-white/40 text-sm mb-10">{subtitle}</p>
        {extra}
      </div>
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 w-fit">
        <IconShield />
        <span className="text-white/30 text-[11px]">256-bit SSL · Regulado · FDIC Insured</span>
      </div>
    </div>
  );

  const RightHeader = ({ title, desc }) => (
    <>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
          <img src={logoIcon} alt="One Coin" className="w-5 h-5 object-contain" />
        </div>
        <span className="font-black text-[#0A0A0A] tracking-widest text-sm">ONE COIN</span>
      </div>

      {/* Indicador de pasos */}
      {step < 4 && (
        <div className="flex items-center gap-0 mb-6">
          {stepLabels.map((lbl, i) => {
            const s = i + 1;
            const done    = step > s;
            const current = step === s;
            return (
              <div key={lbl} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                    ${done    ? 'bg-[#C9A84C] text-white' : ''}
                    ${current ? 'bg-[#0A0A0A] text-white ring-2 ring-[#C9A84C]/40' : ''}
                    ${!done && !current ? 'bg-[#f0f0f0] text-[#bbb]' : ''}`}>
                    {done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : s}
                  </div>
                  <span className={`text-[9px] mt-1 font-semibold uppercase tracking-wider whitespace-nowrap
                    ${current ? 'text-[#0A0A0A]' : 'text-[#ccc]'}`}>{lbl}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-2 mb-3.5 rounded-full transition-all duration-500
                    ${done ? 'bg-[#C9A84C]' : 'bg-[#e8e8e8]'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <h2 className="text-[#0A0A0A] text-xl font-bold mb-1">{title}</h2>
      <p className="text-[#888] text-sm mb-7">{desc}</p>
    </>
  );

  // ════ PASO 1 ════
  if (step === 1) return (
    <PageShell>
      <LeftPanel
        title={<>Recupera tu<br />acceso<span className="text-[#C9A84C]">.</span></>}
        subtitle="Ingresa tu correo registrado y te enviaremos un código de verificación de 6 dígitos."
        extra={
          <ul className="space-y-4">
            {['Código enviado a tu correo', 'Válido por 10 minutos', 'Protección de datos garantizada'].map((f, i) => (
              <li key={f} className="flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-[#C9A84C]' : 'bg-white/20'}`} />
                <span className={`text-sm ${i === 0 ? 'text-white/70' : 'text-white/30'}`}>{f}</span>
              </li>
            ))}
          </ul>
        }
      />
      <RightPanel>
        <RightHeader
          title="¿Olvidaste tu contraseña?"
          desc="Ingresa el correo asociado a tu cuenta y recibirás un código de 6 dígitos."
        />
        <form onSubmit={step1.handleSubmit(handleStep1)} className="space-y-5">
          <InputField
            label="Correo electrónico"
            icon={<IconMail />}
            error={step1.formState.errors.email?.message}
            inputProps={{
              type: 'text',
              placeholder: 'usuario@correo.com',
              ...step1.register('email', {
                required: 'Campo requerido',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
              }),
            }}
          />
          <SubmitBtn label="Enviar código" />
          <button type="button" onClick={() => navigate('/')}
            className="w-full text-center text-[#bbb] hover:text-[#0A0A0A] text-xs transition">
            ← Volver al inicio de sesión
          </button>
        </form>
        <Footer />
      </RightPanel>
    </PageShell>
  );

  // ════ PASO 2 ════
  if (step === 2) return (
    <PageShell>
      <LeftPanel
        title={<>Verifica tu<br />identidad<span className="text-[#C9A84C]">.</span></>}
        subtitle="Revisa tu bandeja de entrada — te enviamos un código de 6 dígitos."
        extra={
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4 space-y-1">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold">Código enviado a</p>
            <p className="text-[#C9A84C] font-bold text-sm break-all">{email}</p>
            <p className="text-white/25 text-[11px] pt-1">Expira en 10 minutos. Revisa spam si no lo ves.</p>
          </div>
        }
      />
      <RightPanel>
        <RightHeader
          title="Ingresa el código"
          desc={<>Enviamos un código de 6 dígitos a <span className="text-[#C9A84C] font-semibold">{email}</span></>}
        />
        <form onSubmit={step2.handleSubmit(handleStep2)} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-1.5">
              Código de verificación
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="——————"
              className={`w-full px-4 py-3.5 rounded-lg bg-[#fafafa] border text-center
                text-2xl font-black tracking-[0.6em] text-[#0A0A0A] placeholder-[#ddd]
                outline-none transition
                ${step2.formState.errors.code
                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-[#e0e0e0] focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20'
                }`}
              {...step2.register('code', {
                required: 'Ingresa el código',
                pattern:  { value: /^\d{6}$/, message: 'Debe ser exactamente 6 dígitos numéricos' },
              })}
            />
            {step2.formState.errors.code && (
              <p className="text-red-500 text-xs mt-1.5">{step2.formState.errors.code.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2.5 bg-[#fffbf0] border border-[#C9A84C]/20 rounded-lg px-4 py-3">
            <span className="flex-shrink-0 mt-0.5"><IconShield /></span>
            <p className="text-[#888] text-xs leading-relaxed">
              El código es de un solo uso y expira en <span className="font-semibold text-[#0A0A0A]">10 minutos</span>.
            </p>
          </div>

          <SubmitBtn label="Verificar código" />

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStep(1)}
              className="text-[#bbb] hover:text-[#0A0A0A] text-xs transition">
              ← Cambiar correo
            </button>
            <button type="button" onClick={resendCode}
              className="text-[#C9A84C] text-xs hover:underline transition">
              Reenviar código
            </button>
          </div>
        </form>
        <Footer />
      </RightPanel>
    </PageShell>
  );

  // ════ PASO 3 ════
  if (step === 3) return (
    <PageShell>
      <LeftPanel
        title={<>Nueva<br />contraseña<span className="text-[#C9A84C]">.</span></>}
        subtitle="Elige una contraseña segura para proteger tu cuenta bancaria."
        extra={
          <ul className="space-y-3">
            {strengthRules(pw).map(({ label, ok }) => (
              <li key={label} className="flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${ok ? 'bg-[#C9A84C]' : 'bg-white/15'}`} />
                <span className={`text-sm transition-colors ${ok ? 'text-white/70' : 'text-white/25'}`}>{label}</span>
              </li>
            ))}
          </ul>
        }
      />
      <RightPanel>
        <RightHeader
          title="Crea una nueva contraseña"
          desc="Tu nueva contraseña debe ser diferente a contraseñas anteriores."
        />
        <form onSubmit={step3.handleSubmit(handleStep3)} className="space-y-5">
          <InputField
            label="Nueva contraseña"
            icon={<IconLock />}
            error={step3.formState.errors.password?.message}
            rightSlot={
              <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                className="text-[#bbb] hover:text-[#888] transition">
                <IconEye open={showPw} />
              </button>
            }
            inputProps={{
              type: showPw ? 'text' : 'password',
              placeholder: '••••••••••',
              ...step3.register('password', {
                required:  'Campo requerido',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                validate:  (v) => {
                  const rules = strengthRules(v);
                  return rules.every(r => r.ok) || 'La contraseña no cumple todos los requisitos';
                },
              }),
            }}
          />

          {pw && <PasswordStrength password={pw} />}

          <InputField
            label="Confirmar contraseña"
            icon={<IconLock />}
            error={step3.formState.errors.confirm?.message}
            rightSlot={
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)}
                className="text-[#bbb] hover:text-[#888] transition">
                <IconEye open={showConfirm} />
              </button>
            }
            inputProps={{
              type: showConfirm ? 'text' : 'password',
              placeholder: '••••••••••',
              ...step3.register('confirm', {
                required: 'Campo requerido',
                validate: (v) => v === step3.getValues('password') || 'Las contraseñas no coinciden',
              }),
            }}
          />

          <SubmitBtn label="Actualizar contraseña" />

          <button type="button" onClick={() => setStep(2)}
            className="w-full text-center text-[#bbb] hover:text-[#0A0A0A] text-xs transition">
            ← Volver
          </button>
        </form>
        <Footer />
      </RightPanel>
    </PageShell>
  );

  // ════ PASO 4 — Éxito ════
  return (
    <PageShell>
      <LeftPanel
        title={<>¡Listo,<br />todo en orden<span className="text-[#C9A84C]">!</span></>}
        subtitle="Tu contraseña fue actualizada correctamente. Ya puedes acceder a tu cuenta."
        extra={null}
      />
      <RightPanel>
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
            <img src={logoIcon} alt="One Coin" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-black text-[#0A0A0A] tracking-widest text-sm">ONE COIN</span>
        </div>
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 bg-[#fffbf0] border border-[#C9A84C]/30 rounded-full flex items-center justify-center mb-5">
            <IconCheck />
          </div>
          <h2 className="text-[#0A0A0A] text-xl font-bold mb-2">¡Contraseña actualizada!</h2>
          <p className="text-[#888] text-sm mb-8 max-w-xs leading-relaxed">
            Tu contraseña fue restablecida con éxito. Inicia sesión con tus nuevas credenciales.
          </p>
          <div className="flex gap-1 mb-8">
            {[1,2,3].map((i) => <div key={i} className="h-1 w-6 rounded-full bg-[#C9A84C]" />)}
          </div>
          <button onClick={() => navigate('/')}
            className="w-full py-3 rounded-lg bg-[#0A0A0A] text-white font-semibold text-sm
              hover:bg-[#1a1a1a] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <IconArrow />
            Ir al inicio de sesión
          </button>
        </div>
        <Footer />
      </RightPanel>
    </PageShell>
  );
};
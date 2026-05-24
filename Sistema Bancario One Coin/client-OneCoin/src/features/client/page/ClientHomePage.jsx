
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const get = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

const fmt     = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);
const fmtDate = d => new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
const cap     = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const TX_COLORS = {
  deposit: 'text-emerald-600',
  withdrawal: 'text-red-500',
  transfer: 'text-red-500',
  salary: 'text-emerald-600',
  reversal: 'text-amber-500',
  DEPOSITO: 'text-emerald-600',
  RETIRO: 'text-red-500',
  TRANSFERENCIA: 'text-red-500',
  REVERTIDA: 'text-amber-500',
};

const TX_LABELS = {
  deposit: 'Depósito', withdrawal: 'Retiro', transfer: 'Transferencia',
  salary: 'Salario', reversal: 'Reversión',
  DEPOSITO: 'Depósito', RETIRO: 'Retiro', TRANSFERENCIA: 'Transferencia', REVERTIDA: 'Reversión',
};

const TYPE_ACCENT = {
  ahorro: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  monetaria: 'bg-sky-50 text-sky-700 border-sky-200',
  corriente: 'bg-violet-50 text-violet-700 border-violet-200',
};

export const ClientHomePage = () => {
  const token    = useAuthStore((s) => s.token);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [txs, setTxs]           = useState([]);
  const [loading, setLoading]   = useState(true);

  const displayName = user?.firstName ?? user?.username ?? user?.email?.split('@')[0] ?? 'Usuario';

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        get(`${NODE_URL}/accounts`, token),
        get(`${NODE_URL}/transactions`, token),
      ]);
      setAccounts(a.accounts ?? []);
      setTxs((t.transactions ?? []).slice(0, 6));
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) load(); }, [load, token]);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);
  const userAccountIds = new Set(accounts.map(a => a._id?.toString()));
  const isNegative = (t) => {
    if (t.type === 'RETIRO' || t.type === 'withdrawal') return true;
    if (t.type === 'TRANSFERENCIA' || t.type === 'transfer') {
      const originId = t.originAccount?._id?.toString() ?? t.originAccount?.toString();
      return userAccountIds.has(originId);
    }
    return false;
  };

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">
          Bienvenido, {displayName}
        </h1>
        <p className="text-zinc-400 text-xs font-medium mt-0.5">Resumen de tu actividad financiera</p>
      </div>

      {/* Balance total banner */}
      {!loading && accounts.length > 0 && (
        <div className="bg-[#0A0A0A] border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C5A880]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="relative z-10">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Saldo Total Consolidado</p>
            <p className="text-3xl font-black text-white tracking-tight mt-1">{fmt(totalBalance)}</p>
            <p className="text-[11px] text-zinc-500 mt-1.5">{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} registrada{accounts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative z-10 hidden sm:flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Saldo actualizado
            </span>
            <button
              onClick={() => navigate('/cuentas')}
              className="text-[11px] font-bold text-[#C5A880] hover:text-white transition-colors"
            >
              Ver cuentas →
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<CardIcon />}
          label="Cuentas Activas"
          value={loading ? '—' : accounts.length.toString()}
          sub="Cuentas bancarias"
        />
        <StatCard
          icon={<TxIcon />}
          label="Transacciones"
          value={loading ? '—' : txs.length.toString()}
          sub="Últimas registradas"
        />
        <StatCard
          icon={<ShieldIcon />}
          label="Estado de Cuenta"
          value="Activa"
          sub="Verificada y segura"
          highlight
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Resumen de cuentas */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="font-bold text-sm text-[#0A0A0A]">Mis Cuentas</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Resumen de tus cuentas bancarias</p>
              </div>
              <button
                onClick={() => navigate('/cuentas')}
                className="text-[11px] font-bold text-white bg-[#0A0A0A] hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                Gestionar
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-zinc-400 text-sm">Cargando cuentas...</div>
            ) : accounts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-zinc-400 text-sm mb-3">No tienes cuentas aún</p>
                <button
                  onClick={() => navigate('/cuentas')}
                  className="text-[11px] font-bold text-[#A3845B] hover:underline"
                >
                  Crear primera cuenta →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {accounts.slice(0, 4).map((a, i) => (
                  <div key={a._id ?? i} className="flex items-center justify-between px-5 py-4 hover:bg-[#FAF6F0]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#A3845B] flex-shrink-0">
                        <CardIcon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0A0A0A] capitalize">Cuenta {cap(a.type)}</p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{a.accountNumber ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_ACCENT[a.type] ?? 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
                        {cap(a.type)}
                      </span>
                      <p className="font-bold text-sm text-[#0A0A0A]">{fmt(a.balance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="font-bold text-sm text-[#0A0A0A]">Últimas Transacciones</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Movimientos recientes en tus cuentas</p>
              </div>
              <button
                onClick={() => navigate('/transacciones')}
                className="text-[11px] font-bold text-zinc-500 bg-zinc-50 hover:bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200/60 transition-colors"
              >
                Ver todo
              </button>
            </div>
            {loading ? (
              <div className="py-12 text-center text-zinc-400 text-sm">Cargando...</div>
            ) : txs.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm">Sin transacciones aún</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {txs.map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAF6F0]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isNegative(t) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isNegative(t) ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0A0A0A]">
                          {t.originAccount?.accountNumber ?? t.originAccount ?? 'Operación'}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{fmtDate(t.date ?? t.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${TX_COLORS[t.type] ?? 'text-zinc-600'}`}>
                        {isNegative(t) ? '-' : '+'}{fmt(t.amount)}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{TX_LABELS[t.type] ?? t.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Transferencia rápida */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="font-bold text-sm text-[#0A0A0A]">Acciones Rápidas</h2>
            </div>
            <div className="p-4 space-y-3">
              <QuickAction
                icon={<TransferIcon />}
                title="Nueva Transferencia"
                sub="Enviar dinero a otra cuenta"
                onClick={() => navigate('/transacciones')}
              />
              <QuickAction
                icon={<CardIcon />}
                title="Nueva Cuenta"
                sub="Abrir una cuenta bancaria"
                onClick={() => navigate('/cuentas')}
              />
              <QuickAction
                icon={<TxIcon />}
                title="Historial Completo"
                sub="Ver todos tus movimientos"
                onClick={() => navigate('/transacciones')}
              />
            </div>
          </div>

          {/* Seguridad */}
          <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#C5A880]">
                <ShieldIcon size={16} />
              </div>
              <span className="text-sm font-bold text-white">Seguridad</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-4">Tu cuenta está protegida con cifrado de extremo a extremo.</p>
            <div className="space-y-2">
              {['Contraseña segura', 'Sesión activa', 'Cuenta verificada'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-zinc-400">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

function StatCard({ icon, label, value, sub, highlight }) {
  if (highlight) {
    return (
      <div className="bg-[#FAF6F0] border border-[#EFE6D9] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#A3845B] font-bold uppercase tracking-wider">{label}</p>
          <p className="text-xl font-black text-[#A3845B] tracking-tight mt-1">{value}</p>
          <p className="text-[10px] text-[#C5A880] mt-1.5 font-medium">{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#A3845B]/10 border border-[#EFE6D9] flex items-center justify-center text-[#A3845B]">{icon}</div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-[#0A0A0A] tracking-tight mt-1">{value}</p>
        <p className="text-[10px] text-zinc-400 mt-1.5 font-medium">{sub}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-[#C5A880]">{icon}</div>
    </div>
  );
}

function QuickAction({ icon, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-zinc-100 bg-white hover:bg-[#FAF6F0] hover:border-[#EFE6D9] transition-all duration-150 group shadow-sm"
    >
      <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-[#C5A880] flex-shrink-0">{icon}</div>
      <div className="text-left">
        <p className="text-xs font-bold text-[#0A0A0A]">{title}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>
      </div>
      <svg className="ml-auto text-zinc-300 group-hover:text-[#A3845B] transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  );
}

function CardIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function TxIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function ShieldIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function TransferIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>; }
function ArrowUpIcon({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>; }
function ArrowDownIcon({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>; }

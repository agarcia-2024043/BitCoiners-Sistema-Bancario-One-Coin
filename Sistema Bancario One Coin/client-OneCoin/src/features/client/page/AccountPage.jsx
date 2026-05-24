// src/features/client/page/AccountPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const fmt = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const TIPO_OPTS = ['ahorro', 'monetaria', 'corriente'];

const TYPE_STYLES = {
  ahorro:    { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: 'text-emerald-600' },
  monetaria: { badge: 'bg-sky-50 text-sky-700 border-sky-200',            dot: 'bg-sky-500',     icon: 'text-sky-600' },
  corriente: { badge: 'bg-violet-50 text-violet-700 border-violet-200',   dot: 'bg-violet-500',  icon: 'text-violet-600' },
};

export const AccountPage = () => {
  const token = useAuthStore((s) => s.token);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo]           = useState('ahorro');
  const [initialBalance, setInitialBalance] = useState('');
  const [creating, setCreating]   = useState(false);
  const [createMsg, setCreateMsg] = useState({ text: '', ok: true });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${NODE_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    } catch { setError('No se pudieron cargar las cuentas.'); }
    finally  { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setCreateMsg({ text: '', ok: true });
    try {
      const res  = await fetch(`${NODE_URL}/accounts/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tipo, initialBalance: initialBalance ? Number(initialBalance) : 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCreateMsg({ text: 'Cuenta creada exitosamente', ok: true });
      setShowModal(false); setTipo('ahorro'); setInitialBalance('');
      load();
    } catch (err) {
      setCreateMsg({ text: err.message, ok: false });
    } finally { setCreating(false); }
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Mis Cuentas</h1>
          <p className="text-zinc-400 text-xs font-medium mt-0.5">Gestión de cuentas bancarias</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 self-start md:self-auto text-sm font-bold text-[#C5A880] bg-[#0A0A0A] hover:bg-zinc-800 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <PlusIcon />
          Nueva Cuenta
        </button>
      </div>

      {/* Balance total */}
      {!loading && accounts.length > 0 && (
        <div className="bg-[#0A0A0A] border border-zinc-900 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C5A880]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="relative z-10">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Saldo Total Consolidado</p>
            <p className="text-3xl font-black text-white tracking-tight mt-1">{fmt(totalBalance)}</p>
            <p className="text-[11px] text-zinc-500 mt-1.5">{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#C5A880]">
            <BankIcon />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm py-16 text-center text-zinc-400 text-sm">
          Cargando cuentas...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">{error}</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#A3845B] mx-auto mb-4">
            <BankIcon />
          </div>
          <p className="text-zinc-400 text-sm mb-1">No tienes cuentas todavía</p>
          <p className="text-zinc-300 text-xs mb-5">Crea tu primera cuenta para comenzar</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#C5A880] bg-[#0A0A0A] hover:bg-zinc-800 px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusIcon />
            Crear mi primera cuenta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map(a => <AccountCard key={a._id} account={a} />)}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div>
                <h3 className="font-black text-[#0A0A0A] text-base">Nueva Cuenta</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Configura el tipo y saldo inicial</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-400 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  Tipo de cuenta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIPO_OPTS.map(t => {
                    const s = TYPE_STYLES[t];
                    return (
                      <button
                        key={t} type="button" onClick={() => setTipo(t)}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all capitalize ${
                          tipo === t
                            ? `${s.badge} border-current shadow-sm`
                            : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Saldo inicial (GTQ)
                </label>
                <input
                  type="number" min="0" placeholder="0.00"
                  value={initialBalance} onChange={e => setInitialBalance(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[#0A0A0A] outline-none transition-colors placeholder:text-zinc-300 focus:border-[#C5A880] focus:ring-2 focus:ring-[#FAF6F0]"
                />
              </div>

              {createMsg.text && (
                <div className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
                  createMsg.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {createMsg.text}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={creating}
                  className="flex-1 py-3 rounded-xl bg-[#0A0A0A] text-sm font-bold text-[#C5A880] hover:bg-zinc-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function AccountCard({ account: a }) {
  const s = TYPE_STYLES[a.type] ?? { badge: 'bg-zinc-50 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400', icon: 'text-zinc-500' };
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden hover:border-[#EFE6D9] hover:shadow-md transition-all duration-200">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.badge} border`}>
            <CardIcon size={18} />
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${s.badge} capitalize`}>
            {a.type}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 font-mono tracking-wider mb-1">{a.accountNumber ?? '—'}</p>
        <p className="text-2xl font-black text-[#0A0A0A] tracking-tight">{fmt(a.balance)}</p>
      </div>
      <div className={`px-5 py-3 border-t border-zinc-50 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        Cuenta activa
      </div>
    </div>
  );
}

function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CardIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function BankIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>; }

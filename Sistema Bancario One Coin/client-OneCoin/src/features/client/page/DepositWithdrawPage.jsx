// src/features/client/page/DepositWithdrawPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import toast from 'react-hot-toast';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const fmt = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const apiFetch = async (url, token, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

const TYPE_STYLES = {
  ahorro:    'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]',
  monetaria: 'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]',
  corriente: 'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]',
};

// ── Modal de confirmación (sin PIN) ─────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, operation, amount, account, loading }) {
  useEffect(() => {}, [open]);
  if (!open) return null;

  const isDeposit = operation === 'deposito';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-100 overflow-hidden">

        <div className="px-6 py-5 border-b border-[#EFE6D9] bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFE6D9] text-[#A3845B] flex items-center justify-center">
              {isDeposit ? <ArrowDownIcon size={20} /> : <ArrowUpIcon size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-[#0A0A0A] text-base">
                Confirmar {isDeposit ? 'Depósito' : 'Retiro'}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Revisa los datos antes de continuar</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-[#FAF6F0] border border-[#EFE6D9] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 font-medium">Operación</span>
              <span className="font-bold text-[#A3845B]">{isDeposit ? 'Depósito' : 'Retiro'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 font-medium">Cuenta</span>
              <span className="font-bold text-[#0A0A0A] font-mono">{account?.accountNumber}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#EFE6D9] pt-2">
              <span className="text-zinc-500 font-medium">Monto</span>
              <span className="font-black text-[#0A0A0A] text-base">{fmt(amount)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-bold hover:bg-zinc-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <SpinIcon /> : null}
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────
export const DepositWithdrawPage = () => {
  const token = useAuthStore((s) => s.token);
  const [accounts, setAccounts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('deposito');
  const [accountId, setAccountId]   = useState('');
  const [amount, setAmount]         = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingOp, setPendingOp]   = useState(null);
  const [recentTxs, setRecentTxs]   = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        apiFetch(`${NODE_URL}/accounts`, token),
        apiFetch(`${NODE_URL}/transactions`, token),
      ]);
      const accs = a.accounts ?? [];
      setAccounts(accs);
      if (!accountId && accs.length) setAccountId(accs[0]._id);
      const relevant = (t.transactions ?? [])
        .filter(tx => ['DEPOSITO', 'RETIRO'].includes(tx.type))
        .slice(0, 8);
      setRecentTxs(relevant);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const selectedAccount = accounts.find(a => a._id === accountId);

  const handleRequestConfirm = (e) => {
    e.preventDefault();
    if (!accountId || !amount || Number(amount) <= 0) {
      toast.error('Completa todos los campos correctamente');
      return;
    }
    setPendingOp({ type: activeTab, accountId, amount: Number(amount) });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingOp) return;
    setSending(true);
    const endpoint = pendingOp.type === 'deposito' ? '/accounts/deposit' : '/accounts/withdraw';
    try {
      await apiFetch(`${NODE_URL}${endpoint}`, token, {
        method: 'POST',
        body: JSON.stringify({ accountId: pendingOp.accountId, amount: pendingOp.amount }),
      });
      toast.success(pendingOp.type === 'deposito' ? '✅ Depósito realizado exitosamente' : '✅ Retiro realizado exitosamente');
      setConfirmOpen(false);
      setAmount('');
      setDescription('');
      setPendingOp(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const isNeg = (t) => ['RETIRO', 'withdrawal'].includes(t.type);

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div>
        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Operaciones Bancarias</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Depósitos y Retiros</h1>
        <p className="text-zinc-400 text-xs font-medium mt-0.5">Gestiona el saldo de tus cuentas con seguridad</p>
        <div className="w-8 h-[3px] bg-[#C9A84C] rounded-full mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Panel izquierdo: formulario ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">

            <div className="flex border-b border-zinc-100">
              <button
                onClick={() => setActiveTab('deposito')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
                  activeTab === 'deposito'
                    ? 'text-[#A3845B] bg-[#FAF6F0] border-[#C9A84C]'
                    : 'text-zinc-400 border-transparent hover:text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <ArrowDownIcon size={16} />
                Depositar
              </button>
              <button
                onClick={() => setActiveTab('retiro')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
                  activeTab === 'retiro'
                    ? 'text-[#A3845B] bg-[#FAF6F0] border-[#C9A84C]'
                    : 'text-zinc-400 border-transparent hover:text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <ArrowUpIcon size={16} />
                Retirar
              </button>
            </div>

            <form onSubmit={handleRequestConfirm} className="p-6 space-y-5">

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Cuenta
                </label>
                {loading ? (
                  <div className="h-11 bg-zinc-50 rounded-xl animate-pulse" />
                ) : accounts.length === 0 ? (
                  <p className="text-sm text-zinc-400">No tienes cuentas disponibles</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {accounts.map(a => (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setAccountId(a._id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          accountId === a._id
                            ? 'border-[#C9A84C] bg-[#FAF6F0]'
                            : 'border-zinc-100 bg-white hover:border-[#EFE6D9] hover:bg-[#FAF6F0]/40'
                        }`}
                      >
                        <div className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_STYLES[a.type] ?? 'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]'} mb-1.5`}>
                          {cap(a.type)}
                        </div>
                        <p className="font-mono text-[11px] text-zinc-400">{a.accountNumber}</p>
                        <p className="font-black text-sm text-[#0A0A0A] mt-0.5">{fmt(a.balance)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Monto (GTQ)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Q</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] text-base font-bold placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                  />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[100, 250, 500, 1000, 5000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className="text-[11px] font-bold px-3 py-1 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-[#FAF6F0] hover:text-[#A3845B] transition"
                    >
                      Q{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  placeholder={activeTab === 'deposito' ? 'Ej. Depósito nómina' : 'Ej. Retiro efectivo'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={80}
                  className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] text-sm placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                />
              </div>

              {selectedAccount && amount && Number(amount) > 0 && (
                <div className="bg-[#FAF6F0] border border-[#EFE6D9] rounded-xl p-4">
                  <p className="text-[11px] font-bold text-[#A3845B] uppercase tracking-widest mb-3">
                    Resumen de operación
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tipo</span>
                      <span className="font-bold text-[#A3845B]">
                        {activeTab === 'deposito' ? '↓ Depósito' : '↑ Retiro'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Saldo actual</span>
                      <span className="font-bold text-[#0A0A0A]">{fmt(selectedAccount.balance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Operación</span>
                      <span className="font-bold text-[#C9A84C]">
                        {activeTab === 'deposito' ? '+' : '-'}{fmt(Number(amount))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#EFE6D9] pt-2">
                      <span className="text-zinc-600 font-semibold">Saldo estimado</span>
                      <span className="font-black text-[#0A0A0A]">
                        {fmt(activeTab === 'deposito'
                          ? selectedAccount.balance + Number(amount)
                          : selectedAccount.balance - Number(amount))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !accountId || !amount || Number(amount) <= 0}
                className="w-full py-3.5 rounded-xl bg-[#0A0A0A] text-white font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg"
              >
                {activeTab === 'deposito' ? 'Proceder al Depósito' : 'Proceder al Retiro'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div className="space-y-5">

          {selectedAccount && (
            <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-zinc-800">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Cuenta Seleccionada</p>
              <div className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded border bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20 mb-2">
                {cap(selectedAccount.type)}
              </div>
              <p className="font-mono text-xs text-zinc-400 mb-1">{selectedAccount.accountNumber}</p>
              <p className="text-2xl font-black text-white">{fmt(selectedAccount.balance)}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Saldo disponible</p>
            </div>
          )}

          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-[#0A0A0A]">Últimas Operaciones</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Depósitos y retiros recientes</p>
            </div>
            {loading ? (
              <div className="py-8 text-center text-zinc-400 text-sm">Cargando...</div>
            ) : recentTxs.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-sm">Sin operaciones aún</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {recentTxs.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#A3845B] flex-shrink-0">
                        {isNeg(tx) ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0A0A0A]">
                          {tx.type === 'DEPOSITO' ? 'Depósito' : 'Retiro'}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-mono">{tx.originAccount?.accountNumber ?? '—'}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#A3845B]">
                      {isNeg(tx) ? '-' : '+'}{fmt(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSending(false); }}
        onConfirm={handleConfirm}
        operation={pendingOp?.type}
        amount={pendingOp?.amount}
        account={selectedAccount}
        loading={sending}
      />
    </div>
  );
};

// ── Iconos ──────────────────────────────────────────────────────
function ArrowDownIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
}
function ArrowUpIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
}
function SpinIcon() {
  return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
}

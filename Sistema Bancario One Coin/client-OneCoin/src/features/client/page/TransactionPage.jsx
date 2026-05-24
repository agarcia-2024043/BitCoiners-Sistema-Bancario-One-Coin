// src/features/client/page/TransactionPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import toast from 'react-hot-toast';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const fmt     = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);
const fmtDate = d => new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
const cap     = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const apiFetch = async (url, token, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

const TX_TYPES  = ['Todos', 'DEPOSITO', 'RETIRO', 'TRANSFERENCIA', 'REVERTIDA'];
const TX_LABELS = { DEPOSITO: 'Depósito', RETIRO: 'Retiro', TRANSFERENCIA: 'Transferencia', REVERTIDA: 'Reversión' };
const TX_BADGE  = {
  DEPOSITO:      'text-[#A3845B] bg-[#FAF6F0] border-[#EFE6D9]',
  RETIRO:        'text-[#A3845B] bg-[#FAF6F0] border-[#EFE6D9]',
  TRANSFERENCIA: 'text-[#A3845B] bg-[#FAF6F0] border-[#EFE6D9]',
  REVERTIDA:     'text-zinc-600 bg-zinc-50 border-zinc-200',
};

// Determina si la transacción es saliente para el usuario actual
// Para RETIRO: siempre es saliente
// Para TRANSFERENCIA: es saliente solo si la cuenta origen pertenece al usuario
const isOutgoing = (t, userAccountIds) => {
  if (t.type === 'RETIRO') return true;
  if (t.type === 'TRANSFERENCIA') {
    const originId = t.originAccount?._id?.toString() ?? t.originAccount?.toString();
    return userAccountIds.has(originId);
  }
  return false;
};

// ── Modal Confirmar Transferencia (sin PIN) ──────────────────────
function TransferConfirmModal({ open, onClose, onConfirm, fromAccount, toAccount, amount, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EFE6D9] bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFE6D9] text-[#A3845B] flex items-center justify-center">
              <TransferIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#0A0A0A] text-base">Confirmar Transferencia</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Revisa los datos antes de continuar</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-[#FAF6F0] border border-[#EFE6D9] rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 font-medium">Desde</span>
              <span className="font-bold font-mono text-[#0A0A0A]">{fromAccount?.accountNumber ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[#EFE6D9]" />
              <TransferIcon size={12} />
              <div className="flex-1 h-px bg-[#EFE6D9]" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 font-medium">Hacia</span>
              <span className="font-bold font-mono text-[#0A0A0A]">{toAccount?.accountNumber ?? '—'}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#EFE6D9] pt-2">
              <span className="text-zinc-500 font-medium">Monto</span>
              <span className="font-black text-[#C9A84C] text-base">{fmt(amount)}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-bold hover:bg-zinc-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <SpinIcon /> : null}
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────
export const TransactionPage = () => {
  const token = useAuthStore((s) => s.token);

  const [txs, setTxs]           = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterType, setFilterType] = useState('Todos');
  const [search, setSearch]     = useState('');

  // Formulario transferencia
  const [fromId, setFromId]     = useState('');
  const [amount, setAmount]     = useState('');
  const [sending, setSending]   = useState(false);

  // Búsqueda cuenta destino
  const [destQuery, setDestQuery]   = useState('');
  const [destAccount, setDestAccount] = useState(null);
  const [searching, setSearching]   = useState(false);
  const [destError, setDestError]   = useState('');

  // Favoritos
  const [favorites, setFavorites] = useState([]);

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [a, t, f] = await Promise.allSettled([
        apiFetch(`${NODE_URL}/accounts`, token),
        apiFetch(`${NODE_URL}/transactions`, token),
        apiFetch(`${NODE_URL}/favorites`, token),
      ]);

      const accs = a.status === 'fulfilled' ? (a.value.accounts ?? []) : [];
      setAccounts(accs);
      if (!fromId && accs.length) setFromId(accs[0]._id);

      if (t.status === 'fulfilled') setTxs(t.value.transactions ?? []);
      if (f.status === 'fulfilled') setFavorites(f.value.favorites ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const fromAccount = accounts.find(a => a._id === fromId);

  // Set de IDs de cuentas del usuario para determinar signo en transferencias
  const userAccountIds = new Set(accounts.map(a => a._id?.toString()));

  const handleSearchDest = async () => {
    if (!destQuery.trim() || destQuery.trim().length < 3) {
      setDestError('Ingresa al menos 3 caracteres'); return;
    }
    setSearching(true); setDestError(''); setDestAccount(null);
    try {
      const data = await apiFetch(`${NODE_URL}/accounts/search?q=${encodeURIComponent(destQuery.trim())}`, token);
      setDestAccount(data.account);
    } catch (e) {
      setDestError(e.message);
    } finally { setSearching(false); }
  };

  const useFavorite = async (fav) => {
    setDestQuery(fav.accountNumber);
    setDestError(''); setDestAccount(null);
    setSearching(true);
    try {
      const data = await apiFetch(`${NODE_URL}/accounts/search?q=${encodeURIComponent(fav.accountNumber)}`, token);
      setDestAccount(data.account);
    } catch (e) {
      setDestError('Esta cuenta favorita no se encontró o es tuya');
    } finally { setSearching(false); }
  };

  const handleRequestTransfer = (e) => {
    e.preventDefault();
    if (!fromId || !destAccount || !amount || Number(amount) <= 0) {
      toast.error('Completa todos los campos'); return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmTransfer = async () => {
    setSending(true);
    try {
      await apiFetch(`${NODE_URL}/transactions/transfer`, token, {
        method: 'POST',
        body: JSON.stringify({ fromAccountId: fromId, toAccountId: destAccount._id, amount: Number(amount) }),
      });

      toast.success('✅ Transferencia realizada correctamente');
      setConfirmOpen(false);
      setDestQuery(''); setDestAccount(null); setAmount('');
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setSending(false); }
  };

  const filtered = txs.filter(t => {
    const matchType   = filterType === 'Todos' || t.type === filterType;
    const matchSearch = !search ||
      t.originAccount?.accountNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.destinationAccount?.accountNumber?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Banca Personal</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Transferencias</h1>
          <p className="text-zinc-400 text-xs font-medium mt-0.5">Envía dinero y revisa tu historial</p>
          <div className="w-8 h-[3px] bg-[#C9A84C] rounded-full mt-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── HISTORIAL ── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-[#0A0A0A]">Historial de Transacciones</h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><SearchIcon size={14} /></span>
                <input type="text" placeholder="Buscar por número de cuenta..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-sm text-[#0A0A0A] placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {TX_TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${filterType === t ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}>
                    {t === 'Todos' ? 'Todos' : TX_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-zinc-50 rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#C9A84C]"><TxIcon size={24} /></div>
                <p className="text-zinc-400 text-sm">{search ? `Sin resultados para "${search}"` : 'Sin transacciones aún'}</p>
                {search && <button onClick={() => setSearch('')} className="text-[#A3845B] text-xs mt-1.5 hover:underline">Limpiar</button>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      {['Tipo','Origen','Destino','Monto','Fecha'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filtered.map((t, i) => {
                      const outgoing = isOutgoing(t, userAccountIds);
                      return (
                        <tr key={i} className="hover:bg-[#FAF6F0]/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TX_BADGE[t.type] ?? 'text-zinc-600 bg-zinc-50 border-zinc-200'}`}>
                              {TX_LABELS[t.type] ?? t.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-zinc-500">{t.originAccount?.accountNumber ?? '—'}</td>
                          <td className="px-5 py-3.5 font-mono text-xs text-zinc-500">{t.destinationAccount?.accountNumber ?? '—'}</td>
                          <td className={`px-5 py-3.5 font-black text-sm ${outgoing ? 'text-[#A3845B]' : 'text-emerald-600'}`}>
                            {outgoing ? '-' : '+'}{fmt(t.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-zinc-400">{fmtDate(t.date ?? t.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── PANEL DERECHO ── */}
        <div className="space-y-5">

          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] flex items-center justify-center text-[#C9A84C]">
                <TransferIcon size={16} />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[#0A0A0A]">Nueva Transferencia</h2>
                <p className="text-[10px] text-zinc-400">A cualquier cuenta del banco</p>
              </div>
            </div>

            <form onSubmit={handleRequestTransfer} className="p-5 space-y-4">

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Desde tu cuenta</label>
                <select value={fromId} onChange={e => setFromId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] text-sm font-semibold outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition appearance-none">
                  {accounts.map(a => (
                    <option key={a._id} value={a._id}>{cap(a.type)} · {a.accountNumber} · {fmt(a.balance)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Cuenta destino <span className="text-zinc-300 font-normal normal-case">(número de cuenta)</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ej. ACC123456"
                    value={destQuery} onChange={e => { setDestQuery(e.target.value); setDestAccount(null); setDestError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchDest(); } }}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-mono text-sm outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                  />
                  <button type="button" onClick={handleSearchDest} disabled={searching}
                    className="px-3 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-xs font-bold hover:bg-zinc-800 transition disabled:opacity-50 flex items-center gap-1">
                    {searching ? <SpinIcon /> : <SearchIcon size={14} />}
                  </button>
                </div>
                {destError && <p className="text-[#A3845B] text-xs mt-1">{destError}</p>}

                {destAccount && (
                  <div className="mt-2 bg-[#FAF6F0] border border-[#C9A84C]/30 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EFE6D9] flex items-center justify-center text-[#A3845B]">
                      <CardIcon size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0A0A0A]">✅ Cuenta encontrada</p>
                      <p className="font-mono text-[11px] text-zinc-500">{destAccount.accountNumber} · {cap(destAccount.type)}</p>
                    </div>
                  </div>
                )}

                {favorites.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">Favoritos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {favorites.slice(0, 5).map(fav => (
                        <button key={fav._id} type="button" onClick={() => useFavorite(fav)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${destAccount?.accountNumber === fav.accountNumber ? 'bg-[#FAF6F0] border-[#C9A84C] text-[#A3845B]' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-[#EFE6D9]'}`}>
                          ⭐ {fav.alias}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Monto (GTQ)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Q</span>
                  <input type="number" min="1" step="0.01" placeholder="0.00"
                    value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-bold placeholder-zinc-300 text-sm outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                  />
                </div>
              </div>

              {fromAccount && destAccount && amount && Number(amount) > 0 && (
                <div className="bg-[#FAF6F0] border border-[#EFE6D9] rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Saldo disponible</span>
                    <span className="font-bold text-[#0A0A0A]">{fmt(fromAccount.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Transferencia</span>
                    <span className="font-bold text-[#C9A84C]">-{fmt(Number(amount))}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#EFE6D9] pt-1.5">
                    <span className="text-zinc-500 font-semibold">Saldo estimado</span>
                    <span className={`font-black ${fromAccount.balance - Number(amount) < 0 ? 'text-[#A3845B]' : 'text-[#0A0A0A]'}`}>
                      {fmt(fromAccount.balance - Number(amount))}
                    </span>
                  </div>
                </div>
              )}

              <button type="submit"
                disabled={sending || !fromId || !destAccount || !amount || Number(amount) <= 0}
                className="w-full py-3 rounded-xl bg-[#0A0A0A] text-white font-bold text-sm hover:bg-zinc-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg">
                <TransferIcon size={15} />
                Transferir
              </button>
            </form>
          </div>
        </div>
      </div>

      <TransferConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmTransfer}
        fromAccount={fromAccount}
        toAccount={destAccount}
        amount={Number(amount)}
        loading={sending}
      />
    </div>
  );
};

// ── Iconos ───────────────────────────────────────────────────────
function TransferIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>; }
function SearchIcon({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function CardIcon({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function TxIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function SpinIcon() { return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>; }

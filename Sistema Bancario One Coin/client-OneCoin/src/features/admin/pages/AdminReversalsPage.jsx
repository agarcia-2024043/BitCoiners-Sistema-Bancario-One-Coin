// src/features/admin/pages/AdminReversalsPage.jsx
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import toast from 'react-hot-toast';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';

const fmt = (n) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);

const fmtDate = (d) =>
  new Intl.DateTimeFormat('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));

const nodeFetch = async (path, token, opts = {}) => {
  const res = await fetch(`${NODE_URL}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

// ── Colores y etiquetas por tipo ──────────────────────────────────
const TYPE_META = {
  DEPOSITO:      { label: 'Depósito',      bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: <ArrowDownIcon /> },
  RETIRO:        { label: 'Retiro',         bg: 'bg-red-50',     text: 'text-red-500',     border: 'border-red-200',     icon: <ArrowUpIcon /> },
  TRANSFERENCIA: { label: 'Transferencia',  bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    icon: <ArrowsIcon /> },
};

// ── Modal de confirmación ─────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, tx, saving }) {
  if (!open || !tx) return null;
  const meta = TYPE_META[tx.type] ?? TYPE_META.DEPOSITO;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-amber-100 bg-amber-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <UndoIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[#0A0A0A]">Revertir Transacción</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-zinc-600">¿Confirmas la reversión de esta transacción?</p>
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Tipo</span>
              <span className={`font-bold px-2 py-0.5 rounded border ${meta.bg} ${meta.text} ${meta.border}`}>
                {meta.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Monto</span>
              <span className="font-black text-[#0A0A0A]">{fmt(tx.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Fecha</span>
              <span className="font-semibold text-zinc-600">{fmtDate(tx.date)}</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Los balances de las cuentas involucradas serán revertidos automáticamente.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <SpinIcon /> : null}
            {saving ? 'Revirtiendo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────
export const AdminReversalsPage = () => {
  const token = useAuthStore((s) => s.token);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('all');
  const [filterStatus, setFilterStatus] = useState('COMPLETADA');

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await nodeFetch('/transactions', token);
      setTransactions(data.transactions ?? []);
    } catch (err) {
      toast.error('Error al cargar transacciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── Filtrado ──────────────────────────────────────────────────
  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase();
    const origin = tx.originAccount?.accountNumber ?? '';
    const dest   = tx.destinationAccount?.accountNumber ?? '';
    const matchSearch = !q ||
      origin.toLowerCase().includes(q) ||
      dest.toLowerCase().includes(q) ||
      String(tx.amount).includes(q) ||
      tx._id.toLowerCase().includes(q);
    const matchType   = filterType   === 'all' || tx.type   === filterType;
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const completadas = transactions.filter(t => t.status === 'COMPLETADA').length;
  const revertidas  = transactions.filter(t => t.status === 'REVERTIDA').length;

  // ── Revertir ──────────────────────────────────────────────────
  const handleReverse = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await nodeFetch(`/transactions/${selected._id}/reverse`, token, { method: 'POST' });
      toast.success('Transacción revertida correctamente');
      setModalOpen(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div>
        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Reversiones</h1>
        <p className="text-zinc-400 text-xs font-medium mt-0.5">Consulta y revierte transacciones del sistema</p>
        <div className="w-8 h-[3px] bg-[#C9A84C] rounded-full mt-3" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total"       value={loading ? '—' : transactions.length} icon={<ListIcon />} />
        <StatCard label="Completadas" value={loading ? '—' : completadas} icon={<CheckIcon />} accent />
        <StatCard label="Revertidas"  value={loading ? '—' : revertidas}  icon={<UndoIcon />}  warn={revertidas > 0} />
      </div>

      {/* Tabla */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Filtros */}
        <div className="px-5 py-4 border-b border-zinc-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><SearchIcon size={14} /></span>
              <input
                type="text" placeholder="Buscar por cuenta, monto o ID..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-sm text-[#0A0A0A] placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
              />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-sm text-[#0A0A0A] outline-none focus:border-[#C9A84C] transition appearance-none">
              <option value="all">Todos los tipos</option>
              <option value="DEPOSITO">Depósito</option>
              <option value="RETIRO">Retiro</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-sm text-[#0A0A0A] outline-none focus:border-[#C9A84C] transition appearance-none">
              <option value="all">Todos los estados</option>
              <option value="COMPLETADA">Completadas</option>
              <option value="REVERTIDA">Revertidas</option>
            </select>
          </div>
          <p className="text-[11px] text-zinc-400">
            {filtered.length} transacción{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#C9A84C]">
              <ListIcon size={24} />
            </div>
            <p className="text-zinc-400 text-sm">No se encontraron transacciones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  {['Tipo', 'Origen', 'Destino', 'Monto', 'Fecha', 'Estado', 'Acción'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((tx) => {
                  const meta     = TYPE_META[tx.type] ?? TYPE_META.DEPOSITO;
                  const revertida = tx.status === 'REVERTIDA';
                  return (
                    <tr key={tx._id} className={`transition-colors ${revertida ? 'opacity-50' : 'hover:bg-[#FAF6F0]/40'}`}>

                      {/* Tipo */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${meta.bg} ${meta.text} ${meta.border}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>

                      {/* Origen */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-zinc-500">
                          {tx.originAccount?.accountNumber ?? '—'}
                        </span>
                      </td>

                      {/* Destino */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-zinc-500">
                          {tx.destinationAccount?.accountNumber ?? '—'}
                        </span>
                      </td>

                      {/* Monto */}
                      <td className="px-5 py-4">
                        <span className="font-black text-xs text-[#0A0A0A]">{fmt(tx.amount)}</span>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-zinc-500 whitespace-nowrap">{fmtDate(tx.date)}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        {revertida ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border bg-zinc-50 text-zinc-400 border-zinc-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            Revertida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-600 border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Completada
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="px-5 py-4">
                        {revertida ? (
                          <span className="text-[11px] text-zinc-300 font-semibold">—</span>
                        ) : (
                          <button
                            onClick={() => { setSelected(tx); setModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition whitespace-nowrap"
                          >
                            <UndoIcon size={11} />
                            Revertir
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        onConfirm={handleReverse}
        tx={selected}
        saving={saving}
      />
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent, warn }) {
  return (
    <div className={`rounded-2xl p-5 border flex items-center gap-4 ${
      accent ? 'bg-[#0A0A0A] border-zinc-800' : warn ? 'bg-white border-amber-200' : 'bg-white border-zinc-100'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        accent ? 'bg-zinc-900 text-[#C9A84C]' : warn ? 'bg-amber-50 text-amber-500' : 'bg-[#FAF6F0] text-[#A3845B]'
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</p>
        <p className={`text-xl font-black mt-0.5 ${accent ? 'text-white' : warn ? 'text-amber-600' : 'text-[#0A0A0A]'}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Iconos ────────────────────────────────────────────────────────
function UndoIcon({ size = 18 })    { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>; }
function ListIcon({ size = 18 })    { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function CheckIcon({ size = 18 })   { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function SearchIcon({ size = 16 })  { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function ArrowDownIcon()            { return <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>; }
function ArrowUpIcon()              { return <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>; }
function ArrowsIcon()               { return <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>; }
function SpinIcon()                 { return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>; }
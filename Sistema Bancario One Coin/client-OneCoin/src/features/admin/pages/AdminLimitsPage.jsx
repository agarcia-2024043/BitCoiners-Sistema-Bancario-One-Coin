// src/features/admin/pages/AdminLimiteUsers.jsx
// FIX 1: Usa axiosAuth/axiosAdmin (con baseURL correcta) en lugar de fetch manual
//         que duplicaba "/api/api/..." porque VITE_AUTH_URL ya es "/api"
// FIX 2: apiFetch ahora maneja respuestas vacías (204 / cuerpo vacío) sin romper con
//         "Unexpected end of JSON input"

import { useCallback, useEffect, useState } from 'react';
import { axiosAuth } from '../../../shared/apis/api.js';
import toast from 'react-hot-toast';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';

const fmt = (n) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);

// ── Helper fetch seguro para Node ────────────────────────────────
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

// ── Modal crear / editar límites ─────────────────────────────────
function LimitModal({ open, onClose, onSave, account, existingLimit, saving }) {
  const [daily, setDaily] = useState('');
  const [perTx, setPerTx] = useState('');

  useEffect(() => {
    if (open) {
      setDaily(existingLimit ? String(existingLimit.dailyLimit) : '');
      setPerTx(existingLimit ? String(existingLimit.perTransactionLimit) : '');
    }
  }, [open, existingLimit]);

  if (!open || !account) return null;

  const isEdit = Boolean(existingLimit);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!daily || !perTx || Number(daily) <= 0 || Number(perTx) <= 0) {
      toast.error('Ingresa valores válidos mayores a 0');
      return;
    }
    onSave({ dailyLimit: Number(daily), perTransactionLimit: Number(perTx) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-100 overflow-hidden">

        <div className="px-6 py-5 border-b border-[#EFE6D9] bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFE6D9] text-[#A3845B] flex items-center justify-center">
              <LimitIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#0A0A0A] text-base">
                {isEdit ? 'Editar Límites' : 'Crear Límites'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{account.accountNumber}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Límite Diario (GTQ)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Q</span>
              <input
                type="number" min="1" step="0.01" placeholder="0.00"
                value={daily} onChange={(e) => setDaily(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-bold text-sm outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Monto máximo acumulado en un día</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Límite por Transacción (GTQ)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Q</span>
              <input
                type="number" min="1" step="0.01" placeholder="0.00"
                value={perTx} onChange={(e) => setPerTx(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-bold text-sm outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Monto máximo por operación individual</p>
          </div>

          {daily && perTx && Number(daily) > 0 && Number(perTx) > 0 && (
            <div className="bg-[#FAF6F0] border border-[#EFE6D9] rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Límite diario</span>
                <span className="font-bold text-[#A3845B]">{fmt(Number(daily))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Límite por transacción</span>
                <span className="font-bold text-[#A3845B]">{fmt(Number(perTx))}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose} disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-bold hover:bg-zinc-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <SpinIcon /> : null}
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal confirmar eliminar ─────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, account, saving }) {
  if (!open || !account) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-100 bg-red-50">
          <h3 className="font-bold text-[#0A0A0A]">Eliminar Límites</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Esta acción no se puede deshacer</p>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-600">
            ¿Eliminar los límites de la cuenta{' '}
            <span className="font-mono font-bold text-[#0A0A0A]">{account.accountNumber}</span>?
            La cuenta operará sin restricciones.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <SpinIcon /> : null}
            {saving ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────
export const AdminLimitsPage = () => {
  // FIX: obtenemos el token desde el store via axiosAuth interceptor;
  // pero para nodeFetch (fetch nativo a otro puerto) lo sacamos directo.
  const [token, setToken] = useState('');
  useEffect(() => {
    // Importación dinámica para no crear dependencia circular en el módulo
    import('../../auth/store/authStore.js').then(({ useAuthStore }) => {
      setToken(useAuthStore.getState().token || '');
    });
  }, []);

  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // FIX 1: usa axiosAuth — baseURL ya es "/api", ruta correcta: /management/users
      // Resultado: GET /api/management/users  ✓  (antes era /api/api/management/users ✗)
      const authRes = await axiosAuth.get('/management/users');
      const userList = authRes.data?.users ?? authRes.data ?? [];
      setUsers(userList);

      // 2. Todas las cuentas desde Node (puerto distinto → nodeFetch)
      const nodeData = await nodeFetch('/accounts', token);
      const allAccounts = nodeData.accounts ?? [];

      // 3. Límite por cuenta (fallo silencioso)
      const enriched = await Promise.all(
        allAccounts.map(async (acc) => {
          try {
            const ld = await nodeFetch(`/limits/${acc._id}`, token);
            return { ...acc, limit: ld.limit ?? null };
          } catch {
            return { ...acc, limit: null };
          }
        })
      );

      setAccounts(enriched);
    } catch (err) {
      toast.error('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── Nombre de usuario ──────────────────────────────────────────
  const getUserName = (userId) => {
    const u = users.find((u) => u.id === userId || u.userId === userId || u.sub === userId);
    if (!u) return null;
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    return u.username ?? u.email ?? null;
  };

  // ── Filtrado ───────────────────────────────────────────────────
  const filtered = accounts.filter((acc) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      acc.accountNumber?.toLowerCase().includes(q) ||
      acc.type?.toLowerCase().includes(q) ||
      getUserName(acc.userId)?.toLowerCase().includes(q);
    const matchUser = filterUser === 'all' || acc.userId === filterUser;
    return matchSearch && matchUser;
  });

  const withLimits = accounts.filter((a) => a.limit).length;
  const withoutLimits = accounts.length - withLimits;

  // ── Acciones ───────────────────────────────────────────────────
  const openCreate = (acc) => { setSelected({ account: acc, limit: null }); setModalOpen(true); };
  const openEdit   = (acc) => { setSelected({ account: acc, limit: acc.limit }); setModalOpen(true); };
  const openDelete = (acc) => { setSelected({ account: acc, limit: acc.limit }); setDeleteOpen(true); };

  const handleSave = async ({ dailyLimit, perTransactionLimit }) => {
    if (!selected) return;
    setSaving(true);
    try {
      const isEdit = Boolean(selected.limit);
      if (isEdit) {
        await nodeFetch(`/limits/${selected.account._id}`, token, {
          method: 'PUT',
          body: JSON.stringify({ dailyLimit, perTransactionLimit }),
        });
        toast.success('Límites actualizados correctamente');
      } else {
        await nodeFetch('/limits', token, {
          method: 'POST',
          body: JSON.stringify({ accountId: selected.account._id, dailyLimit, perTransactionLimit }),
        });
        toast.success('Límites creados correctamente');
      }
      setModalOpen(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await nodeFetch(`/limits/${selected.account._id}`, token, { method: 'DELETE' });
      toast.success('Límites eliminados correctamente');
      setDeleteOpen(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Usuarios únicos para el filtro ────────────────────────────
  const uniqueUsers = [
    ...new Map(
      accounts.map((a) => [a.userId, { id: a.userId, name: getUserName(a.userId) }])
    ).values(),
  ].filter((u) => u.id);

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div>
        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Límites de Cuentas</h1>
        <p className="text-zinc-400 text-xs font-medium mt-0.5">Configura límites diarios y por transacción para cada cuenta</p>
        <div className="w-8 h-[3px] bg-[#C9A84C] rounded-full mt-3" />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Cuentas" value={loading ? '—' : accounts.length} icon={<CardIcon />} />
        <StatCard label="Con Límites"   value={loading ? '—' : withLimits}      icon={<LimitIcon />} accent />
        <StatCard label="Sin Límites"   value={loading ? '—' : withoutLimits}   icon={<WarnIcon />}  warn={withoutLimits > 0} />
      </div>

      {/* Tabla */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Filtros */}
        <div className="px-5 py-4 border-b border-zinc-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><SearchIcon size={14} /></span>
              <input
                type="text" placeholder="Buscar por cuenta, tipo o usuario..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-sm text-[#0A0A0A] placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
              />
            </div>
            <select
              value={filterUser} onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-sm text-[#0A0A0A] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition appearance-none"
            >
              <option value="all">Todos los usuarios</option>
              {uniqueUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name ?? u.id}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-zinc-400">
            {filtered.length} cuenta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#C9A84C]">
              <LimitIcon size={24} />
            </div>
            <p className="text-zinc-400 text-sm">No se encontraron cuentas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  {['Cuenta', 'Usuario', 'Tipo', 'Límite Diario', 'Límite x Transacción', 'Uso Hoy', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((acc) => {
                  const hasLimit = Boolean(acc.limit);
                  const userName = getUserName(acc.userId);
                  const dailyPct = hasLimit && acc.limit.dailyLimit > 0
                    ? Math.min(100, (acc.limit.dailyUsed / acc.limit.dailyLimit) * 100)
                    : 0;

                  return (
                    <tr key={acc._id} className="hover:bg-[#FAF6F0]/40 transition-colors">

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-[#0A0A0A]">{acc.accountNumber}</span>
                      </td>

                      <td className="px-5 py-4">
                        {userName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#FAF6F0] border border-[#EFE6D9] text-[#A3845B] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                              {userName[0].toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-[#0A0A0A] whitespace-nowrap">{userName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-mono">{acc.userId?.slice(0, 8)}…</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9] capitalize">
                          {acc.type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {hasLimit
                          ? <span className="font-bold text-xs text-[#0A0A0A]">{fmt(acc.limit.dailyLimit)}</span>
                          : <span className="text-zinc-300 text-xs">—</span>}
                      </td>

                      <td className="px-5 py-4">
                        {hasLimit
                          ? <span className="font-bold text-xs text-[#0A0A0A]">{fmt(acc.limit.perTransactionLimit)}</span>
                          : <span className="text-zinc-300 text-xs">—</span>}
                      </td>

                      <td className="px-5 py-4 min-w-[120px]">
                        {hasLimit ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-500">{fmt(acc.limit.dailyUsed)}</span>
                              <span className={`font-bold ${dailyPct >= 90 ? 'text-red-500' : dailyPct >= 70 ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {dailyPct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${dailyPct >= 90 ? 'bg-red-400' : dailyPct >= 70 ? 'bg-amber-400' : 'bg-[#C9A84C]'}`}
                                style={{ width: `${dailyPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {hasLimit ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-600 border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Configurado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border bg-zinc-50 text-zinc-400 border-zinc-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            Sin límites
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {hasLimit ? (
                            <>
                              <button
                                onClick={() => openEdit(acc)}
                                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] text-[#A3845B] border border-[#EFE6D9] hover:bg-[#EFE6D9] transition whitespace-nowrap"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => openDelete(acc)}
                                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition"
                              >
                                Quitar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openCreate(acc)}
                              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] text-white hover:bg-zinc-800 transition whitespace-nowrap flex items-center gap-1"
                            >
                              <PlusIcon size={11} />
                              Asignar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <LimitModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        onSave={handleSave}
        account={selected?.account}
        existingLimit={selected?.limit}
        saving={saving}
      />
      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        account={selected?.account}
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
function LimitIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function CardIcon({ size = 18 })  { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function WarnIcon({ size = 18 })  { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function SearchIcon({ size = 16 }){ return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function PlusIcon({ size = 14 })  { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SpinIcon()               { return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>; }
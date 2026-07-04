// src/features/client/page/FavoritesPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import toast from 'react-hot-toast';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';

const apiFetch = async (url, token, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

// ── Modal Agregar/Editar ─────────────────────────────────────────
function FavoriteModal({ open, onClose, onSave, editData, loading }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [alias, setAlias]                 = useState('');
  const [errors, setErrors]               = useState({});
  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      setAccountNumber(editData?.accountNumber ?? '');
      setAlias(editData?.alias ?? '');
      setErrors({});
    }
  }, [open, editData]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!isEdit && !accountNumber.trim()) e.accountNumber = 'El número de cuenta es obligatorio';
    if (!alias.trim()) e.alias = 'El alias es obligatorio';
    if (alias.trim().length < 2) e.alias = 'El alias debe tener al menos 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ accountNumber: accountNumber.trim(), alias: alias.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-100 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A3845B]/10 border border-[#EFE6D9] flex items-center justify-center text-[#A3845B]">
              <StarIcon size={20} filled />
            </div>
            <div>
              <h3 className="font-bold text-[#0A0A0A] text-base">
                {isEdit ? 'Editar Favorito' : 'Agregar Favorito'}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {isEdit ? 'Actualiza el alias de esta cuenta' : 'Agrega una cuenta de confianza'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Número de cuenta
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <CardIcon size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Ej. ACC123456"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.toUpperCase())}
                  maxLength={20}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-mono text-sm placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
                />
              </div>
              {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
            </div>
          )}

          {isEdit && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Cuenta</p>
              <p className="font-mono font-bold text-[#0A0A0A] mt-0.5">{editData.accountNumber}</p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Alias (nombre personal)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                <TagIcon size={15} />
              </span>
              <input
                type="text"
                placeholder="Ej. Cuenta de mi hermano"
                value={alias}
                onChange={e => setAlias(e.target.value)}
                maxLength={40}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] text-sm placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
              />
            </div>
            {errors.alias && <p className="text-red-500 text-xs mt-1">{errors.alias}</p>}
            <p className="text-[10px] text-zinc-400 mt-1">{alias.length}/40 caracteres</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <SpinIcon /> : null}
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Eliminar ───────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, favorite, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
              <TrashIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#0A0A0A] text-base">Eliminar Favorito</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-600 mb-4">¿Estás seguro de que deseas eliminar este favorito?</p>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Alias</span>
              <span className="font-bold text-[#0A0A0A]">{favorite?.alias}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Cuenta</span>
              <span className="font-bold font-mono text-zinc-700">{favorite?.accountNumber}</span>
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
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <SpinIcon /> : <TrashIcon size={15} />}
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────
export const FavoritesPage = () => {
  const token = useAuthStore((s) => s.token);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  // Modales
  const [addOpen, setAddOpen]     = useState(false);
  const [editData, setEditData]   = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${NODE_URL}/favorites`, token);
      setFavorites(data.favorites ?? []);
    } catch (e) {
      toast.error('No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async ({ accountNumber, alias }) => {
    setSaving(true);
    try {
      await apiFetch(`${NODE_URL}/favorites`, token, {
        method: 'POST',
        body: JSON.stringify({ accountNumber, alias }),
      });
      toast.success('Favorito agregado');
      setAddOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async ({ alias }) => {
    if (!editData) return;
    setSaving(true);
    try {
      await apiFetch(`${NODE_URL}/favorites/${editData._id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ alias }),
      });
      toast.success('Favorito actualizado');
      setEditData(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    setSaving(true);
    try {
      await apiFetch(`${NODE_URL}/favorites/${deleteData._id}`, token, { method: 'DELETE' });
      toast.success('Favorito eliminado');
      setDeleteData(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = favorites.filter(f =>
    !search || f.alias.toLowerCase().includes(search.toLowerCase()) || f.accountNumber.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = d => new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Mis Contactos</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Cuentas Favoritas</h1>
          <p className="text-zinc-400 text-xs font-medium mt-0.5">Administra tus cuentas de confianza</p>
          <div className="w-8 h-[3px] bg-[#C9A84C] rounded-full mt-3" />
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition active:scale-[0.97] shadow-lg"
        >
          <PlusIcon size={16} />
          Agregar Favorito
        </button>
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<StarIcon size={18} filled />}
          label="Total Favoritos"
          value={loading ? '—' : favorites.length.toString()}
          sub="Cuentas guardadas"
          accent
        />
        <StatCard
          icon={<SearchIcon size={18} />}
          label="Búsqueda activa"
          value={search ? filtered.length.toString() : '—'}
          sub={search ? `Resultados para "${search}"` : 'Sin filtro aplicado'}
        />
        <StatCard
          icon={<ShieldIcon size={18} />}
          label="Cuentas verificadas"
          value={loading ? '—' : favorites.length.toString()}
          sub="Todas verificadas"
        />
      </div>

      {/* Buscador + lista */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100">
          <div>
            <h2 className="font-bold text-sm text-[#0A0A0A]">Lista de Favoritos</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">{favorites.length} cuenta{favorites.length !== 1 ? 's' : ''} guardada{favorites.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><SearchIcon size={14} /></span>
            <input
              type="text"
              placeholder="Buscar por alias o número..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#fafafa] border border-zinc-200 text-sm text-[#0A0A0A] placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition"
            />
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#C9A84C]">
              <StarIcon size={28} />
            </div>
            <p className="text-zinc-600 font-semibold mb-1">No tienes favoritos aún</p>
            <p className="text-zinc-400 text-sm mb-4">Agrega las cuentas que usas con más frecuencia</p>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition"
            >
              <PlusIcon size={15} />
              Agregar primer favorito
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center px-6">
            <p className="text-zinc-500 text-sm">Sin resultados para <strong>"{search}"</strong></p>
            <button onClick={() => setSearch('')} className="text-[#A3845B] text-xs mt-2 hover:underline">Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {filtered.map((fav, i) => (
              <div key={fav._id ?? i} className="flex items-center justify-between px-5 py-4 hover:bg-[#FAF6F0]/40 transition-colors group">
                <div className="flex items-center gap-4">
                  {/* Avatar con inicial */}
                  <div className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#EFE6D9] flex items-center justify-center text-[#A3845B] font-black text-base flex-shrink-0">
                    {fav.alias[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#0A0A0A]">{fav.alias}</p>
                      <span className="text-[9px] font-bold text-[#C9A84C] bg-[#FAF6F0] border border-[#EFE6D9] px-1.5 py-0.5 rounded uppercase hidden sm:inline">Favorito</span>
                    </div>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">{fav.accountNumber}</p>
                    {fav.createdAt && (
                      <p className="text-[10px] text-zinc-300 mt-0.5">Agregado {fmtDate(fav.createdAt)}</p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditData(fav)}
                    className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-400 hover:text-[#A3845B] hover:border-[#EFE6D9] hover:bg-[#FAF6F0] transition flex items-center justify-center"
                    title="Editar alias"
                  >
                    <EditIcon size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteData(fav)}
                    className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition flex items-center justify-center"
                    title="Eliminar"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <p className="text-[11px] text-zinc-400">{filtered.length} de {favorites.length} favorito{favorites.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setAddOpen(true)}
              className="text-[11px] font-bold text-[#A3845B] hover:underline flex items-center gap-1"
            >
              <PlusIcon size={12} />
              Agregar más
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      <FavoriteModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        editData={null}
        loading={saving}
      />
      <FavoriteModal
        open={!!editData}
        onClose={() => setEditData(null)}
        onSave={handleEdit}
        editData={editData}
        loading={saving}
      />
      <DeleteModal
        open={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={handleDelete}
        favorite={deleteData}
        loading={saving}
      />
    </div>
  );
};

// ── Componente StatCard ─────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  if (accent) {
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

// ── Iconos ──────────────────────────────────────────────────────
function StarIcon({ size = 18, filled = false }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function PlusIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function EditIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function TrashIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function SearchIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function CardIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function TagIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function ShieldIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function SpinIcon() {
  return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
}

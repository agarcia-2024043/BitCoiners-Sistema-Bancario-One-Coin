import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { getAllUsers, register, toggleUserActive } from '../../../shared/apis/auth.js';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const getRole = (user) => {
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles[0];
  return user.role ?? 'Cliente';
};

const getInitial = (user) => (user.username ?? user.email ?? '?').trim().charAt(0).toUpperCase();

const isAdminRole = (role) => ['Admin', 'adminBanco'].includes(role);

export const AdminUsersPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.users ?? []);
    } catch (error) {
      setUsers([]);
      setMessage({ type: 'error', text: error?.response?.data?.message ?? 'No se pudo cargar la lista de usuarios.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setForm({ username: '', email: '', password: '' });
      setMessage({ type: 'success', text: 'Usuario creado correctamente.' });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message ?? 'No se pudo crear el usuario.',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleUser = async (user) => {
    setActionLoadingId(user.id);
    setMessage(null);

    try {
      await toggleUserActive(user.id);
      setMessage({
        type: 'success',
        text: user.isActive !== false ? 'Usuario deshabilitado.' : 'Usuario habilitado.',
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message ?? 'No se pudo cambiar el estado del usuario.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentUserEmail = currentUser?.email ?? '';

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Usuarios</h1>
          <p className="text-zinc-400 text-xs font-medium mt-0.5">Crea usuarios, revisa los existentes y desactiva cuentas cuando sea necesario.</p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center gap-2 self-start md:self-auto text-[11px] font-bold text-white bg-[#0A0A0A] hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Recargar
        </button>
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mt-0.5" /> : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={<UserGroupIcon className="h-5 w-5" />} label="Usuarios totales" value={loading ? '—' : stats.total.toLocaleString()} />
        <MetricCard icon={<ShieldCheckIcon className="h-5 w-5" />} label="Usuarios activos" value={loading ? '—' : stats.active.toLocaleString()} />
        <MetricCard icon={<NoSymbolIcon className="h-5 w-5" />} label="Usuarios inactivos" value={loading ? '—' : stats.inactive.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-1 bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="font-bold text-sm text-[#0A0A0A]">Crear usuario</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">El registro usa la misma paleta del dashboard y crea cuentas con acceso estándar.</p>
          </div>

          <form onSubmit={handleCreateUser} className="p-5 space-y-4">
            <Field label="Nombre de usuario" name="username" value={form.username} onChange={handleChange} placeholder="juan.perez" />
            <Field label="Correo electrónico" name="email" value={form.email} onChange={handleChange} placeholder="usuario@correo.com" type="email" />
            <Field label="Contraseña" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" type="password" />

            <div className="rounded-xl border border-[#EFE6D9] bg-[#FAF6F0] px-4 py-3 text-[11px] text-zinc-500">
              La creación usa el endpoint de registro existente y deja la cuenta como usuario estándar.
            </div>

            <button
              type="submit"
              disabled={creating || !form.username || !form.email || !form.password}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-3 text-sm font-bold text-[#C5A880] transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusIcon className="h-4 w-4" />
              {creating ? 'Creando...' : 'Crear usuario'}
            </button>
          </form>
        </section>

        <section className="xl:col-span-2 bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-zinc-100">
            <div>
              <h2 className="font-bold text-sm text-[#0A0A0A]">Usuarios registrados</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">{loading ? 'Cargando...' : `${stats.total} usuario${stats.total !== 1 ? 's' : ''} en el sistema`}</p>
            </div>
            <div className="text-[11px] font-semibold text-zinc-500">
              {currentUserEmail ? <span>Sesión: {currentUserEmail}</span> : <span>Sesión sin correo visible</span>}
            </div>
          </div>

          {loading ? (
            <div className="py-14 text-center text-zinc-400 text-sm">Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div className="py-14 text-center text-zinc-400 text-sm">Todavía no hay usuarios creados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50/80">
                    {['Usuario', 'Correo', 'Rol', 'Estado', 'Acción'].map((header) => (
                      <th key={header} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const role = getRole(user);
                    const admin = isAdminRole(role);
                    const active = user.isActive !== false;
                    const isCurrentUser = user.email?.toLowerCase() === currentUserEmail.toLowerCase();

                    return (
                      <tr key={user.id} className="border-b border-zinc-50 hover:bg-[#FAF6F0]/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${admin ? 'bg-[#0A0A0A] text-[#C5A880]' : 'bg-[#FAF6F0] text-[#A3845B] border border-[#EFE6D9]'}`}>
                              {getInitial(user)}
                            </div>
                            <div>
                              <div className="font-semibold text-[#0A0A0A] text-xs">{user.username || '—'}</div>
                              <div className="text-[11px] text-zinc-400">{active ? 'Cuenta activa' : 'Cuenta inactiva'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-400 text-xs">{user.email || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold ${admin ? 'bg-[#0A0A0A] text-[#C5A880] border-zinc-800' : 'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]'}`}>
                            {role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${active ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-red-50 text-red-500 border-red-200/60'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                            {active ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleUser(user)}
                            disabled={actionLoadingId === user.id || isCurrentUser}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold text-zinc-600 transition-colors hover:bg-[#FAF6F0] hover:border-[#EFE6D9] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingId === user.id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : active ? (
                              <NoSymbolIcon className="h-4 w-4 text-[#A3845B]" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            )}
                            {isCurrentUser ? 'Tu usuario' : active ? 'Deshabilitar' : 'Habilitar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function MetricCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-[#0A0A0A]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#C5A880]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[#0A0A0A] outline-none transition-colors placeholder:text-zinc-300 focus:border-[#C5A880] focus:ring-2 focus:ring-[#FAF6F0]"
      />
    </label>
  );
}
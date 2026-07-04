import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { getAllUsers, register, toggleUserActive, updateUser, deleteUser } from '../../../shared/apis/auth.js';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, NoSymbolIcon, PencilSquareIcon, PlusIcon, ShieldCheckIcon, TrashIcon, UserGroupIcon, XMarkIcon, } from '@heroicons/react/24/outline';

const getRole = (user) => {
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles[0];
  return user.role ?? 'Cliente';
};

const getInitial = (user) => (user.username ?? user.email ?? '?').trim().charAt(0).toUpperCase();
const isAdminRole = (role) => ['Admin', 'adminBanco'].includes(role);

const EMPTY_CREATE = {
  username: '', email: '', password: '',
  fullName: '', dpi: '', address: '',
  phoneNumber: '', jobName: '', monthlyIncome: '',
};

const EMPTY_EDIT = {
  fullName: '', address: '', phoneNumber: '', jobName: '', monthlyIncome: '',
};

export const AdminUsersPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [creating, setCreating]         = useState(false);
  const [message, setMessage]           = useState(null);

  const [form, setForm] = useState(EMPTY_CREATE);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_EDIT);
  const [saving, setSaving]         = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

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

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const stats = useMemo(() => {
    const total    = users.length;
    const active   = users.filter((u) => u.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      await register({
        username:      form.username.trim(),
        email:         form.email.trim(),
        password:      form.password,
        fullName:      form.fullName.trim(),
        dpi:           form.dpi.trim(),
        address:       form.address.trim(),
        phoneNumber:   form.phoneNumber.trim(),
        jobName:       form.jobName.trim(),
        monthlyIncome: Number(form.monthlyIncome),
      });
      setForm(EMPTY_CREATE);
      setMessage({ type: 'success', text: 'Cliente creado correctamente.' });
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message ?? 'No se pudo crear el usuario.' });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleUser = async (user) => {
    setActionLoadingId(user.id);
    setMessage(null);
    try {
      await toggleUserActive(user.id);
      setMessage({ type: 'success', text: user.isActive !== false ? 'Usuario deshabilitado.' : 'Usuario habilitado.' });
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message ?? 'No se pudo cambiar el estado.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setEditForm({
      fullName:      user.fullName      ?? '',
      address:       user.address       ?? '',
      phoneNumber:   user.phoneNumber   ?? '',
      jobName:       user.jobName       ?? '',
      monthlyIncome: user.monthlyIncome ?? '',
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateUser(editTarget.id, {
        fullName:      editForm.fullName.trim()      || undefined,
        address:       editForm.address.trim()       || undefined,
        phoneNumber:   editForm.phoneNumber.trim()   || undefined,
        jobName:       editForm.jobName.trim()       || undefined,
        monthlyIncome: editForm.monthlyIncome !== '' ? Number(editForm.monthlyIncome) : undefined,
      });
      setMessage({ type: 'success', text: 'Usuario actualizado correctamente.' });
      setEditTarget(null);
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message ?? 'No se pudo actualizar el usuario.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      await deleteUser(deleteTarget.id);
      setMessage({ type: 'success', text: 'Usuario eliminado correctamente.' });
      setDeleteTarget(null);
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message ?? 'No se pudo eliminar el usuario.' });
    } finally {
      setDeleting(false);
    }
  };

  const currentUserEmail = currentUser?.email ?? '';

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Usuarios</h1>
          <p className="text-zinc-400 text-xs font-medium mt-0.5">Crea, edita y administra los clientes del banco.</p>
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
        <div className={`rounded-2xl border px-4 py-3 text-sm flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {message.type === 'success'
            ? <CheckCircleIcon className="h-5 w-5 mt-0.5" />
            : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={<UserGroupIcon className="h-5 w-5" />} label="Total usuarios"   value={loading ? '—' : stats.total} />
        <MetricCard icon={<ShieldCheckIcon className="h-5 w-5" />} label="Activos"         value={loading ? '—' : stats.active} />
        <MetricCard icon={<NoSymbolIcon className="h-5 w-5" />}   label="Inactivos"       value={loading ? '—' : stats.inactive} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-1 bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="font-bold text-sm text-[#0A0A0A]">Crear cliente</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Completa todos los campos. Ingresos mínimos: Q100.</p>
          </div>

          <form onSubmit={handleCreateUser} className="p-5 space-y-3">
            <Field label="Nombre completo *"    name="fullName"      value={form.fullName}      onChange={handleChange} placeholder="Juan Pérez" />
            <Field label="Nombre de usuario *"  name="username"      value={form.username}      onChange={handleChange} placeholder="juan.perez" />
            <Field label="Correo *"             name="email"         value={form.email}         onChange={handleChange} placeholder="juan@correo.com" type="email" />
            <Field label="Contraseña *"         name="password"      value={form.password}      onChange={handleChange} placeholder="Min. 8 chars, mayúscula, número, símbolo" type="password" />
            <Field label="DPI *"               name="dpi"           value={form.dpi}           onChange={handleChange} placeholder="1234567890123" />
            <Field label="Dirección *"          name="address"       value={form.address}       onChange={handleChange} placeholder="Zona 1, Ciudad de Guatemala" />
            <Field label="Celular *"            name="phoneNumber"   value={form.phoneNumber}   onChange={handleChange} placeholder="5555-1234" />
            <Field label="Nombre de trabajo *"  name="jobName"       value={form.jobName}       onChange={handleChange} placeholder="Empresa ABC" />
            <Field label="Ingresos mensuales (Q) *" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} placeholder="Mínimo Q100" type="number" />

            <button
              type="submit"
              disabled={creating || !form.username || !form.email || !form.password || !form.fullName || !form.dpi}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-3 text-sm font-bold text-[#C5A880] transition-colors hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              {creating ? 'Creando...' : 'Crear cliente'}
            </button>
          </form>
        </section>

        <section className="xl:col-span-2 bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-zinc-100">
            <div>
              <h2 className="font-bold text-sm text-[#0A0A0A]">Clientes registrados</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">{loading ? 'Cargando...' : `${stats.total} usuario${stats.total !== 1 ? 's' : ''}`}</p>
            </div>
          </div>

          {loading ? (
            <div className="py-14 text-center text-zinc-400 text-sm">Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div className="py-14 text-center text-zinc-400 text-sm">No hay usuarios registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50/80">
                    {['Cliente', 'Correo', 'DPI', 'Ingresos', 'Rol', 'Estado', 'Acciones'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const role    = getRole(user);
                    const admin   = isAdminRole(role);
                    const active  = user.isActive !== false;
                    const isMe    = user.email?.toLowerCase() === currentUserEmail.toLowerCase();

                    return (
                      <tr key={user.id} className="border-b border-zinc-50 hover:bg-[#FAF6F0]/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${admin ? 'bg-[#0A0A0A] text-[#C5A880]' : 'bg-[#FAF6F0] text-[#A3845B] border border-[#EFE6D9]'}`}>
                              {getInitial(user)}
                            </div>
                            <div>
                              <div className="font-semibold text-[#0A0A0A] text-xs">{user.fullName || user.username || '—'}</div>
                              <div className="text-[11px] text-zinc-400">{user.username || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{user.email || '—'}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{user.dpi || '—'}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">
                          {user.monthlyIncome != null ? `Q${Number(user.monthlyIncome).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-bold ${admin ? 'bg-[#0A0A0A] text-[#C5A880] border-zinc-800' : 'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]'}`}>
                            {role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${active ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-red-50 text-red-500 border-red-200/60'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                            {active ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleUser(user)}
                              disabled={actionLoadingId === user.id || isMe}
                              title={active ? 'Deshabilitar' : 'Habilitar'}
                              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-[#FAF6F0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {actionLoadingId === user.id
                                ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                : active
                                  ? <NoSymbolIcon className="h-3.5 w-3.5 text-amber-500" />
                                  : <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />}
                            </button>
                            {!admin && (
                              <button
                                type="button"
                                onClick={() => openEdit(user)}
                                title="Editar"
                                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-[#FAF6F0] transition-colors"
                              >
                                <PencilSquareIcon className="h-3.5 w-3.5 text-blue-500" />
                              </button>
                            )}
                            {!admin && !isMe && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(user)}
                                title="Eliminar"
                                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-red-50 transition-colors"
                              >
                                <TrashIcon className="h-3.5 w-3.5 text-red-400" />
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
        </section>
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-[#0A0A0A]">Editar cliente — {editTarget.fullName || editTarget.username}</h3>
              <button onClick={() => setEditTarget(null)} className="text-zinc-400 hover:text-zinc-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[11px] text-zinc-400 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                El DPI y la contraseña no pueden modificarse desde aquí.
              </p>
              <Field label="Nombre completo"   name="fullName"      value={editForm.fullName}      onChange={handleEditChange} placeholder="Juan Pérez" />
              <Field label="Dirección"          name="address"       value={editForm.address}       onChange={handleEditChange} placeholder="Zona 1, Ciudad de Guatemala" />
              <Field label="Celular"            name="phoneNumber"   value={editForm.phoneNumber}   onChange={handleEditChange} placeholder="5555-1234" />
              <Field label="Nombre de trabajo"  name="jobName"       value={editForm.jobName}       onChange={handleEditChange} placeholder="Empresa ABC" />
              <Field label="Ingresos mensuales (Q)" name="monthlyIncome" value={editForm.monthlyIncome} onChange={handleEditChange} placeholder="Mínimo Q100" type="number" />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#0A0A0A] px-4 py-2.5 text-sm font-bold text-[#C5A880] hover:bg-zinc-800 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <TrashIcon className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-black text-[#0A0A0A]">¿Eliminar cliente?</h3>
              <p className="text-sm text-zinc-400">
                Estás a punto de eliminar a <strong>{deleteTarget.fullName || deleteTarget.username}</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
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
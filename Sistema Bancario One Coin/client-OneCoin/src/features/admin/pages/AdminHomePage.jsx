import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { getAllUsers, getAccountsByMovements } from '../../../shared/apis/auth.js';

const fmt = (n) => `Q${Number(n ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;

export const AdminHomePage = () => {
  const token    = useAuthStore((s) => s.token);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [accounts, setAccounts]         = useState([]);
  const [accsLoading, setAccsLoading]   = useState(true);
  const [accsOrder, setAccsOrder]       = useState('desc');

  const displayName = user?.firstName ?? user?.email?.split('@')[0] ?? 'Admin';

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.users ?? []);
    } catch {
      setUsers([]);
    } finally { setUsersLoading(false); }
  }, []);

  const loadAccounts = useCallback(async (order) => {
    setAccsLoading(true);
    try {
      const data = await getAccountsByMovements(order);
      setAccounts(data.accounts ?? []);
    } catch {
      setAccounts([]);
    } finally { setAccsLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadAccounts(accsOrder); }, [loadAccounts, accsOrder]);

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 5);

  const totalUsers  = users.length;
  const activeUsers = users.filter((u) => u.isActive !== false).length;

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">
          Bienvenido, {displayName}
        </h1>
        <p className="text-zinc-400 text-xs font-medium mt-0.5">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={<UserIcon />}  label="Usuarios Registrados" value={usersLoading ? '—' : totalUsers.toLocaleString()} trend="+ 12.5%" />
        <StatCard icon={<CheckIcon />} label="Usuarios Activos"     value={usersLoading ? '—' : activeUsers.toLocaleString()} trend="+ 8.2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="font-bold text-sm text-[#0A0A0A]">Actividad Reciente</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Últimos usuarios creados</p>
              </div>
              <button onClick={() => navigate('/admin/usuarios')} className="text-[11px] font-bold text-zinc-500 bg-zinc-50 hover:bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200/60 transition-colors">
                Ver todas
              </button>
            </div>
            {usersLoading ? (
              <div className="py-12 text-center text-zinc-400 text-sm">Cargando...</div>
            ) : recentUsers.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm">Sin actividad reciente</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {recentUsers.map((u, idx) => {
                  const role    = Array.isArray(u.roles) ? u.roles[0] : (u.role ?? 'Cliente');
                  const isAdm   = role === 'Admin' || role === 'adminBanco';
                  const initial = (u.firstName ?? u.fullName ?? u.email ?? '?')[0].toUpperCase();
                  const name    = u.fullName ?? (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username ?? u.email ?? '—');
                  const fecha   = u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
                  return (
                    <div key={u.id ?? idx} className="flex items-center justify-between p-4 px-5 hover:bg-zinc-50/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border ${isAdm ? 'bg-[#0A0A0A] text-[#C5A880] border-zinc-800' : 'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]'}`}>{initial}</div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0A0A0A]">{name}</h4>
                          <p className="text-[11px] text-zinc-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border tracking-wider ${isAdm ? 'bg-[#0A0A0A] text-[#C5A880] border-zinc-800' : 'bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9]'}`}>{role}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border tracking-wider ${u.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 'bg-red-50 text-red-500 border-red-200/50'}`}>{u.isActive !== false ? 'ACTIVO' : 'INACTIVO'}</span>
                        {fecha && <p className="text-[10px] text-zinc-400 hidden sm:block">{fecha}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="font-bold text-sm text-[#0A0A0A]">Acciones Rápidas</h2>
            </div>
            <div className="p-4">
              <button onClick={() => navigate('/admin/usuarios')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-100 bg-white hover:bg-[#FAF6F0] hover:border-[#EFE6D9] transition-all duration-150 group shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-[#C5A880] flex-shrink-0"><UserPlusIcon /></div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#0A0A0A]">Nuevo Cliente</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Crear cuenta de cliente</div>
                </div>
                <svg className="ml-auto text-zinc-300 group-hover:text-[#A3845B] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-sm text-[#0A0A0A] mb-4">Distribución de Cuentas</h2>
            <div className="flex items-center justify-between gap-4">
              <div className="w-24 h-24 flex-shrink-0 relative">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f4f4f5" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#A3845B" strokeWidth="3.5" strokeDasharray="64.35 35.65" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#C5A880" strokeWidth="3.5" strokeDasharray="35.65 64.35" strokeDashoffset="-64.35" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-[#0A0A0A] leading-none">{usersLoading ? '—' : totalUsers}</span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5 text-[11px] font-semibold text-zinc-500">
                <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#A3845B]" /> Banca Personal</span><span className="text-[#0A0A0A]">65%</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#C5A880]" /> Banca Empresarial</span><span className="text-[#0A0A0A]">35%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h2 className="font-bold text-sm text-[#0A0A0A]">Cuentas por Movimientos</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Ordenadas por cantidad de transferencias, depósitos y retiros</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-medium">Orden:</span>
            <select
              value={accsOrder}
              onChange={(e) => setAccsOrder(e.target.value)}
              className="text-[11px] font-bold border border-zinc-200 rounded-lg px-2 py-1.5 text-[#0A0A0A] bg-white focus:outline-none focus:border-[#C5A880]"
            >
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>
          </div>
        </div>

        {accsLoading ? (
          <div className="py-12 text-center text-zinc-400 text-sm">Cargando cuentas...</div>
        ) : accounts.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-sm">No hay cuentas con movimientos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/80">
                  {['#', 'No. Cuenta', 'Tipo', 'Saldo', 'Movimientos'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, i) => (
                  <tr key={acc._id ?? i} className="border-b border-zinc-50 hover:bg-[#FAF6F0]/40 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-zinc-400 font-bold">{i + 1}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-[#0A0A0A]">{acc.accountNumber ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-[#FAF6F0] text-[#A3845B] border-[#EFE6D9] capitalize">{acc.type ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#0A0A0A] font-semibold">{fmt(acc.balance)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0A0A0A]">
                        <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                        {acc.totalMovimientos ?? 0} movimiento{acc.totalMovimientos !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="bg-[#0A0A0A] border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C5A880]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#C5A880] flex-shrink-0">{icon}</div>
        <div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{label}</div>
          <div className="text-xl font-black text-white tracking-tight mt-1 leading-none">{value}</div>
          <div className="text-[10px] font-bold text-zinc-400 mt-1.5 flex items-center gap-1">
            <span className="text-emerald-400 font-extrabold">{trend}</span> vs mes anterior
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function CheckIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function UserPlusIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>; }
// src/features/admin/pages/AdminUsersPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';

export const AdminUsersPage = () => {
  const token = useAuthStore((s) => s.token);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('Todos');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${NODE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.users ?? []);
    } catch (e) {
      setError(e.message || 'Error al cargar usuarios');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const roles = ['Todos', ...new Set(users.map(u => Array.isArray(u.roles) ? u.roles[0] : (u.role ?? 'Cliente')))];

  const filtered = users.filter(u => {
    const role = Array.isArray(u.roles) ? u.roles[0] : (u.role ?? '');
    const matchRole   = filter === 'Todos' || role === filter;
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div style={{ color: '#fff', maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.75rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Administración
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>Usuarios</h1>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem', marginTop: 4 }}>Gestión de usuarios del sistema</p>
        <div style={{ width: 40, height: 3, background: '#00E5FF', borderRadius: 3, marginTop: 8, boxShadow: '0 0 10px rgba(0,229,255,0.5)' }} />
      </div>

      {/* ── Filters bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: '1.25rem', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 34, padding: '0.6rem 0.9rem 0.6rem 2.2rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: '#fff', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box', transition: 'border-color .14s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {roles.map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{
              padding: '0.45rem 0.9rem', borderRadius: 8, border: '1px solid',
              fontSize: '0.78rem', fontWeight: filter === r ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .14s',
              borderColor: filter === r ? '#00E5FF' : 'rgba(255,255,255,0.08)',
              background: filter === r ? 'rgba(58, 59, 59, 0.1)' : 'transparent',
              color: filter === r ? '#00E5FF' : 'rgba(255,255,255,0.4)',
            }}>{r}</button>
          ))}
        </div>

        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', marginLeft: 'auto' }}>
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.53)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
        backdropFilter: 'blur(16px)',
      }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)' }}>Cargando usuarios...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,229,255,0.03)' }}>
                {['Usuario', 'Correo electrónico', 'Rol', 'Estado', 'Creado'].map(h => (
                  <th key={h} style={{
                    padding: '0.8rem 1.25rem', textAlign: 'left',
                    color: 'rgb(255, 255, 255)', fontWeight: 500,
                    fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'rgb(241, 241, 241)' }}>
                  Sin resultados{search ? ` para "${search}"` : ''}
                </td></tr>
              ) : filtered.map((u, i) => {
                const role    = Array.isArray(u.roles) ? u.roles[0] : (u.role ?? 'Cliente');
                const isAdmin = role === 'Admin' || role === 'adminBanco';
                return (
                  <tr
                    key={u._id ?? i}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background .14s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Avatar + name */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: isAdmin ? 'rgba(0,188,212,0.12)' : 'rgba(167,139,250,0.1)',
                          border: `1px solid ${isAdmin ? 'rgba(0,229,255,0.22)' : 'rgba(167,139,250,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isAdmin ? '#00E5FF' : '#a78bfa',
                          fontWeight: 700, fontSize: '0.82rem',
                        }}>
                          {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: '#fff' }}>{u.name ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'rgba(255,255,255,0.45)' }}>{u.email}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <RoleBadge role={role} isAdmin={isAdmin} />
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <StatusBadge active={u.isActive !== false} />
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'rgba(255,255,255,0.28)', fontSize: '0.76rem' }}>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

function RoleBadge({ role, isAdmin }) {
  const color = isAdmin ? '#00E5FF' : '#a78bfa';
  return (
    <span style={{
      padding: '0.2rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 500,
      background: isAdmin ? 'rgba(255, 255, 255, 0.08)' : 'rgba(167,139,250,0.08)',
      color,
      border: `1px solid ${isAdmin ? 'rgba(0,229,255,0.2)' : 'rgba(167,139,250,0.2)'}`,
    }}>{role}</span>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '0.2rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 500,
      background: active ? 'rgba(52,211,153,0.08)' : 'rgba(255,107,107,0.08)',
      color: active ? '#34d399' : '#ff6b6b',
      border: `1px solid ${active ? 'rgba(52,211,153,0.2)' : 'rgba(255,107,107,0.2)'}`,
    }}>
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: active ? '#34d399' : '#ff6b6b',
        boxShadow: active ? '0 0 4px #34d399' : '0 0 4px #ff6b6b',
      }} />
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}
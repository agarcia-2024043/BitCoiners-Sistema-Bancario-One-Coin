// src/features/admin/pages/AdminHomePage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const get = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

const fmt     = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);
const fmtDate = d => new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const AdminHomePage = () => {
  const token    = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [stats, setStats]     = useState({ users: 0, accounts: 0, transactions: 0 });
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, t] = await Promise.all([
        get(`${NODE_URL}/users`, token),
        get(`${NODE_URL}/accounts`, token),
        get(`${NODE_URL}/transactions`, token),
      ]);
      setStats({ users: u.total ?? 0, accounts: a.total ?? 0, transactions: t.total ?? 0 });
      setRecent((t.transactions ?? []).slice(0, 6));
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ color: '#fff', maxWidth: 1200 }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.75rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dashboard</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
          Panel Principal
        </h1>
        <div style={{ width: 40, height: 3, background: '#00E5FF', borderRadius: 3, marginTop: 10, boxShadow: '0 0 10px rgba(0,229,255,0.5)' }} />
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <StatCard
          icon={<UserIcon />} label="Usuarios Registrados"
          value={loading ? '—' : stats.users} color="#00E5FF"
          onClick={() => navigate('/admin/usuarios')}
        />
        <StatCard
          icon={<BankIcon />} label="Cuentas Activas"
          value={loading ? '—' : stats.accounts} color="#a78bfa"
        />
        <StatCard
          icon={<MoneyIcon />} label="Transacciones"
          value={loading ? '—' : stats.transactions} color="#34d399"
        />
      </div>

      {/* ── 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>

        {/* Últimas transacciones */}
        <div style={cardStyle}>
          <CardHeader title="Últimas Transacciones" icon={<ListIcon />} />
          <div style={{ padding: '0.25rem 0.75rem 0.75rem' }}>
            {loading ? <Loader /> : recent.length === 0 ? <Empty text="Sin transacciones" /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    {['Origen', 'Destino', 'Tipo', 'Monto', 'Fecha'].map(h => (
                      <th key={h} style={{
                        padding: '0.55rem 0.8rem', textAlign: 'left',
                        color: 'rgba(255,255,255,0.25)', fontWeight: 500,
                        fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: '1px solid rgba(145, 30, 30, 0.06)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background .12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdBase}>{t.originAccount?.accountNumber ?? '—'}</td>
                      <td style={tdBase}>{t.destinationAccount?.accountNumber ?? '—'}</td>
                      <td style={tdBase}><TxBadge type={t.type} /></td>
                      <td style={{
                        ...tdBase,
                        color: t.type === 'deposit' ? '#34d399' : t.type === 'withdrawal' ? '#ff6b6b' : '#00E5FF',
                        fontWeight: 600,
                      }}>{fmt(t.amount)}</td>
                      <td style={{ ...tdBase, color: 'rgba(255,255,255,0.28)', fontSize: '0.74rem' }}>
                        {fmtDate(t.date ?? t.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div style={cardStyle}>
          <CardHeader title="Acciones Rápidas" icon={<FlashIcon />} />
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Gestionar Usuarios', to: '/admin/usuarios', color: '#00E5FF', desc: 'Ver y editar usuarios' },
              { label: 'Ver Transacciones',  to: '/admin/home',     color: '#a78bfa', desc: 'Historial completo' },
              { label: 'Seguridad',          to: '/admin/seguridad', color: '#34d399', desc: 'Configuración de acceso' },
            ].map(({ label, to, color, desc }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: 10,
                  border: `1px solid rgba(255,255,255,0.06)`,
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left', transition: 'all .14s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div>
                  <div style={{ color, fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: 2 }}>{desc}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" opacity="0.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Shared ── */
const cardStyle = {
  background: 'rgba(0, 0, 0, 0.53)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16, overflow: 'hidden',
  backdropFilter: 'blur(16px)',
};

const tdBase = { padding: '0.7rem 0.8rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' };

function CardHeader({ title, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.9rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
      <span style={{ color: 'rgba(255,255,255,0.25)', display: 'flex' }}>{icon}</span>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(0, 0, 0, 0.53)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '1.25rem 1.4rem',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .14s, transform .14s',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `${color}12`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.7rem', fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.74rem', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function TxBadge({ type }) {
  const m = {
    deposit:    ['Depósito',      '#34d399', 'rgba(52,211,153,0.1)'],
    withdrawal: ['Retiro',        '#ff6b6b', 'rgba(255,107,107,0.1)'],
    transfer:   ['Transferencia', '#00E5FF', 'rgba(0,229,255,0.1)'],
    reversal:   ['Reversión',     '#fbbf24', 'rgba(251,191,36,0.1)'],
  };
  const [label, color, bg] = m[type] ?? [type, '#94a3b8', 'rgba(148,163,184,0.1)'];
  return (
    <span style={{
      padding: '0.18rem 0.55rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 500,
      background: bg, color, border: `1px solid ${color}28`,
    }}>{label}</span>
  );
}

function Loader() { return <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)' }}>Cargando...</div>; }
function Empty({ text }) { return <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)' }}>{text}</div>; }

/* Icons */
function UserIcon()  { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function BankIcon()  { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 2 7 22 7"/></svg>; }
function MoneyIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function ListIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function FlashIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
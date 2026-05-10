// src/features/client/page/ClientHomePage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const get = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

const fmt     = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);
const fmtDate = d => new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const cap     = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export const ClientHomePage = () => {
  const token    = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [txs, setTxs]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [amount, setAmount]     = useState('');
  const [destiny, setDestiny]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        get(`${NODE_URL}/accounts`, token),
        get(`${NODE_URL}/transactions`, token),
      ]);
      setAccounts(a.accounts ?? []);
      setTxs((t.transactions ?? []).slice(0, 6));
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

      {/* ── 3-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'start' }}>

        {/* ── Col 1: Resumen de Cuentas ── */}
        <div style={cardStyle}>
          <CardHeader title="Resumen de Cuentas" icon={<DocIcon />} />
          <div style={{ padding: '0.75rem' }}>
            {loading ? <Loader /> : accounts.length === 0 ? <Empty text="Sin cuentas" /> :
              accounts.slice(0, 3).map((a, i) => (
                <div
                  key={a._id ?? i}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    padding: '0.8rem 1rem',
                    marginBottom: i < 2 ? 8 : 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'border-color .14s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>Cuenta {cap(a.type)}</div>
                    <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.7rem', marginTop: 3 }}>
                      Cuenta {cap(a.type)}: {fmt(a.balance)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                    {fmt(a.balance)}
                  </div>
                </div>
              ))
            }
            {!loading && accounts.length > 0 && (
              <button
                onClick={() => navigate('/cuentas')}
                style={{
                  width: '100%', marginTop: 10,
                  padding: '0.65rem',
                  borderRadius: 9,
                  border: '1px solid rgba(0,229,255,0.25)',
                  background: 'transparent',
                  color: '#00E5FF', fontSize: '0.83rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .13s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Ver Detalles
              </button>
            )}
          </div>
        </div>

        {/* ── Col 2: Últimas Transacciones ── */}
        <div style={cardStyle}>
          <CardHeader title="Últimas Transacciones" icon={<ListIcon />} />
          <div style={{ padding: '0.25rem 0.75rem 0.75rem' }}>
            {loading ? <Loader /> : txs.length === 0 ? <Empty text="Sin transacciones" /> :
              txs.map((t, i) => {
                const isNeg = t.type === 'withdrawal' || t.type === 'transfer';
                const label = {
                  deposit: 'Supermercado', withdrawal: 'Retiro',
                  transfer: 'Transferencia', salary: 'Salario', reversal: 'Reversión',
                }[t.type] ?? t.type;
                const amountColor = isNeg ? '#ff6b6b' : '#34d399';
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.65rem 0',
                      borderBottom: i < txs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 500 }}>
                        {t.originAccount?.accountNumber ?? t.originAccount ?? 'Racha'}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.7rem', marginTop: 2 }}>
                        {fmtDate(t.date ?? t.createdAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.87rem', color: amountColor }}>
                        {isNeg ? `-${fmt(t.amount)}` : fmt(t.amount)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                        {label}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* ── Col 3: Transferencias Rápidas ── */}
        <div style={cardStyle}>
          <CardHeader title="Transferencias Rápidas" icon={<ArrowsIcon />} />
          <div style={{ padding: '0.75rem' }}>
            <label style={labelStyle}>Monto a enviar</label>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enviar un dinero"
              style={inputSt}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <label style={{ ...labelStyle, marginTop: '0.85rem' }}>Cuenta destino</label>
            <input
              value={destiny}
              onChange={e => setDestiny(e.target.value)}
              placeholder="ID o número de cuenta"
              style={inputSt}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <button
              onClick={() => navigate('/transacciones')}
              style={{
                width: '100%', marginTop: '0.9rem',
                padding: '0.78rem',
                borderRadius: 10, border: 'none',
                background: '#00E5FF',
                color: '#050c1a', fontWeight: 700, fontSize: '0.95rem',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .13s',
                boxShadow: '0 4px 20px rgba(0,229,255,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00d4eb'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,229,255,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00E5FF'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,229,255,0.2)'; }}
            >
              Enviar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ── Shared styles ── */
const cardStyle = {
  background: 'rgba(0, 0, 0, 0.53)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  overflow: 'hidden',
  backdropFilter: 'blur(16px)',
};

const inputSt = {
  width: '100%', marginTop: 6,
  padding: '0.68rem 0.9rem',
  borderRadius: 9,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff', fontSize: '0.84rem',
  fontFamily: 'inherit', outline: 'none',
  transition: 'border-color .14s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  color: 'rgba(255,255,255,0.3)',
  fontSize: '0.65rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

function CardHeader({ title, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.9rem 1rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
      <span style={{ color: 'rgba(255,255,255,0.25)', display: 'flex' }}>{icon}</span>
    </div>
  );
}

/* Icons */
function DocIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function ListIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function ArrowsIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>; }
function Loader()     { return <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem' }}>Cargando...</div>; }
function Empty({ text }) { return <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem' }}>{text}</div>; }
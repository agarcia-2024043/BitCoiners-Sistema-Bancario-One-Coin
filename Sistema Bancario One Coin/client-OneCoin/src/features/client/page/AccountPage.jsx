// src/features/client/page/AccountPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const fmt = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);

const TIPO_OPTS = ['ahorro', 'monetaria', 'corriente'];
const TYPE_COLORS = { ahorro: '#34d399', monetaria: '#00E5FF', corriente: '#a78bfa' };

export const AccountPage = () => {
  const token = useAuthStore((s) => s.token);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [tipo, setTipo]               = useState('ahorro');
  const [initialBalance, setInitialBalance] = useState('');
  const [creating, setCreating]       = useState(false);
  const [createMsg, setCreateMsg]     = useState({ text: '', ok: true });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${NODE_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    } catch { setError('No se pudieron cargar las cuentas.'); }
    finally  { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setCreateMsg({ text: '', ok: true });
    try {
      const res  = await fetch(`${NODE_URL}/accounts/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tipo, initialBalance: initialBalance ? Number(initialBalance) : 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCreateMsg({ text: 'Cuenta creada exitosamente', ok: true });
      setShowModal(false); setTipo('ahorro'); setInitialBalance('');
      load();
    } catch (err) {
      setCreateMsg({ text: ` ${err.message}`, ok: false });
    } finally { setCreating(false); }
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);

  return (
    <div style={{ color: '#fff', maxWidth: 960 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.75rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Banca Personal
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>Mis Cuentas</h1>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem', marginTop: 4 }}>Gestión de cuentas bancarias</p>
          <div style={{ width: 40, height: 3, background: '#00E5FF', borderRadius: 3, marginTop: 8, boxShadow: '0 0 10px rgba(0,229,255,0.5)' }} />
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '0.7rem 1.3rem', borderRadius: 10, border: 'none',
            background: '#00E5FF', color: '#050c1a', fontWeight: 700,
            fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 18px rgba(0,229,255,0.25)', transition: 'all .14s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#00d4eb'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,229,255,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#00E5FF'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,229,255,0.25)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Cuenta
        </button>
      </div>

      {/* ── Total balance banner ── */}
      {!loading && accounts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,188,212,0.1) 0%, rgba(0,229,255,0.04) 100%)',
          border: '1px solid rgba(0,229,255,0.15)',
          borderRadius: 16, padding: '1.3rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Saldo Total Consolidado
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 700, color: '#00E5FF', marginTop: 5, letterSpacing: '-0.02em' }}>
              {fmt(totalBalance)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
              {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
            </div>
            <div style={{ color: 'rgba(0,229,255,0.4)', fontSize: '0.7rem', marginTop: 4 }}>Saldo actualizado</div>
          </div>
        </div>
      )}

      {/* ── Account cards ── */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)' }}>Cargando cuentas...</div>
      ) : error ? (
        <div style={{ padding: '2rem', color: '#ff6b6b', textAlign: 'center' }}>{error}</div>
      ) : accounts.length === 0 ? (
        <div style={{
          background: 'rgba(0, 0, 0, 0.53)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}></div>
          <div style={{ fontSize: '0.9rem' }}>No tienes cuentas todavía</div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              marginTop: 16, padding: '0.65rem 1.3rem', borderRadius: 10,
              border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.08)',
              color: '#ffffff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem',
            }}
          >Crear mi primera cuenta</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
          {accounts.map(a => <AccountCard key={a._id} account={a} />)}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#000000', border: '1px solid rgba(0,229,255,0.15)',
              borderRadius: 20, padding: '2rem', width: 390, maxWidth: '90vw',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <h2 style={{ margin: '0 0 1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>Nueva Cuenta</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={modalLabelStyle}>Tipo de cuenta</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {TIPO_OPTS.map(t => (
                    <button
                      key={t} type="button" onClick={() => setTipo(t)}
                      style={{
                        flex: 1, padding: '0.55rem 0.4rem', borderRadius: 9,
                        border: `1px solid ${tipo === t ? TYPE_COLORS[t] : 'rgba(255,255,255,0.08)'}`,
                        background: tipo === t ? `${TYPE_COLORS[t]}12` : 'transparent',
                        color: tipo === t ? TYPE_COLORS[t] : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem',
                        fontWeight: tipo === t ? 600 : 400, textTransform: 'capitalize',
                        transition: 'all .14s',
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={modalLabelStyle}>Saldo inicial (GTQ)</label>
                <input
                  type="number" min="0" placeholder="0.00"
                  value={initialBalance} onChange={e => setInitialBalance(e.target.value)}
                  style={modalInputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              {createMsg.text && (
                <div style={{
                  padding: '0.65rem 0.9rem', borderRadius: 10, fontSize: '0.8rem',
                  background: createMsg.ok ? 'rgba(52,211,153,0.08)' : 'rgba(255,107,107,0.08)',
                  color: createMsg.ok ? '#34d399' : '#ff6b6b',
                  border: `1px solid ${createMsg.ok ? 'rgba(52,211,153,0.2)' : 'rgba(255,107,107,0.2)'}`,
                }}>{createMsg.text}</div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '0.72rem', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', color: 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .14s',
                  }}
                >Cancelar</button>
                <button
                  type="submit" disabled={creating}
                  style={{
                    flex: 1, padding: '0.72rem', borderRadius: 10, border: 'none',
                    background: '#00E5FF', color: '#050c1a', fontWeight: 700,
                    cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    opacity: creating ? 0.7 : 1, transition: 'opacity .14s',
                  }}
                >{creating ? 'Creando...' : 'Crear Cuenta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function AccountCard({ account: a }) {
  const color = TYPE_COLORS[a.type] ?? '#00E5FF';
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.53)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '1.4rem', transition: 'border-color .15s, transform .15s',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}35`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}14`, border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <span style={{
          padding: '0.22rem 0.65rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
          background: `${color}12`, color, border: `1px solid ${color}25`,
          textTransform: 'capitalize',
        }}>{a.type}</span>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {fmt(a.balance)}
      </div>
      <div style={{ color: 'rgb(255, 255, 255)', fontSize: '0.72rem', marginTop: 8, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
        {a.accountNumber}
      </div>
    </div>
  );
}

const modalLabelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.35)',
  fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em',
};

const modalInputStyle = {
  marginTop: 8, width: '100%',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: '#fff', padding: '0.68rem 0.9rem',
  fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', transition: 'border-color .14s',
};
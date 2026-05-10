// src/features/client/page/TransactionPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
const fmt     = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);
const fmtDate = d => new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });

const apiFetch = async (url, token, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

const TX_TYPES  = ['Todos', 'DEPOSITO', 'RETIRO', 'TRANSFERENCIA', 'REVERTIDA'];
const TX_LABELS = { DEPOSITO: 'Depósito', RETIRO: 'Retiro', TRANSFERENCIA: 'Transferencia', REVERTIDA: 'Reversión' };
const TX_COLORS = { DEPOSITO: '#34d399', RETIRO: '#ff6b6b', TRANSFERENCIA: '#00E5FF', REVERTIDA: '#fbbf24' };

export const TransactionPage = () => {
  const token = useAuthStore((s) => s.token);
  const [txs, setTxs]               = useState([]);
  const [accounts, setAccounts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterType, setFilterType] = useState('Todos');
  const [search, setSearch]         = useState('');
  const [fromId, setFromId]         = useState('');
  const [toId, setToId]             = useState('');
  const [amount, setAmount]         = useState('');
  const [sending, setSending]       = useState(false);
  const [sendMsg, setSendMsg]       = useState({ text: '', ok: true });
  const [allAccounts, setAllAccounts] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
      try {
        const [a, t] = await Promise.all([
          apiFetch(`${NODE_URL}/accounts`, token),
          apiFetch(`${NODE_URL}/transactions`, token),
        ]);
        const mine = a.accounts ?? [];
        setAccounts(mine);
        setTxs(t.transactions ?? []);
        if (!fromId && mine.length) setFromId(mine[0]._id);

        // Todas las cuentas para el selector destino
        try {
          const allRes = await apiFetch(`${NODE_URL}/accounts/all`, token);
          setAllAccounts(allRes.accounts ?? mine);
        } catch {
          setAllAccounts(mine);
        }
      } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!fromId || !toId || !amount) return;
    setSending(true); setSendMsg({ text: '', ok: true });
    try {
      await apiFetch(`${NODE_URL}/transactions/transfer`, token, {
        method: 'POST',
        body: JSON.stringify({ fromAccountId: fromId, toAccountId: toId, amount: Number(amount) }),
      });
      setSendMsg({ text: 'Transferencia realizada correctamente', ok: true });
      setToId(''); setAmount('');
      load();
    } catch (err) {
      setSendMsg({ text: `${err.message}`, ok: false });
    } finally { setSending(false); }
  };

  const filtered = txs.filter(t => {
    const matchType   = filterType === 'Todos' || t.type === filterType;
    const matchSearch = !search ||
      t.originAccount?.accountNumber?.includes(search) ||
      t.destinationAccount?.accountNumber?.includes(search);
    return matchType && matchSearch;
  });

  return (
    <div style={{ color: '#fff', maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.75rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Banca Personal
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>Transacciones</h1>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem', marginTop: 4 }}>Historial y transferencias</p>
        <div style={{ width: 40, height: 3, background: '#00E5FF', borderRadius: 3, marginTop: 8, boxShadow: '0 0 10px rgba(0,229,255,0.5)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* ── History panel ── */}
        <div style={cardStyle}>

          {/* Filters */}
          <div style={{
            padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                placeholder="Buscar número de cuenta..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 30, padding: '0.5rem 0.75rem 0.5rem 2rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9, color: '#fff', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box', transition: 'border-color .14s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {TX_TYPES.map(t => (
                <button key={t} onClick={() => setFilterType(t)} style={{
                  padding: '0.38rem 0.7rem', borderRadius: 8, border: '1px solid',
                  borderColor: filterType === t ? '#00E5FF' : 'rgba(255,255,255,0.08)',
                  background: filterType === t ? 'rgba(0,229,255,0.1)' : 'transparent',
                  color: filterType === t ? '#00E5FF' : 'rgba(255,255,255,0.38)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.74rem',
                  fontWeight: filterType === t ? 600 : 400, transition: 'all .14s',
                }}>{t === 'Todos' ? 'Todos' : TX_LABELS[t]}</button>
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.76rem', marginLeft: 'auto' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)' }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)' }}>Sin transacciones</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,229,255,0.03)' }}>
                  {['Tipo', 'Origen', 'Destino', 'Monto', 'Fecha'].map(h => (
                    <th key={h} style={{
                      padding: '0.65rem 1rem', textAlign: 'left',
                      color: 'rgba(255,255,255,0.25)', fontWeight: 500,
                      fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const c = TX_COLORS[t.type] ?? '#94a3b8';
                  return (
                    <tr
                      key={i}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background .14s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.025)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 500,
                          background: `${c}12`, color: c, border: `1px solid ${c}28`,
                        }}>{TX_LABELS[t.type] ?? t.type}</span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {t.originAccount?.accountNumber ?? '—'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {t.destinationAccount?.accountNumber ?? '—'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: c }}>
                        {t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: 'rgba(255,255,255,0.28)', fontSize: '0.74rem' }}>
                        {fmtDate(t.date ?? t.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Quick transfer panel ── */}
        <div style={cardStyle}>
          <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Transferencia Rápida</span>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <FormField label="Cuenta origen">
                <select
                  value={fromId} onChange={e => setFromId(e.target.value)}
                  style={{ ...formInputStyle, cursor: 'pointer' }}
                >
                  {accounts.map(a => (
                    <option key={a._id} value={a._id} style={{ background: '#0a1020' }}>
                      {a.type} — {fmt(a.balance)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Cuenta destino">
                <select
                  value={toId}
                  onChange={e => setToId(e.target.value)}
                  style={{ ...formInputStyle, cursor: 'pointer' }}
                  required
                >
                  <option value="" disabled style={{ background: '#0a1020' }}>
                    — Seleccionar cuenta —
                  </option>
                  {allAccounts
                    .filter(a => a._id !== fromId)
                    .map(a => (
                      <option key={a._id} value={a._id} style={{ background: '#0a1020' }}>
                        {a.type} · {a.accountNumber}
                      </option>
                    ))
                  }
                </select>
              </FormField>

              <FormField label="Monto (GTQ)">
                <input
                  type="number" min="1" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  style={formInputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </FormField>

              {sendMsg.text && (
                <div style={{
                  padding: '0.65rem 0.9rem', borderRadius: 10, fontSize: '0.8rem',
                  background: sendMsg.ok ? 'rgba(52,211,153,0.08)' : 'rgba(255,107,107,0.08)',
                  color: sendMsg.ok ? '#34d399' : '#ff6b6b',
                  border: `1px solid ${sendMsg.ok ? 'rgba(52,211,153,0.2)' : 'rgba(255,107,107,0.2)'}`,
                }}>{sendMsg.text}</div>
              )}

              <button
                type="submit" disabled={sending}
                style={{
                  padding: '0.82rem', borderRadius: 10, border: 'none',
                  background: '#00E5FF', color: '#050c1a', fontWeight: 700,
                  fontSize: '0.92rem', cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.7 : 1, fontFamily: 'inherit',
                  boxShadow: '0 4px 18px rgba(0,229,255,0.2)', transition: 'all .14s',
                }}
                onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = '#00d4eb'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,229,255,0.35)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = '#00E5FF'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,229,255,0.2)'; }}
              >{sending ? 'Enviando...' : 'Enviar'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const cardStyle = {
  background: 'rgba(0, 0, 0, 0.53)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16, overflow: 'hidden',
  backdropFilter: 'blur(16px)',
};

const formInputStyle = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: '#fff', padding: '0.65rem 0.88rem',
  fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box', transition: 'border-color .14s',
};
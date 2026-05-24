// src/features/client/page/CurrencyPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

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

const CURRENCY_META = {
  USD: { name: 'Dólar Estadounidense', flag: '🇺🇸', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  GTQ: { name: 'Quetzal Guatemalteco', flag: '🇬🇹', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  EUR: { name: 'Euro',                  flag: '🇪🇺', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  MXN: { name: 'Peso Mexicano',         flag: '🇲🇽', color: 'text-red-600 bg-red-50 border-red-200' },
  HNL: { name: 'Lempira Hondureño',     flag: '🇭🇳', color: 'text-sky-600 bg-sky-50 border-sky-200' },
  CRC: { name: 'Colón Costarricense',   flag: '🇨🇷', color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

export const CurrencyPage = () => {
  const token = useAuthStore((s) => s.token);

  const [rates, setRates]       = useState({});
  const [base, setBase]         = useState('USD');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Convertidor
  const [fromCur, setFromCur]   = useState('USD');
  const [toCur, setToCur]       = useState('GTQ');
  const [amount, setAmount]     = useState('');
  const [result, setResult]     = useState(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState('');

  const loadRates = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch(`${NODE_URL}/currencies`, token);
      setRates(data.rates ?? {});
      setBase(data.base ?? 'USD');
      setUpdatedAt(data.updatedAt);
    } catch (e) {
      setError('No se pudieron cargar las tasas de cambio.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadRates(); }, [loadRates]);

  const currencies = Object.keys(rates);

  // Calcular tasa de cualquier par relativa al base
  const getRate = (from, to) => {
    if (!rates[from] || !rates[to]) return null;
    return rates[to] / rates[from];
  };

  // Convertir via API
  const handleConvert = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { setConvertError('Ingresa un monto válido'); return; }
    setConverting(true); setConvertError(''); setResult(null);
    try {
      const data = await apiFetch(`${NODE_URL}/currencies/convert`, token, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), from: fromCur, to: toCur }),
      });
      setResult(data);
    } catch (e) {
      setConvertError(e.message);
    } finally {
      setConverting(false);
    }
  };

  const swapCurrencies = () => {
    setFromCur(toCur);
    setToCur(fromCur);
    setResult(null);
  };

  const fmt = (n, cur) => {
    try {
      return new Intl.NumberFormat('es-GT', { style: 'currency', currency: cur, minimumFractionDigits: 2 }).format(n);
    } catch {
      return `${cur} ${Number(n).toFixed(2)}`;
    }
  };

  return (
    <div className="w-full space-y-6 text-[#0A0A0A] font-sans">

      {/* Header */}
      <div>
        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Finanzas Globales</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A0A0A]">Divisas</h1>
        <p className="text-zinc-400 text-xs font-medium mt-0.5">Tasas de cambio y convertidor de monedas</p>
        <div className="w-8 h-[3px] bg-[#C9A84C] rounded-full mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── IZQUIERDA: Tabla de tasas ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Banner base */}
          <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-zinc-900 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Moneda Base</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl">{CURRENCY_META[base]?.flag ?? '💱'}</span>
                <div>
                  <p className="text-2xl font-black text-white">{base}</p>
                  <p className="text-xs text-zinc-500">{CURRENCY_META[base]?.name}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 mb-1">Actualizado</p>
              <p className="text-xs text-zinc-400">
                {updatedAt ? new Date(updatedAt).toLocaleString('es-GT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—'}
              </p>
              <button
                onClick={loadRates}
                disabled={loading}
                className="mt-2 text-[11px] font-bold text-[#C9A84C] hover:text-white transition flex items-center gap-1"
              >
                <RefreshIcon size={12} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Tabla de tasas */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-[#0A0A0A]">Tasas de Cambio</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Cotizaciones en tiempo real vs {base}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En vivo
              </span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-zinc-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-red-500 text-sm">{error}</p>
                <button onClick={loadRates} className="text-[#A3845B] text-xs mt-2 hover:underline">Reintentar</button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {currencies.map(cur => {
                  const rate = getRate(base, cur);
                  const meta = CURRENCY_META[cur] ?? { name: cur, flag: '💱', color: 'text-zinc-600 bg-zinc-50 border-zinc-200' };
                  const isBase = cur === base;
                  return (
                    <div key={cur} className={`flex items-center justify-between px-5 py-4 hover:bg-[#FAF6F0]/40 transition-colors ${isBase ? 'bg-[#FAF6F0]/60' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meta.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#0A0A0A]">{cur}</p>
                            {isBase && (
                              <span className="text-[9px] font-bold text-[#C9A84C] bg-[#FAF6F0] border border-[#EFE6D9] px-1.5 py-0.5 rounded uppercase">Base</span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400">{meta.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-[#0A0A0A]">
                          {isBase ? '1.0000' : rate?.toFixed(4) ?? '—'}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          1 {base} = {isBase ? '1' : rate?.toFixed(4)} {cur}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabla de cruce completo */}
          {!loading && !error && currencies.length > 0 && (
            <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="font-bold text-sm text-[#0A0A0A]">Tabla de Conversión Rápida</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">1 unidad de cada moneda equivale a…</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-4 py-3 text-left font-bold text-zinc-500 uppercase tracking-wider">De \ A</th>
                      {currencies.map(c => (
                        <th key={c} className="px-4 py-3 text-center font-bold text-zinc-500 uppercase tracking-wider">
                          {CURRENCY_META[c]?.flag} {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {currencies.map(from => (
                      <tr key={from} className="hover:bg-[#FAF6F0]/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#0A0A0A]">
                          {CURRENCY_META[from]?.flag} {from}
                        </td>
                        {currencies.map(to => {
                          const r = getRate(from, to);
                          const isSame = from === to;
                          return (
                            <td key={to} className={`px-4 py-3 text-center font-mono ${isSame ? 'text-zinc-300 font-bold' : 'text-[#0A0A0A] font-semibold'}`}>
                              {isSame ? '—' : r?.toFixed(4) ?? '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── DERECHA: Convertidor ── */}
        <div className="space-y-5">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="font-bold text-sm text-[#0A0A0A]">Convertidor de Moneda</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Calcula al tipo de cambio actual</p>
            </div>

            <form onSubmit={handleConvert} className="p-5 space-y-4">

              {/* Monto */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Monto</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setResult(null); }}
                  className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-bold placeholder-zinc-300 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition text-sm"
                />
              </div>

              {/* Desde */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Desde</label>
                <select
                  value={fromCur}
                  onChange={e => { setFromCur(e.target.value); setResult(null); }}
                  className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-semibold outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition text-sm appearance-none"
                >
                  {currencies.map(c => (
                    <option key={c} value={c}>{CURRENCY_META[c]?.flag} {c} — {CURRENCY_META[c]?.name}</option>
                  ))}
                </select>
              </div>

              {/* Botón swap */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={swapCurrencies}
                  className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#EFE6D9] text-[#A3845B] flex items-center justify-center hover:bg-[#EFE6D9] transition"
                >
                  <SwapIcon size={18} />
                </button>
              </div>

              {/* Hasta */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Hasta</label>
                <select
                  value={toCur}
                  onChange={e => { setToCur(e.target.value); setResult(null); }}
                  className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-zinc-200 text-[#0A0A0A] font-semibold outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition text-sm appearance-none"
                >
                  {currencies.map(c => (
                    <option key={c} value={c}>{CURRENCY_META[c]?.flag} {c} — {CURRENCY_META[c]?.name}</option>
                  ))}
                </select>
              </div>

              {convertError && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{convertError}</p>
              )}

              <button
                type="submit"
                disabled={converting || !amount || loading}
                className="w-full py-3 rounded-xl bg-[#0A0A0A] text-white font-bold text-sm hover:bg-zinc-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {converting ? <SpinIcon /> : <SwapIcon size={15} />}
                {converting ? 'Calculando...' : 'Convertir'}
              </button>
            </form>

            {/* Resultado */}
            {result && (
              <div className="mx-5 mb-5 bg-[#FAF6F0] border border-[#EFE6D9] rounded-xl p-5">
                <p className="text-[10px] font-bold text-[#A3845B] uppercase tracking-widest mb-3">Resultado</p>
                <div className="text-center">
                  <p className="text-3xl font-black text-[#0A0A0A]">
                    {CURRENCY_META[result.converted.currency]?.flag} {result.converted.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm font-bold text-zinc-500 mt-1">{result.converted.currency}</p>
                </div>
                <div className="border-t border-[#EFE6D9] mt-4 pt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Monto original</span>
                    <span className="font-bold">{CURRENCY_META[result.original.currency]?.flag} {result.original.amount} {result.original.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Tasa aplicada</span>
                    <span className="font-bold text-[#A3845B]">× {result.rate.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nota tasas */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <InfoIcon size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Las tasas mostradas son de referencia. Para transacciones en divisas, consulta las tasas vigentes de tu banco.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Iconos ──────────────────────────────────────────────────────
function RefreshIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
function SwapIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
}
function InfoIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function SpinIcon() {
  return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
}

// src/features/currencies/hooks/useCurrencies.js
import { useState, useEffect, useCallback } from 'react';
import userClient from '../../../shared/api/userClient.js';

export const useCurrencies = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userClient.get('/currencies');
      // El servidor devuelve { success, base, rates: { USD: 1, EUR: 0.92, ... } }
      const ratesObj = response.data?.rates;
      if (ratesObj && typeof ratesObj === 'object' && !Array.isArray(ratesObj)) {
        // Convertir el objeto a array [{code, name, rate}]
        const CURRENCY_NAMES = {
          USD: 'Dólar Estadounidense', EUR: 'Euro', GTQ: 'Quetzal Guatemalteco',
          MXN: 'Peso Mexicano', GBP: 'Libra Esterlina', JPY: 'Yen Japonés',
          CAD: 'Dólar Canadiense', CHF: 'Franco Suizo', BRL: 'Real Brasileño',
          ARS: 'Peso Argentino', CLP: 'Peso Chileno', COP: 'Peso Colombiano',
          AUD: 'Dólar Australiano', BGN: 'Lev Búlgaro', CNY: 'Yuan Chino',
          CZK: 'Corona Checa', DKK: 'Corona Danesa', HKD: 'Dólar de Hong Kong',
          HUF: 'Forinto Húngaro', IDR: 'Rupia Indonesia', ILS: 'Séquel Israelí',
          INR: 'Rupia India', ISK: 'Corona Islandesa', KRW: 'Won Surcoreano',
          MYR: 'Ringgit Malayo', NOK: 'Corona Noruega', NZD: 'Dólar Neozelandés',
          PHP: 'Peso Filipino', PLN: 'Zloty Polaco', RON: 'Leu Rumano',
          SEK: 'Corona Sueca', SGD: 'Dólar de Singapur', THB: 'Baht Tailandés',
          TRY: 'Lira Turca', ZAR: 'Rand Sudafricano',
        };
        const ratesArray = Object.entries(ratesObj).map(([code, rate]) => ({
          code,
          name: CURRENCY_NAMES[code] || code,
          rate: Number(rate),
        }));
        setRates(ratesArray);
      } else {
        const responseData = response.data?.data || response.data;
        setRates(Array.isArray(responseData) ? responseData : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al obtener tasas de cambio');
      // Datos de respaldo para mantener la UX si el backend no está disponible
      setRates([
        { code: 'USD', name: 'Dólar Estadounidense', rate: 1.0 },
        { code: 'EUR', name: 'Euro', rate: 0.92 },
        { code: 'GTQ', name: 'Quetzal Guatemalteco', rate: 7.78 },
        { code: 'MXN', name: 'Peso Mexicano', rate: 18.45 }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const convertCurrency = useCallback(async (from, to, amount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userClient.post('/currencies/convert', {
        from,
        to,
        amount: Number(amount)
      });
      return response.data?.data || response.data;
    } catch (err) {
      // Fallback calculation using current state rates
      const fromObj = rates.find(r => r.code === from);
      const toObj = rates.find(r => r.code === to);
      if (fromObj && toObj) {
        // convert to base (USD equivalent) then to target
        const amountInBase = Number(amount) / fromObj.rate;
        const resultVal = amountInBase * toObj.rate;
        return { result: resultVal };
      }
      const errMsg = err.response?.data?.message || err.message || 'Error al realizar conversión';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [rates]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    fetchRates,
    convertCurrency,
  };
};

export default useCurrencies;

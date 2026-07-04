// src/features/accounts/hooks/useAccounts.js
import { useState, useEffect, useCallback } from 'react';
import accountClient from '../../../shared/api/accountClient.js';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountClient.get('/accounts');
      const responseData = response.data?.accounts || response.data?.data || response.data;
      const mapped = (Array.isArray(responseData) ? responseData : []).map((acc) => ({
        id: acc.id || acc._id,
        accountNumber: acc.accountNumber || '',
        type: acc.type || '',
        name: acc.name || '',
        balance: acc.balance !== undefined ? acc.balance : 0,
        createdAt: acc.createdAt || acc.date || ''
      }));
      setAccounts(mapped);
      
      const total = mapped.reduce((sum, acc) => sum + acc.balance, 0);
      setTotalBalance(total);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al obtener las cuentas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (type, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountClient.post('/accounts/create', { type, name });
      await fetchAccounts();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error al crear la cuenta';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  const deposit = useCallback(async (accountId, amount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountClient.post('/accounts/deposit', { accountId, amount: Number(amount) });
      await fetchAccounts();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error al realizar el depósito';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  const withdraw = useCallback(async (accountId, amount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountClient.post('/accounts/withdraw', { accountId, amount: Number(amount) });
      await fetchAccounts();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error al realizar el retiro';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    totalBalance,
    loading,
    error,
    fetchAccounts,
    createAccount,
    deposit,
    withdraw,
  };
};

export default useAccounts;

// src/features/transactions/hooks/useTransactions.js
import { useState, useEffect, useCallback } from 'react';
import userClient from '../../../shared/api/userClient.js';

export const useTransactions = (accountNumber = null) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userClient.get('/transactions');
      const responseData = response.data?.transactions || response.data?.data || response.data;
      let mapped = (Array.isArray(responseData) ? responseData : []).map((tx) => ({
        id: tx.id || tx._id,
        type: tx.type || '',
        amount: tx.amount !== undefined ? tx.amount : 0,
        fromAccount: tx.originAccount?.accountNumber || tx.originAccount || '',
        toAccount: tx.destinationAccount?.accountNumber || tx.destinationAccount || '',
        date: tx.date || tx.createdAt || '',
        status: tx.status || 'COMPLETADA'
      }));

      if (accountNumber) {
        mapped = mapped.filter(
          (tx) => tx.fromAccount === accountNumber || tx.toAccount === accountNumber
        );
      }
      setTransactions(mapped);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al obtener transacciones');
    } finally {
      setLoading(false);
    }
  }, [accountNumber]);

  const transfer = useCallback(async (transferData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userClient.post('/transactions/transfer', {
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: Number(transferData.amount)
      });
      await fetchTransactions();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error al realizar la transferencia';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    transfer,
  };
};

export default useTransactions;

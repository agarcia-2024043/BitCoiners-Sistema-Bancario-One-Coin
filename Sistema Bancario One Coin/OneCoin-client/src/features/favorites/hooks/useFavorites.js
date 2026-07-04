// src/features/favorites/hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import userClient from '../../../shared/api/userClient.js';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userClient.get('/favorites');
      // El servidor devuelve { success, total, favorites: [...] }
      const responseData = response.data?.favorites || response.data?.data || response.data;
      setFavorites(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al obtener favoritos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (favoriteData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userClient.post('/favorites', favoriteData);
      await fetchFavorites();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error al agregar favorito';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  const deleteFavorite = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userClient.delete(`/favorites/${id}`);
      await fetchFavorites();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error al eliminar favorito';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    deleteFavorite,
  };
};

export default useFavorites;

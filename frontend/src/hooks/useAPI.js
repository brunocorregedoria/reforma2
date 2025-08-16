import { useState, useCallback } from 'react';
import api from '../lib/api';

/**
 * Hook genérico para chamadas API com estados de loading/error
 * 
 * @param {Function} apiCall - Função que faz a chamada API
 * @returns {Object} - Estado e funções para gerenciar a API call
 */
export const useAPI = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args);
      setData(response.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro na requisição';
      setError(errorMessage);
      console.error('API Error:', err);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook específico para operações CRUD de uma entidade
 * 
 * @param {string} endpoint - Endpoint base da API (ex: '/projects')
 * @returns {Object} - Funções CRUD com estados
 */
export const useCRUD = (endpoint) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAll = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(endpoint, { params });
      const data = response.data;
      
      // Suporta tanto formato paginado quanto array simples
      const itemsArray = Array.isArray(data) ? data : (data.items || data.projects || []);
      setItems(itemsArray);
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('Get All Error:', err);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const getById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`${endpoint}/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao carregar item';
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const create = useCallback(async (itemData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(endpoint, itemData);
      const newItem = response.data.project || response.data.item || response.data;
      
      // Adicionar item à lista local
      setItems(prev => [newItem, ...prev]);
      
      return { success: true, data: newItem };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar item';
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const update = useCallback(async (id, itemData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`${endpoint}/${id}`, itemData);
      const updatedItem = response.data.project || response.data.item || response.data;
      
      // Atualizar item na lista local
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      ));
      
      return { success: true, data: updatedItem };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar item';
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`${endpoint}/${id}`);
      
      // Remover item da lista local
      setItems(prev => prev.filter(item => item.id !== id));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao excluir item';
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return {
    items,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
    setItems,
    setError
  };
};
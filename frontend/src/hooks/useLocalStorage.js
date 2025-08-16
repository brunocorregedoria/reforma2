import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar dados no localStorage de forma reativa
 * 
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão se não existir
 * @returns {[value, setValue, removeValue]} - Array com valor, setter e remover
 */
export const useLocalStorage = (key, defaultValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      // Permite que value seja uma função como no useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
};
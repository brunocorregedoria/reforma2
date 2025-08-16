import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para otimizar chamadas de API em campos de busca
 * 
 * @param {*} value - Valor a ser debounced
 * @param {number} delay - Delay em milliseconds
 * @returns {*} - Valor debounced
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
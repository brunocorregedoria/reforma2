import { useRef, useCallback } from 'react';

/**
 * Hook para throttle de funções
 * Útil para otimizar scroll handlers e resize handlers
 * 
 * @param {Function} callback - Função a ser throttled
 * @param {number} delay - Delay em milliseconds
 * @returns {Function} - Função throttled
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};
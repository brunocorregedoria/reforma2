import { useCallback, useRef } from 'react';

/**
 * Hook para criar callbacks memoizados com dependências estáveis
 * Evita re-renders desnecessários em componentes filhos
 * 
 * @param {Function} callback - Função callback
 * @param {Array} deps - Dependências
 * @returns {Function} - Callback memoizado
 */
export const useMemoizedCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);

  // Atualizar a função se as dependências mudaram
  if (!deps || !depsRef.current || deps.some((dep, i) => dep !== depsRef.current[i])) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};
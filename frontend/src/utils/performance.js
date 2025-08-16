import React from 'react';

/**
 * Higher-Order Component para adicionar otimizações de performance
 * @param {React.Component} Component - Componente a ser otimizado
 * @param {Function} areEqual - Função personalizada para comparação (opcional)
 * @returns {React.Component} - Componente otimizado
 */
export const withPerformance = (Component, areEqual) => {
  const WrappedComponent = React.memo(Component, areEqual);
  WrappedComponent.displayName = `withPerformance(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook para medir performance de componentes
 * @param {string} componentName - Nome do componente
 * @param {Array} deps - Dependências para medir re-renders
 */
export const usePerformanceMonitor = (componentName, deps = []) => {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(Date.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}: Render #${renderCount.current}, Time since last: ${timeSinceLastRender}ms`);
    }
    
    lastRenderTime.current = currentTime;
  }, deps);

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  };
};

/**
 * Função para lazy loading de componentes com suspense
 * @param {Function} importFunc - Função de import dinâmico
 * @param {Object} fallback - Componente de fallback
 * @returns {React.Component} - Componente lazy
 */
export const createLazyComponent = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  
  return React.forwardRef((props, ref) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
};

/**
 * Hook para controlar quando componentes devem ser renderizados
 * baseado na visibilidade
 * @param {Object} options - Opções do Intersection Observer
 * @returns {Object} - Ref e estado de visibilidade
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [element, setElement] = React.useState(null);

  React.useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isIntersecting];
};

/**
 * Função para otimização de grandes listas
 * @param {Array} items - Lista de itens
 * @param {number} chunkSize - Tamanho do chunk
 * @returns {Array} - Array chunked
 */
export const chunkArray = (items, chunkSize = 10) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Hook para renderização progressiva de listas grandes
 * @param {Array} items - Lista de itens
 * @param {number} initialBatch - Tamanho do lote inicial
 * @param {number} batchSize - Tamanho dos lotes subsequentes
 * @returns {Object} - Itens visíveis e função para carregar mais
 */
export const useProgressiveRendering = (items, initialBatch = 20, batchSize = 10) => {
  const [visibleCount, setVisibleCount] = React.useState(initialBatch);
  const [isLoading, setIsLoading] = React.useState(false);

  const visibleItems = React.useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const loadMore = React.useCallback(() => {
    if (isLoading || visibleCount >= items.length) return;

    setIsLoading(true);
    
    // Simular delay para evitar travamentos
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + batchSize, items.length));
      setIsLoading(false);
    }, 16); // ~1 frame
  }, [items.length, visibleCount, batchSize, isLoading]);

  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    loadMore,
    hasMore,
    isLoading
  };
};
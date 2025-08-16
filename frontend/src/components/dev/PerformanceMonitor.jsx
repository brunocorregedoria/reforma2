import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

/**
 * Componente para monitorar performance durante desenvolvimento
 * Só deve ser usado em ambiente de desenvolvimento
 */
const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
    componentRenders: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const animationId = useRef();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const measurePerformance = () => {
      const now = Date.now();
      frameCount.current++;

      // Calcular FPS a cada segundo
      if (now - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        
        // Obter uso de memória (se disponível)
        const memory = performance.memory ? 
          Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;

        const newMetrics = {
          fps,
          memory,
          renderTime: Math.round(performance.now()),
          componentRenders: frameCount.current
        };

        setMetrics(newMetrics);
        
        // Manter histórico dos últimos 10 valores
        setHistory(prev => {
          const newHistory = [...prev, { timestamp: now, ...newMetrics }];
          return newHistory.slice(-10);
        });

        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId.current = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getPerformanceStatus = (fps) => {
    if (fps >= 50) return { color: 'text-green-600', icon: TrendingUp, status: 'Ótimo' };
    if (fps >= 30) return { color: 'text-yellow-600', icon: Activity, status: 'Bom' };
    return { color: 'text-red-600', icon: TrendingDown, status: 'Ruim' };
  };

  const performanceStatus = getPerformanceStatus(metrics.fps);
  const StatusIcon = performanceStatus.icon;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
          title="Mostrar monitor de performance"
        >
          <Zap className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Performance Monitor</CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-4 w-4 ${performanceStatus.color}`} />
              <span className="text-sm font-medium">FPS</span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${performanceStatus.color}`}>
                {metrics.fps}
              </div>
              <div className="text-xs text-gray-500">
                {performanceStatus.status}
              </div>
            </div>
          </div>

          {/* Memória */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Memória</span>
            <div className="text-right">
              <div className="text-sm font-bold text-blue-600">
                {metrics.memory} MB
              </div>
              <div className="text-xs text-gray-500">
                JS Heap
              </div>
            </div>
          </div>

          {/* Render Time */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tempo Total</span>
            <div className="text-right">
              <div className="text-sm font-bold text-purple-600">
                {metrics.renderTime}ms
              </div>
              <div className="text-xs text-gray-500">
                Performance.now()
              </div>
            </div>
          </div>

          {/* Component Renders */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Renders</span>
            <div className="text-right">
              <div className="text-sm font-bold text-orange-600">
                {metrics.componentRenders}
              </div>
              <div className="text-xs text-gray-500">
                Por segundo
              </div>
            </div>
          </div>

          {/* Mini gráfico de FPS */}
          {history.length > 1 && (
            <div className="mt-3">
              <div className="text-xs font-medium text-gray-700 mb-1">FPS History</div>
              <div className="flex items-end space-x-1 h-8">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-blue-200 rounded-sm flex-1"
                    style={{
                      height: `${Math.max(2, (entry.fps / 60) * 100)}%`,
                      backgroundColor: entry.fps >= 50 ? '#10b981' : 
                                     entry.fps >= 30 ? '#f59e0b' : '#ef4444'
                    }}
                    title={`${entry.fps} FPS`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-2">
            Apenas visível em desenvolvimento
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
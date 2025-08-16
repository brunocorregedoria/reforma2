import { useState, useEffect } from 'react';
import { projectsAPI } from '../lib/api';

/**
 * Hook para gerenciar dados do dashboard
 * Centraliza lógica de carregamento de estatísticas e atividades
 */
export const useDashboardData = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalWorkOrders: 0,
    pendingWorkOrders: 0,
    totalCost: 0,
    completedTasks: 0
  });

  const [projectStats, setProjectStats] = useState({
    em_andamento: 0,
    planejado: 0,
    concluido: 0,
    pausado: 0,
    cancelado: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Em uma implementação real, faria chamadas paralelas para APIs
      // const [statsResponse, activitiesResponse] = await Promise.all([
      //   api.get('/dashboard/stats'),
      //   api.get('/dashboard/activities')
      // ]);

      // Por enquanto, simulando dados
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay

      setStats({
        totalProjects: 12,
        activeProjects: 8,
        totalWorkOrders: 45,
        pendingWorkOrders: 18,
        totalCost: 125000,
        completedTasks: 27
      });

      setProjectStats({
        em_andamento: 8,
        planejado: 3,
        concluido: 1,
        pausado: 0,
        cancelado: 0
      });

      setRecentActivities([
        {
          id: 1,
          type: 'project',
          title: 'Projeto Casa Silva iniciado',
          time: '2 horas atrás',
          status: 'success'
        },
        {
          id: 2,
          type: 'work_order',
          title: 'OS #123 - Troca de janelas concluída',
          time: '4 horas atrás',
          status: 'success'
        },
        {
          id: 3,
          type: 'alert',
          title: 'Material em falta - Cimento',
          time: '6 horas atrás',
          status: 'warning'
        },
        {
          id: 4,
          type: 'work_order',
          title: 'Nova OS #124 criada',
          time: '1 dia atrás',
          status: 'info'
        }
      ]);

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const refreshData = () => {
    loadDashboardData();
  };

  // Dados calculados
  const statsCards = [
    {
      title: 'Projetos Ativos',
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: 'FolderOpen',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Ordens Pendentes',
      value: stats.pendingWorkOrders,
      total: stats.totalWorkOrders,
      icon: 'ClipboardList',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Custo Total',
      value: `R$ ${stats.totalCost.toLocaleString('pt-BR')}`,
      icon: 'DollarSign',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Tarefas Concluídas',
      value: stats.completedTasks,
      icon: 'CheckCircle',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return {
    stats,
    projectStats,
    recentActivities,
    statsCards,
    loading,
    error,
    refreshData
  };
};
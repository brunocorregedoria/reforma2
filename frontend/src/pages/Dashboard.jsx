import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  FolderOpen, 
  ClipboardList, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalWorkOrders: 0,
    pendingWorkOrders: 0,
    totalCost: 0,
    completedTasks: 0
  });

  useEffect(() => {
    // Simular carregamento de estatísticas
    // Em uma implementação real, isso viria da API
    setStats({
      totalProjects: 12,
      activeProjects: 8,
      totalWorkOrders: 45,
      pendingWorkOrders: 18,
      totalCost: 125000,
      completedTasks: 27
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const statsCards = [
    {
      title: 'Projetos Ativos',
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Ordens Pendentes',
      value: stats.pendingWorkOrders,
      total: stats.totalWorkOrders,
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Custo Total',
      value: `R$ ${stats.totalCost.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Tarefas Concluídas',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentActivities = [
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.nome}!
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo das suas atividades de reforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.total && (
                      <p className="text-xs text-gray-500">
                        de {stat.total} total
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atualizações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {activity.status === 'warning' && (
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    )}
                    {activity.status === 'info' && (
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Projetos</CardTitle>
            <CardDescription>
              Visão geral do progresso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Em Andamento</span>
                <Badge variant="default">{stats.activeProjects}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Planejados</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Concluídos</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pausados</span>
                <Badge variant="destructive">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


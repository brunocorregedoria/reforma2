import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import ProjectStatusCard from '../components/dashboard/ProjectStatusCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { 
  FolderOpen, 
  ClipboardList, 
  DollarSign, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    statsCards, 
    projectStats, 
    recentActivities, 
    loading, 
    error, 
    refreshData 
  } = useDashboardData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          role="status"
          aria-label="Carregando dados do dashboard"
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.nome}!
          </h1>
          <p className="text-gray-600">
            Aqui está um resumo das suas atividades de reforma
          </p>
        </div>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          title="Atualizar dados"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = {
            FolderOpen,
            ClipboardList,
            DollarSign,
            CheckCircle
          }[stat.icon];

          return (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              total={stat.total}
              icon={IconComponent}
              color={stat.color}
              bgColor={stat.bgColor}
            />
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
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <ProjectStatusCard stats={projectStats} />
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';

/**
 * ProjectStatusCard - Componente para exibir status dos projetos
 * 
 * @param {Object} stats - Estatísticas dos projetos por status
 * @param {string} title - Título do card
 * @param {string} description - Descrição do card
 * @param {string} className - Classes CSS adicionais
 */
const ProjectStatusCard = ({ 
  stats, 
  title = "Status dos Projetos",
  description = "Visão geral do progresso",
  className = '' 
}) => {
  const statusConfig = {
    em_andamento: {
      label: 'Em Andamento',
      variant: 'default',
      color: 'bg-blue-100 text-blue-800'
    },
    planejado: {
      label: 'Planejados', 
      variant: 'secondary',
      color: 'bg-gray-100 text-gray-800'
    },
    concluido: {
      label: 'Concluídos',
      variant: 'outline',
      color: 'bg-green-100 text-green-800'
    },
    pausado: {
      label: 'Pausados',
      variant: 'destructive',
      color: 'bg-red-100 text-red-800'
    },
    cancelado: {
      label: 'Cancelados',
      variant: 'destructive',
      color: 'bg-red-100 text-red-800'
    }
  };

  const getStatusItems = () => {
    return Object.entries(statusConfig).map(([status, config]) => {
      const count = stats[status] || 0;
      return {
        status,
        config,
        count
      };
    });
  };

  return (
    <Card className={className} data-testid="project-status-card">
      <CardHeader>
        <CardTitle data-testid="status-card-title">{title}</CardTitle>
        <CardDescription data-testid="status-card-description">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getStatusItems().map(({ status, config, count }) => (
            <div 
              key={status}
              className="flex items-center justify-between"
              data-testid={`status-item-${status}`}
            >
              <span className="text-sm font-medium">
                {config.label}
              </span>
              <Badge 
                variant={config.variant}
                className={config.color}
                data-testid={`status-badge-${status}`}
              >
                {count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

ProjectStatusCard.propTypes = {
  stats: PropTypes.object.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
};

export default ProjectStatusCard;
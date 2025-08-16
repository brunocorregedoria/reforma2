import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, AlertCircle, TrendingUp, Info } from 'lucide-react';

/**
 * ActivityItem - Componente para itens de atividade recente
 * 
 * @param {Object} activity - Objeto da atividade
 * @param {string} activity.title - Título da atividade
 * @param {string} activity.time - Tempo da atividade (ex: "2 horas atrás")
 * @param {string} activity.status - Status: 'success' | 'warning' | 'info' | 'error'
 * @param {string} className - Classes CSS adicionais
 */
const ActivityItem = React.memo(({ activity, className = '' }) => {
  const getIcon = () => {
    const iconClass = "h-5 w-5";
    
    switch (activity.status) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'info':
      default:
        return <TrendingUp className={`${iconClass} text-blue-500`} />;
    }
  };

  const getStatusColor = () => {
    switch (activity.status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div 
      className={`flex items-center space-x-3 ${className}`}
      data-testid="activity-item"
    >
      <div className="flex-shrink-0" data-testid="activity-icon">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p 
          className="text-sm font-medium text-gray-900 truncate"
          data-testid="activity-title"
          title={activity.title}
        >
          {activity.title}
        </p>
        <p 
          className="text-xs text-gray-500"
          data-testid="activity-time"
        >
          {activity.time}
        </p>
      </div>
      {activity.status && (
        <div className={`text-xs font-medium ${getStatusColor()}`}>
          {activity.status}
        </div>
      )}
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';

ActivityItem.propTypes = {
  activity: PropTypes.shape({
    title: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['success', 'warning', 'info', 'error']),
  }).isRequired,
  className: PropTypes.string,
};

export default ActivityItem;
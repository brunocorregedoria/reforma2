import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '../ui/card';

/**
 * StatCard - Componente reutilizável para exibir estatísticas
 * 
 * @param {string} title - Título da estatística
 * @param {string|number} value - Valor principal a ser exibido
 * @param {string|number} total - Valor total (opcional, para mostrar "X de Y")
 * @param {React.Component} icon - Ícone do Lucide React
 * @param {string} color - Classe CSS para cor do ícone
 * @param {string} bgColor - Classe CSS para cor de fundo do ícone
 * @param {string} className - Classes CSS adicionais
 */
const StatCard = React.memo(({ 
  title, 
  value, 
  total, 
  icon: Icon, 
  color = 'text-gray-600', 
  bgColor = 'bg-gray-100',
  className = '' 
}) => {
  return (
    <Card className={className} data-testid="stat-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p 
              className="text-sm font-medium text-gray-600"
              data-testid="stat-title"
            >
              {title}
            </p>
            <p 
              className="text-2xl font-bold text-gray-900 mt-1"
              data-testid="stat-value"
            >
              {value}
            </p>
            {total !== undefined && total !== null && (
              <p 
                className="text-xs text-gray-500 mt-1"
                data-testid="stat-total"
              >
                de {total} total
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${bgColor} flex-shrink-0`}>
            <Icon 
              className={`h-6 w-6 ${color}`} 
              data-testid="stat-icon"
              aria-hidden="true"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  className: PropTypes.string,
};

export default StatCard;
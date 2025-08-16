import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

/**
 * Layout padrão para páginas de autenticação
 */
const AuthLayout = ({
  title,
  description,
  children,
  footer
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Reforma Residencial
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestão de Reformas
          </p>
        </div>

        <Card data-testid="auth-card">
          <CardHeader>
            <CardTitle data-testid="auth-title">{title}</CardTitle>
            <CardDescription data-testid="auth-description">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {children}
            {footer && (
              <div className="mt-4 text-center">
                {footer}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks/useForm';
import AuthLayout from '../components/auth/AuthLayout';
import FormField from '../components/form/FormField';
import SubmitButton from '../components/form/SubmitButton';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormErrors,
    generalError
  } = useForm(
    { email: '', password: '' },
    async (formData) => {
      const result = await login(formData);
      
      if (result.success) {
        navigate('/', { replace: true });
        return result;
      } else {
        setFormErrors(result.error);
        return result;
      }
    }
  );

  const validationRules = {
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email é obrigatório',
      emailMessage: 'Email inválido'
    },
    password: {
      required: true,
      minLength: 6,
      requiredMessage: 'Senha é obrigatória',
      minLengthMessage: 'Senha deve ter pelo menos 6 caracteres'
    }
  };

  const footer = (
    <p className="text-sm text-gray-600">
      Não tem uma conta?{' '}
      <Button 
        variant="link" 
        className="p-0 h-auto font-normal"
        onClick={() => navigate('/register')}
        data-testid="register-link"
      >
        Criar conta
      </Button>
    </p>
  );

  return (
    <AuthLayout
      title="Entrar na sua conta"
      description="Digite suas credenciais para acessar o sistema"
      footer={footer}
    >
      <form 
        onSubmit={(e) => handleSubmit(e, validationRules)} 
        className="space-y-4"
        data-testid="login-form"
      >
        {generalError && (
          <Alert variant="destructive" data-testid="general-error">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <FormField
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="seu@email.com"
          required
        />

        <FormField
          name="password"
          label="Senha"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
        />

        <SubmitButton loading={loading}>
          Entrar
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default Login;


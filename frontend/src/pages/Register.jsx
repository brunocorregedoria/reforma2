import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import AuthLayout from '../components/auth/AuthLayout';
import FormField from '../components/form/FormField';
import SubmitButton from '../components/form/SubmitButton';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
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
    { 
      nome: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      telefone: ''
    },
    async (formData) => {
      const result = await register(formData);
      
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
    nome: {
      required: true,
      minLength: 2,
      requiredMessage: 'Nome é obrigatório',
      minLengthMessage: 'Nome deve ter pelo menos 2 caracteres'
    },
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
    },
    confirmPassword: {
      required: true,
      requiredMessage: 'Confirmação de senha é obrigatória'
    },
    telefone: {
      required: true,
      pattern: /^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/,
      requiredMessage: 'Telefone é obrigatório',
      patternMessage: 'Telefone inválido (ex: (11) 99999-9999)'
    }
  };

  // Validação customizada para confirmação de senha
  const customValidation = (formData) => {
    if (formData.password !== formData.confirmPassword) {
      setFormErrors({ confirmPassword: 'Senhas não coincidem' });
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    const result = await handleSubmit(e, validationRules);
    
    // Só executa validação customizada se a validação básica passou
    if (result.success) {
      if (!customValidation(values)) {
        return { success: false };
      }
    }
    
    return result;
  };

  const footer = (
    <p className="text-sm text-gray-600">
      Já tem uma conta?{' '}
      <Button 
        variant="link" 
        className="p-0 h-auto font-normal"
        onClick={() => navigate('/login')}
        data-testid="login-link"
      >
        Fazer login
      </Button>
    </p>
  );

  return (
    <AuthLayout
      title="Criar sua conta"
      description="Preencha os dados para começar a usar o sistema"
      footer={footer}
    >
      <form 
        onSubmit={handleFormSubmit} 
        className="space-y-4"
        data-testid="register-form"
      >
        {generalError && (
          <Alert variant="destructive" data-testid="general-error">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <FormField
          name="nome"
          label="Nome completo"
          type="text"
          value={values.nome}
          onChange={handleChange}
          error={errors.nome}
          placeholder="João Silva"
          required
        />

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
          name="telefone"
          label="Telefone"
          type="tel"
          value={values.telefone}
          onChange={handleChange}
          error={errors.telefone}
          placeholder="(11) 99999-9999"
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

        <FormField
          name="confirmPassword"
          label="Confirmar senha"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
        />

        <SubmitButton loading={loading}>
          Criar conta
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default Register;
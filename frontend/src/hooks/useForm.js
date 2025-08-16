import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar estado de formulários
 * 
 * @param {Object} initialValues - Valores iniciais do formulário
 * @param {Function} onSubmit - Função chamada ao submeter o formulário
 * @returns {Object} - Estado e funções do formulário
 */
export const useForm = (initialValues = {}, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Limpar erro do campo quando usuário digita
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const validateField = useCallback((name, value, rules = {}) => {
    let error = '';

    if (rules.required && (!value || value.toString().trim() === '')) {
      error = rules.requiredMessage || `${name} é obrigatório`;
    } else if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      error = rules.emailMessage || 'Email inválido';
    } else if (rules.minLength && value && value.length < rules.minLength) {
      error = rules.minLengthMessage || `Mínimo ${rules.minLength} caracteres`;
    } else if (rules.pattern && value && !rules.pattern.test(value)) {
      error = rules.patternMessage || 'Formato inválido';
    }

    setFieldError(name, error);
    return error === '';
  }, [setFieldError]);

  const validateForm = useCallback((validationRules = {}) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const rules = validationRules[fieldName];
      const value = values[fieldName];
      
      if (!validateField(fieldName, value, rules)) {
        isValid = false;
      }
    });

    return isValid;
  }, [values, validateField]);

  const handleSubmit = useCallback(async (e, validationRules = {}) => {
    e.preventDefault();

    if (!validateForm(validationRules)) {
      return { success: false, errors };
    }

    if (!onSubmit) {
      return { success: true, data: values };
    }

    try {
      setLoading(true);
      const result = await onSubmit(values);
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao enviar formulário' 
      };
    } finally {
      setLoading(false);
    }
  }, [values, errors, validateForm, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setLoading(false);
  }, [initialValues]);

  const setFormErrors = useCallback((errorObj) => {
    if (typeof errorObj === 'string') {
      setErrors({ general: errorObj });
    } else {
      setErrors(errorObj);
    }
  }, []);

  return {
    values,
    errors,
    loading,
    setLoading,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFormErrors,
    validateField,
    validateForm,
    reset,
    // Propriedades computadas úteis
    hasErrors: Object.keys(errors).some(key => errors[key]),
    generalError: errors.general || ''
  };
};
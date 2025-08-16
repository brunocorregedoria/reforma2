import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Campo de formulário reutilizável com label e tratamento de erro
 */
const FormField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...inputProps
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id || name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={error ? 'border-red-500 focus:border-red-500' : ''}
        data-testid={`input-${name}`}
        {...inputProps}
      />
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm" data-testid={`error-${name}`}>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FormField;
import React from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Botão de submit com loading state
 */
const SubmitButton = ({
  loading = false,
  disabled = false,
  children,
  loadingText = 'Carregando...',
  className = 'w-full',
  variant = 'default',
  ...buttonProps
}) => {
  return (
    <Button
      type="submit"
      disabled={loading || disabled}
      className={className}
      variant={variant}
      data-testid="submit-button"
      {...buttonProps}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
};

export default SubmitButton;
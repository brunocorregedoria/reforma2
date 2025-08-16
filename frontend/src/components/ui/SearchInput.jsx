import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Componente de busca otimizado com debounce
 */
const SearchInput = React.memo(({
  placeholder = 'Buscar...',
  onSearch,
  debounceMs = 300,
  className = '',
  showClearButton = true,
  autoFocus = false,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Trigger search when debounced term changes
  React.useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  const handleInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`relative ${className}`} data-testid="search-input">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      
      <Input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-10"
        autoFocus={autoFocus}
        data-testid="search-input-field"
        {...props}
      />
      
      {showClearButton && searchTerm && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0"
            data-testid="search-clear-button"
            aria-label="Limpar busca"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
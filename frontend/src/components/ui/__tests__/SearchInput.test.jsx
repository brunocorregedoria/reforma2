import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchInput from '../SearchInput'

describe('SearchInput', () => {
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should render correctly', () => {
    render(<SearchInput onSearch={mockOnSearch} />)
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
    expect(screen.getByTestId('search-input-field')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('should render with custom placeholder', () => {
    render(<SearchInput placeholder="Pesquisar projetos..." onSearch={mockOnSearch} />)
    
    expect(screen.getByPlaceholderText('Pesquisar projetos...')).toBeInTheDocument()
  })

  it('should call onSearch after debounce delay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(<SearchInput onSearch={mockOnSearch} debounceMs={300} />)
    
    const input = screen.getByTestId('search-input-field')
    await user.type(input, 'test search')
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Fast forward time
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test search')
    })
  })

  it('should show clear button when there is text', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input-field')
    
    // No clear button initially
    expect(screen.queryByTestId('search-clear-button')).not.toBeInTheDocument()
    
    await user.type(input, 'test')
    
    // Clear button should appear
    expect(screen.getByTestId('search-clear-button')).toBeInTheDocument()
  })

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input-field')
    await user.type(input, 'test')
    
    const clearButton = screen.getByTestId('search-clear-button')
    await user.click(clearButton)
    
    expect(input).toHaveValue('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('should clear search when Escape key is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input-field')
    await user.type(input, 'test')
    
    await user.keyboard('{Escape}')
    
    expect(input).toHaveValue('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('should not show clear button when showClearButton is false', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(<SearchInput onSearch={mockOnSearch} showClearButton={false} />)
    
    const input = screen.getByTestId('search-input-field')
    await user.type(input, 'test')
    
    expect(screen.queryByTestId('search-clear-button')).not.toBeInTheDocument()
  })

  it('should debounce rapid typing', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    render(<SearchInput onSearch={mockOnSearch} debounceMs={300} />)
    
    const input = screen.getByTestId('search-input-field')
    
    // Rapid typing
    await user.type(input, 't')
    vi.advanceTimersByTime(100)
    
    await user.type(input, 'e')
    vi.advanceTimersByTime(100)
    
    await user.type(input, 's')
    vi.advanceTimersByTime(100)
    
    await user.type(input, 't')
    
    // Should not have called onSearch yet
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Complete debounce delay
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test')
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
    })
  })

  it('should have autofocus when autoFocus prop is true', () => {
    render(<SearchInput onSearch={mockOnSearch} autoFocus />)
    
    const input = screen.getByTestId('search-input-field')
    expect(input).toHaveFocus()
  })

  it('should pass through additional props', () => {
    render(
      <SearchInput 
        onSearch={mockOnSearch} 
        className="custom-class"
        disabled
      />
    )
    
    const container = screen.getByTestId('search-input')
    const input = screen.getByTestId('search-input-field')
    
    expect(container).toHaveClass('custom-class')
    expect(input).toBeDisabled()
  })
})
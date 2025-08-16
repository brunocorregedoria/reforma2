import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormField from '../FormField'

describe('FormField', () => {
  const defaultProps = {
    name: 'email',
    label: 'Email',
    value: '',
    onChange: vi.fn()
  }

  it('should render label and input correctly', () => {
    render(<FormField {...defaultProps} />)
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
  })

  it('should show required asterisk when required', () => {
    render(<FormField {...defaultProps} required />)
    
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should display error message when error exists', () => {
    render(<FormField {...defaultProps} error="Email is required" />)
    
    expect(screen.getByTestId('error-email')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('should apply error styling when error exists', () => {
    render(<FormField {...defaultProps} error="Email is required" />)
    
    const input = screen.getByTestId('input-email')
    expect(input).toHaveClass('border-red-500')
  })

  it('should call onChange when input value changes', () => {
    const mockOnChange = vi.fn()
    render(<FormField {...defaultProps} onChange={mockOnChange} />)
    
    const input = screen.getByTestId('input-email')
    fireEvent.change(input, { target: { value: 'test@test.com' } })
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should disable input when disabled prop is true', () => {
    render(<FormField {...defaultProps} disabled />)
    
    const input = screen.getByTestId('input-email')
    expect(input).toBeDisabled()
  })

  it('should render different input types correctly', () => {
    render(<FormField {...defaultProps} type="password" />)
    
    const input = screen.getByTestId('input-email')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should use custom id when provided', () => {
    render(<FormField {...defaultProps} id="custom-id" />)
    
    const input = screen.getByTestId('input-email')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  it('should pass through additional input props', () => {
    render(
      <FormField 
        {...defaultProps} 
        placeholder="Enter email" 
        maxLength={50}
      />
    )
    
    const input = screen.getByTestId('input-email')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
    expect(input).toHaveAttribute('maxLength', '50')
  })
})
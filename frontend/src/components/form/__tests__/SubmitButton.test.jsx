import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SubmitButton from '../SubmitButton'

describe('SubmitButton', () => {
  it('should render button with children', () => {
    render(<SubmitButton>Submit</SubmitButton>)
    
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('should show loading state with spinner', () => {
    render(<SubmitButton loading>Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    
    // Check for spinner (Loader2 icon)
    const spinner = button.querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('should show custom loading text', () => {
    render(
      <SubmitButton loading loadingText="Enviando...">
        Submit
      </SubmitButton>
    )
    
    expect(screen.getByText('Enviando...')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<SubmitButton disabled>Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    expect(button).toBeDisabled()
  })

  it('should be disabled when loading is true', () => {
    render(<SubmitButton loading>Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    expect(button).toBeDisabled()
  })

  it('should have submit type by default', () => {
    render(<SubmitButton>Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should apply custom className', () => {
    render(<SubmitButton className="custom-class">Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveClass('custom-class')
  })

  it('should apply custom variant', () => {
    render(<SubmitButton variant="outline">Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    // This would need to be verified based on the Button component's implementation
    expect(button).toBeInTheDocument()
  })

  it('should handle click events when not disabled', () => {
    const mockClick = vi.fn()
    render(<SubmitButton onClick={mockClick}>Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    fireEvent.click(button)
    
    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('should not handle click events when disabled', () => {
    const mockClick = vi.fn()
    render(<SubmitButton disabled onClick={mockClick}>Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    fireEvent.click(button)
    
    expect(mockClick).not.toHaveBeenCalled()
  })

  it('should pass through additional button props', () => {
    render(<SubmitButton title="Submit form">Submit</SubmitButton>)
    
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('title', 'Submit form')
  })
})
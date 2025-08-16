import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FolderOpen } from 'lucide-react'
import StatCard from '../StatCard'

describe('StatCard', () => {
  const defaultProps = {
    title: 'Projetos Ativos',
    value: 8,
    icon: FolderOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  }

  it('should render with required props', () => {
    render(<StatCard {...defaultProps} />)
    
    expect(screen.getByTestId('stat-card')).toBeInTheDocument()
    expect(screen.getByTestId('stat-title')).toHaveTextContent('Projetos Ativos')
    expect(screen.getByTestId('stat-value')).toHaveTextContent('8')
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument()
  })

  it('should render with total when provided', () => {
    render(<StatCard {...defaultProps} total={12} />)
    
    expect(screen.getByTestId('stat-total')).toHaveTextContent('de 12 total')
  })

  it('should not render total when not provided', () => {
    render(<StatCard {...defaultProps} />)
    
    expect(screen.queryByTestId('stat-total')).not.toBeInTheDocument()
  })

  it('should handle string values', () => {
    render(<StatCard {...defaultProps} value="R$ 15.000" />)
    
    expect(screen.getByTestId('stat-value')).toHaveTextContent('R$ 15.000')
  })

  it('should apply custom className', () => {
    render(<StatCard {...defaultProps} className="custom-class" />)
    
    const card = screen.getByTestId('stat-card')
    expect(card).toHaveClass('custom-class')
  })

  it('should apply icon colors correctly', () => {
    render(<StatCard {...defaultProps} />)
    
    const icon = screen.getByTestId('stat-icon')
    expect(icon).toHaveClass('text-blue-600')
  })

  it('should have proper accessibility attributes', () => {
    render(<StatCard {...defaultProps} />)
    
    const icon = screen.getByTestId('stat-icon')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should handle zero values', () => {
    render(<StatCard {...defaultProps} value={0} total={0} />)
    
    expect(screen.getByTestId('stat-value')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-total')).toHaveTextContent('de 0 total')
  })
})
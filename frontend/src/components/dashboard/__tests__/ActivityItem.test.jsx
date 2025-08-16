import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityItem from '../ActivityItem'

describe('ActivityItem', () => {
  const mockActivity = {
    title: 'Projeto Casa Silva iniciado',
    time: '2 horas atrás',
    status: 'success'
  }

  it('should render activity with all information', () => {
    render(<ActivityItem activity={mockActivity} />)
    
    expect(screen.getByTestId('activity-item')).toBeInTheDocument()
    expect(screen.getByTestId('activity-title')).toHaveTextContent('Projeto Casa Silva iniciado')
    expect(screen.getByTestId('activity-time')).toHaveTextContent('2 horas atrás')
    expect(screen.getByTestId('activity-icon')).toBeInTheDocument()
  })

  it('should render correct icon for success status', () => {
    render(<ActivityItem activity={{ ...mockActivity, status: 'success' }} />)
    
    const icon = screen.getByTestId('activity-icon').querySelector('svg')
    expect(icon).toHaveClass('text-green-500')
  })

  it('should render correct icon for warning status', () => {
    render(<ActivityItem activity={{ ...mockActivity, status: 'warning' }} />)
    
    const icon = screen.getByTestId('activity-icon').querySelector('svg')
    expect(icon).toHaveClass('text-orange-500')
  })

  it('should render correct icon for error status', () => {
    render(<ActivityItem activity={{ ...mockActivity, status: 'error' }} />)
    
    const icon = screen.getByTestId('activity-icon').querySelector('svg')
    expect(icon).toHaveClass('text-red-500')
  })

  it('should render correct icon for info status', () => {
    render(<ActivityItem activity={{ ...mockActivity, status: 'info' }} />)
    
    const icon = screen.getByTestId('activity-icon').querySelector('svg')
    expect(icon).toHaveClass('text-blue-500')
  })

  it('should render default icon when status is not provided', () => {
    const activityWithoutStatus = {
      title: 'Test Activity',
      time: '1 hour ago'
    }
    
    render(<ActivityItem activity={activityWithoutStatus} />)
    
    const icon = screen.getByTestId('activity-icon').querySelector('svg')
    expect(icon).toHaveClass('text-blue-500')
  })

  it('should truncate long titles', () => {
    const longTitle = 'Este é um título muito longo que deveria ser truncado para não quebrar o layout do componente'
    
    render(<ActivityItem activity={{ ...mockActivity, title: longTitle }} />)
    
    const titleElement = screen.getByTestId('activity-title')
    expect(titleElement).toHaveClass('truncate')
    expect(titleElement).toHaveAttribute('title', longTitle)
  })

  it('should apply custom className', () => {
    render(<ActivityItem activity={mockActivity} className="custom-class" />)
    
    const item = screen.getByTestId('activity-item')
    expect(item).toHaveClass('custom-class')
  })

  it('should handle missing time gracefully', () => {
    const activityWithoutTime = {
      title: 'Test Activity',
      time: '',
      status: 'info'
    }
    
    render(<ActivityItem activity={activityWithoutTime} />)
    
    expect(screen.getByTestId('activity-time')).toHaveTextContent('')
  })
})
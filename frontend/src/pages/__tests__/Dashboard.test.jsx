import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '../Dashboard'

// Mock hooks
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

vi.mock('../../hooks/useDashboardData', () => ({
  useDashboardData: vi.fn()
}))

import { useAuth } from '../../contexts/AuthContext'
import { useDashboardData } from '../../hooks/useDashboardData'

describe('Dashboard', () => {
  const mockUser = { nome: 'João Silva' }
  const mockRefreshData = vi.fn()

  const mockDashboardData = {
    statsCards: [
      {
        title: 'Projetos Ativos',
        value: 8,
        total: 12,
        icon: 'FolderOpen',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Ordens Pendentes',
        value: 18,
        total: 45,
        icon: 'ClipboardList',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ],
    projectStats: {
      em_andamento: 8,
      planejado: 3,
      concluido: 1,
      pausado: 0
    },
    recentActivities: [
      {
        id: 1,
        type: 'project',
        title: 'Projeto Casa Silva iniciado',
        time: '2 horas atrás',
        status: 'success'
      }
    ],
    loading: false,
    error: null,
    refreshData: mockRefreshData
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: mockUser })
    useDashboardData.mockReturnValue(mockDashboardData)
  })

  it('should render dashboard with user greeting', () => {
    render(<Dashboard />)
    
    expect(screen.getByText(/João Silva!/)).toBeInTheDocument()
    expect(screen.getByText(/Aqui está um resumo das suas atividades/)).toBeInTheDocument()
  })

  it('should display stats cards', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Projetos Ativos')).toBeInTheDocument()
    expect(screen.getAllByText('8')).toHaveLength(2) // StatCard e ProjectStatusCard
    expect(screen.getByText('de 12 total')).toBeInTheDocument()
    
    expect(screen.getByText('Ordens Pendentes')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('de 45 total')).toBeInTheDocument()
  })

  it('should display recent activities', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Atividades Recentes')).toBeInTheDocument()
    expect(screen.getByText('Projeto Casa Silva iniciado')).toBeInTheDocument()
    expect(screen.getByText('2 horas atrás')).toBeInTheDocument()
  })

  it('should display project status card', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Status dos Projetos')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    useDashboardData.mockReturnValue({
      ...mockDashboardData,
      loading: true
    })

    render(<Dashboard />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should show error state with retry button', async () => {
    const user = userEvent.setup()
    
    useDashboardData.mockReturnValue({
      ...mockDashboardData,
      loading: false,
      error: 'Erro ao carregar dados'
    })

    render(<Dashboard />)
    
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Tentar Novamente')
    expect(retryButton).toBeInTheDocument()
    
    await user.click(retryButton)
    expect(mockRefreshData).toHaveBeenCalled()
  })

  it('should call refreshData when refresh button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<Dashboard />)
    
    const refreshButton = screen.getByText('Atualizar')
    await user.click(refreshButton)
    
    expect(mockRefreshData).toHaveBeenCalled()
  })

  it('should display correct greeting based on time', () => {
    // Mock morning time
    const mockDate = new Date('2023-01-01T10:00:00')
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate)

    render(<Dashboard />)
    
    expect(screen.getByText(/Bom dia, João Silva!/)).toBeInTheDocument()
    
    vi.restoreAllMocks()
  })
})
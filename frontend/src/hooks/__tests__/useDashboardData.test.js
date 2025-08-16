import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardData } from '../useDashboardData'

// Mock API
vi.mock('../../lib/api', () => ({
  projectsAPI: {
    getAll: vi.fn()
  }
}))

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock setTimeout para acelerar os testes
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDashboardData())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.stats).toEqual({
      totalProjects: 0,
      activeProjects: 0,
      totalWorkOrders: 0,
      pendingWorkOrders: 0,
      totalCost: 0,
      completedTasks: 0
    })
    expect(result.current.projectStats).toEqual({
      em_andamento: 0,
      planejado: 0,
      concluido: 0,
      pausado: 0,
      cancelado: 0
    })
    expect(result.current.recentActivities).toEqual([])
  })

  it('should load dashboard data successfully', async () => {
    const { result } = renderHook(() => useDashboardData())
    
    // Avançar o timer para simular o delay
    vi.advanceTimersByTime(500)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    expect(result.current.error).toBeNull()
    expect(result.current.stats.totalProjects).toBe(12)
    expect(result.current.stats.activeProjects).toBe(8)
    expect(result.current.projectStats.em_andamento).toBe(8)
    expect(result.current.recentActivities).toHaveLength(4)
  })

  it('should provide correct statsCards data', async () => {
    const { result } = renderHook(() => useDashboardData())
    
    vi.advanceTimersByTime(500)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    const { statsCards } = result.current
    
    expect(statsCards).toHaveLength(4)
    expect(statsCards[0]).toEqual({
      title: 'Projetos Ativos',
      value: 8,
      total: 12,
      icon: 'FolderOpen',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    })
    expect(statsCards[2].value).toBe('R$ 125.000')
  })

  it('should provide recent activities with correct structure', async () => {
    const { result } = renderHook(() => useDashboardData())
    
    vi.advanceTimersByTime(500)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 10000 })

    const { recentActivities } = result.current
    
    expect(recentActivities).toHaveLength(4)
    expect(recentActivities[0]).toEqual({
      id: 1,
      type: 'project',
      title: 'Projeto Casa Silva iniciado',
      time: '2 horas atrás',
      status: 'success'
    })
  })

  it('should handle refresh data', async () => {
    const { result } = renderHook(() => useDashboardData())
    
    // Aguardar carregamento inicial
    vi.advanceTimersByTime(500)
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 10000 })

    // Chamar refresh
    result.current.refreshData()
    
    expect(result.current.loading).toBe(true)
    
    vi.advanceTimersByTime(500)
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 10000 })
  })
})
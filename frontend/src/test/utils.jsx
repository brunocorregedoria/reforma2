import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 1,
  nome: 'Test User',
  email: 'test@example.com',
  role: 'admin',
  ...overrides
})

export const createMockProject = (overrides = {}) => ({
  id: 1,
  nome: 'Test Project',
  cliente: 'Test Client',
  status: 'planejado',
  endereco: 'Test Address',
  descricao: 'Test Description',
  data_inicio: '2025-01-01',
  data_previsao_fim: '2025-12-31',
  ...overrides
})

export const createMockWorkOrder = (overrides = {}) => ({
  id: 1,
  project_id: 1,
  titulo: 'Test Work Order',
  descricao: 'Test Description',
  tipo_servico: 'test',
  status: 'planejada',
  responsavel_id: 1,
  custo_estimado: 1000,
  custo_real: 0,
  ...overrides
})

// Wrapper for components that need routing and auth
export const AllTheProviders = ({ children, user = null }) => {
  const mockAuth = {
    user,
    token: user ? 'mock-token' : null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    hasPermission: vi.fn(() => true),
    isAuthenticated: !!user,
  }

  return (
    <BrowserRouter>
      <AuthProvider value={mockAuth}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

export const renderWithProviders = (ui, options = {}) => {
  const { user = createMockUser(), ...renderOptions } = options

  const Wrapper = ({ children }) => (
    <AllTheProviders user={user}>{children}</AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock API responses
export const mockApiResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
})

export const mockApiError = (message = 'API Error', status = 500) => {
  const error = new Error(message)
  error.response = {
    data: { error: message },
    status,
    statusText: 'Error',
  }
  return error
}
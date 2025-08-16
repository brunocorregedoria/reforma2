import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../Login'

// Mock hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
    Navigate: ({ to }) => <div data-testid="navigate-to">{to}</div>
  }
})

import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const LoginWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Login', () => {
  const mockLogin = vi.fn()
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false
    })
    useNavigate.mockReturnValue(mockNavigate)
  })

  it('should render login form correctly', () => {
    render(<Login />, { wrapper: LoginWrapper })
    
    expect(screen.getByTestId('auth-title')).toHaveTextContent('Entrar na sua conta')
    expect(screen.getByTestId('auth-description')).toHaveTextContent('Digite suas credenciais')
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-password')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should redirect when user is already authenticated', () => {
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true
    })

    render(<Login />, { wrapper: LoginWrapper })
    
    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/')
  })

  it('should display register link', () => {
    render(<Login />, { wrapper: LoginWrapper })
    
    const registerLink = screen.getByTestId('register-link')
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveTextContent('Criar conta')
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })

    render(<Login />, { wrapper: LoginWrapper })
    
    const emailInput = screen.getByTestId('input-email')
    const passwordInput = screen.getByTestId('input-password')
    const submitButton = screen.getByTestId('submit-button')

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('should handle login error', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ 
      success: false, 
      error: 'Credenciais inválidas' 
    })

    render(<Login />, { wrapper: LoginWrapper })
    
    const emailInput = screen.getByTestId('input-email')
    const passwordInput = screen.getByTestId('input-password')
    const submitButton = screen.getByTestId('submit-button')

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('general-error')).toBeInTheDocument()
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(<Login />, { wrapper: LoginWrapper })
    
    const submitButton = screen.getByTestId('submit-button')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('error-email')).toBeInTheDocument()
      expect(screen.getByTestId('error-password')).toBeInTheDocument()
    })

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()

    render(<Login />, { wrapper: LoginWrapper })
    
    const emailInput = screen.getByTestId('input-email')
    const passwordInput = screen.getByTestId('input-password')
    const submitButton = screen.getByTestId('submit-button')

    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('error-email')).toBeInTheDocument()
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should validate password minimum length', async () => {
    const user = userEvent.setup()

    render(<Login />, { wrapper: LoginWrapper })
    
    const emailInput = screen.getByTestId('input-email')
    const passwordInput = screen.getByTestId('input-password')
    const submitButton = screen.getByTestId('submit-button')

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('error-password')).toBeInTheDocument()
      expect(screen.getByText(/6 caracteres/)).toBeInTheDocument()
    })

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should navigate to register when register link is clicked', async () => {
    const user = userEvent.setup()

    render(<Login />, { wrapper: LoginWrapper })
    
    const registerLink = screen.getByTestId('register-link')
    await user.click(registerLink)

    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    mockLogin.mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 100)
      )
    )

    render(<Login />, { wrapper: LoginWrapper })
    
    const emailInput = screen.getByTestId('input-email')
    const passwordInput = screen.getByTestId('input-password')
    const submitButton = screen.getByTestId('submit-button')

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Should show loading state
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()

    // Wait for completion
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })
})
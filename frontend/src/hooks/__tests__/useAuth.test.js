import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { authAPI } from '../../lib/api'

// Mock API
vi.mock('../../lib/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn()
  }
}))

// Mock useLocalStorage
vi.mock('../useLocalStorage', () => ({
  useLocalStorage: vi.fn()
}))

import { useLocalStorage } from '../useLocalStorage'

describe('useAuth', () => {
  const mockSetToken = vi.fn()
  const mockRemoveToken = vi.fn()
  const mockSetUserData = vi.fn()
  const mockRemoveUserData = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useLocalStorage para token e userData
    useLocalStorage.mockImplementation((key, defaultValue) => {
      if (key === 'token') {
        return [null, mockSetToken, mockRemoveToken]
      }
      if (key === 'user') {
        return [null, mockSetUserData, mockRemoveUserData]
      }
      return [defaultValue, vi.fn(), vi.fn()]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with no user and loading state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(true)
  })

  it('should set user when token and userData exist', async () => {
    const mockUser = { id: 1, name: 'Test User' }
    const mockToken = 'test-token'

    // Específico mock para este teste
    useLocalStorage.mockImplementation((key, defaultValue) => {
      if (key === 'token') {
        return [mockToken, mockSetToken, mockRemoveToken]
      }
      if (key === 'user') {
        return [mockUser, mockSetUserData, mockRemoveUserData]
      }
      return [defaultValue, vi.fn(), vi.fn()]
    })

    authAPI.getProfile.mockResolvedValue({ data: { user: mockUser } })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle login successfully', async () => {
    const credentials = { email: 'test@test.com', password: 'password' }
    const mockResponse = {
      data: {
        token: 'new-token',
        user: { id: 1, name: 'Test User' }
      }
    }

    authAPI.login.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth())

    let loginResult
    await act(async () => {
      loginResult = await result.current.login(credentials)
    })

    expect(authAPI.login).toHaveBeenCalledWith(credentials)
    expect(mockSetToken).toHaveBeenCalledWith('new-token')
    expect(mockSetUserData).toHaveBeenCalledWith(mockResponse.data.user)
    expect(loginResult.success).toBe(true)
  })

  it('should handle login error', async () => {
    const credentials = { email: 'test@test.com', password: 'wrong' }
    const errorResponse = {
      response: { data: { error: 'Invalid credentials' } }
    }

    authAPI.login.mockRejectedValue(errorResponse)

    const { result } = renderHook(() => useAuth())

    let loginResult
    await act(async () => {
      loginResult = await result.current.login(credentials)
    })

    expect(loginResult.success).toBe(false)
    expect(loginResult.error).toBe('Invalid credentials')
  })

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.logout()
    })

    expect(mockRemoveToken).toHaveBeenCalled()
    expect(mockRemoveUserData).toHaveBeenCalled()
  })

  it('should check permissions correctly', async () => {
    const mockUser = { id: 1, name: 'Test User', role: 'admin' }

    useLocalStorage.mockImplementation((key, defaultValue) => {
      if (key === 'token') {
        return ['token', mockSetToken, mockRemoveToken]
      }
      if (key === 'user') {
        return [mockUser, mockSetUserData, mockRemoveUserData]
      }
      return [defaultValue, vi.fn(), vi.fn()]
    })

    authAPI.getProfile.mockResolvedValue({ data: { user: mockUser } })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    expect(result.current.hasPermission(['admin'])).toBe(true)
    expect(result.current.hasPermission(['user'])).toBe(false)
    expect(result.current.hasPermission([])).toBe(true)
  })
})
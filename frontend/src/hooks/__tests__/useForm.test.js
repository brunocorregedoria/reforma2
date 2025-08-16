import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm } from '../useForm'

describe('useForm', () => {
  const initialValues = { email: '', password: '' }
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.loading).toBe(false)
    expect(result.current.hasErrors).toBe(false)
  })

  it('should handle input changes', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@test.com', type: 'text' }
      })
    })

    expect(result.current.values.email).toBe('test@test.com')
  })

  it('should handle checkbox changes', () => {
    const { result } = renderHook(() => useForm({ agree: false }))
    
    act(() => {
      result.current.handleChange({
        target: { name: 'agree', checked: true, type: 'checkbox' }
      })
    })

    expect(result.current.values.agree).toBe(true)
  })

  it('should validate required fields', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    let isValid
    act(() => {
      isValid = result.current.validateField('email', '', { required: true })
    })
    
    expect(isValid).toBe(false)
    expect(result.current.errors.email).toBeTruthy()
  })

  it('should validate email format', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    let isValid
    act(() => {
      isValid = result.current.validateField('email', 'invalid-email', { 
        required: true, 
        email: true 
      })
    })
    
    expect(isValid).toBe(false)
    expect(result.current.errors.email).toContain('inválido')
  })

  it('should validate minimum length', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    let isValid
    act(() => {
      isValid = result.current.validateField('password', '123', { 
        required: true, 
        minLength: 6 
      })
    })
    
    expect(isValid).toBe(false)
    expect(result.current.errors.password).toContain('6 caracteres')
  })

  it('should validate form with multiple rules', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    const validationRules = {
      email: { required: true, email: true },
      password: { required: true, minLength: 6 }
    }
    
    let isValid
    act(() => {
      isValid = result.current.validateForm(validationRules)
    })
    
    expect(isValid).toBe(false)
    expect(result.current.hasErrors).toBe(true)
  })

  it('should handle form submission successfully', async () => {
    mockOnSubmit.mockResolvedValue({ success: true })
    
    const { result } = renderHook(() => useForm(initialValues, mockOnSubmit))
    
    // Preencher valores válidos
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@test.com', type: 'text' }
      })
      result.current.handleChange({
        target: { name: 'password', value: 'password123', type: 'password' }
      })
    })

    let submitResult
    await act(async () => {
      submitResult = await result.current.handleSubmit(
        { preventDefault: vi.fn() },
        {
          email: { required: true, email: true },
          password: { required: true, minLength: 6 }
        }
      )
    })

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    })
    expect(submitResult.success).toBe(true)
  })

  it('should handle form submission errors', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Submit failed'))
    
    const { result } = renderHook(() => useForm(initialValues, mockOnSubmit))
    
    // Preencher valores válidos
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@test.com', type: 'text' }
      })
      result.current.handleChange({
        target: { name: 'password', value: 'password123', type: 'password' }
      })
    })

    let submitResult
    await act(async () => {
      submitResult = await result.current.handleSubmit(
        { preventDefault: vi.fn() },
        {
          email: { required: true, email: true },
          password: { required: true, minLength: 6 }
        }
      )
    })

    expect(submitResult.success).toBe(false)
    expect(submitResult.error).toContain('Submit failed')
  })

  it('should reset form to initial values', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    // Alterar valores
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@test.com', type: 'text' }
      })
      result.current.setFormErrors({ email: 'Some error' })
    })

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.loading).toBe(false)
  })

  it('should set field values programmatically', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    act(() => {
      result.current.setFieldValue('email', 'programmatic@test.com')
    })

    expect(result.current.values.email).toBe('programmatic@test.com')
  })

  it('should clear errors when user types in field with error', () => {
    const { result } = renderHook(() => useForm(initialValues))
    
    // Definir erro
    act(() => {
      result.current.setFieldError('email', 'Email is required')
    })

    expect(result.current.errors.email).toBeTruthy()

    // Digitar no campo
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 't', type: 'text' }
      })
    })

    expect(result.current.errors.email).toBe('')
  })
})
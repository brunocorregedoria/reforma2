import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should return default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
  })

  it('should return stored value when localStorage has data', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '"new-value"')
  })

  it('should support function updates like useState', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0))
    
    act(() => {
      result.current[1](prev => prev + 1)
    })
    
    expect(result.current[0]).toBe(1)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '1')
  })

  it('should remove item when setValue is called with undefined', () => {
    localStorageMock.setItem('test-key', '"some-value"')
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    act(() => {
      result.current[1](undefined)
    })
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
  })

  it('should remove value and reset to default when removeValue is called', () => {
    localStorageMock.setItem('test-key', '"stored-value"')
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    act(() => {
      result.current[2]() // removeValue
    })
    
    expect(result.current[0]).toBe('default')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
  })

  it('should handle complex objects', () => {
    const complexObject = { name: 'Test', items: [1, 2, 3] }
    const { result } = renderHook(() => useLocalStorage('test-key', {}))
    
    act(() => {
      result.current[1](complexObject)
    })
    
    expect(result.current[0]).toEqual(complexObject)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key', 
      JSON.stringify(complexObject)
    )
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'changed', delay: 500 })
    
    // Should still be initial value before delay
    expect(result.current).toBe('initial')

    // Fast forward time but not quite enough
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe('initial')

    // Fast forward past delay
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('changed')
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Rapid changes
    rerender({ value: 'change1', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    rerender({ value: 'change2', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Should still be initial because timer was reset
    expect(result.current).toBe('initial')
    
    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current).toBe('change2')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'changed', delay: 1000 })
    
    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(result.current).toBe('initial')
    
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('changed')
  })

  it('should work with non-string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 100 } }
    )

    expect(result.current).toBe(42)

    rerender({ value: 100, delay: 100 })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current).toBe(100)
  })
})
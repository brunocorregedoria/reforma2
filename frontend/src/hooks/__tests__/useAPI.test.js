import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAPI, useCRUD } from '../useAPI'

// Mock api
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

import api from '../../lib/api'

describe('useAPI', () => {
  const mockApiCall = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAPI(mockApiCall))
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle successful API call', async () => {
    const mockResponse = { data: { id: 1, name: 'Test' } }
    mockApiCall.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAPI(mockApiCall))

    let executeResult
    await act(async () => {
      executeResult = await result.current.execute('param1', 'param2')
    })

    expect(mockApiCall).toHaveBeenCalledWith('param1', 'param2')
    expect(result.current.data).toEqual(mockResponse.data)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(executeResult.success).toBe(true)
    expect(executeResult.data).toEqual(mockResponse.data)
  })

  it('should handle API call error', async () => {
    const mockError = {
      response: { data: { error: 'API Error' } }
    }
    mockApiCall.mockRejectedValue(mockError)

    const { result } = renderHook(() => useAPI(mockApiCall))

    let executeResult
    await act(async () => {
      executeResult = await result.current.execute()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('API Error')
    expect(executeResult.success).toBe(false)
    expect(executeResult.error).toBe('API Error')
  })

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useAPI(mockApiCall))

    // Primeiro definir algum estado
    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})

describe('useCRUD', () => {
  const endpoint = '/test-endpoint'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useCRUD(endpoint))
    
    expect(result.current.items).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle getAll successfully', async () => {
    const mockResponse = {
      data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]
    }
    api.get.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCRUD(endpoint))

    let getAllResult
    await act(async () => {
      getAllResult = await result.current.getAll()
    })

    expect(api.get).toHaveBeenCalledWith(endpoint, { params: {} })
    expect(result.current.items).toEqual(mockResponse.data)
    expect(getAllResult.success).toBe(true)
  })

  it('should handle create successfully', async () => {
    const newItem = { name: 'New Item' }
    const mockResponse = {
      data: { id: 3, ...newItem }
    }
    api.post.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCRUD(endpoint))

    let createResult
    await act(async () => {
      createResult = await result.current.create(newItem)
    })

    expect(api.post).toHaveBeenCalledWith(endpoint, newItem)
    expect(result.current.items).toContainEqual(mockResponse.data)
    expect(createResult.success).toBe(true)
    expect(createResult.data).toEqual(mockResponse.data)
  })

  it('should handle update successfully', async () => {
    const itemId = 1
    const updateData = { name: 'Updated Item' }
    const mockResponse = {
      data: { id: itemId, ...updateData }
    }
    api.put.mockResolvedValue(mockResponse)

    // Primeiro adicionar um item à lista
    const { result } = renderHook(() => useCRUD(endpoint))
    
    act(() => {
      result.current.setItems([{ id: 1, name: 'Original Item' }])
    })

    let updateResult
    await act(async () => {
      updateResult = await result.current.update(itemId, updateData)
    })

    expect(api.put).toHaveBeenCalledWith(`${endpoint}/${itemId}`, updateData)
    expect(updateResult.success).toBe(true)
    expect(result.current.items[0]).toEqual(expect.objectContaining(updateData))
  })

  it('should handle remove successfully', async () => {
    const itemId = 1
    api.delete.mockResolvedValue({})

    const { result } = renderHook(() => useCRUD(endpoint))
    
    // Primeiro adicionar um item à lista
    act(() => {
      result.current.setItems([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ])
    })

    let removeResult
    await act(async () => {
      removeResult = await result.current.remove(itemId)
    })

    expect(api.delete).toHaveBeenCalledWith(`${endpoint}/${itemId}`)
    expect(removeResult.success).toBe(true)
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe(2)
  })

  it('should handle CRUD errors', async () => {
    const mockError = {
      response: { data: { error: 'CRUD Error' } }
    }
    api.get.mockRejectedValue(mockError)

    const { result } = renderHook(() => useCRUD(endpoint))

    let getAllResult
    await act(async () => {
      getAllResult = await result.current.getAll()
    })

    expect(getAllResult.success).toBe(false)
    expect(getAllResult.error).toBe('CRUD Error')
    expect(result.current.error).toBe('CRUD Error')
  })
})
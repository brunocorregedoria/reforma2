import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test component
const TestComponent = () => <div>Test Component</div>

describe('Test Setup', () => {
  it('should render a simple component', () => {
    render(<TestComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('should have testing utilities available', () => {
    expect(vi).toBeDefined()
    expect(screen).toBeDefined()
    expect(render).toBeDefined()
  })
})
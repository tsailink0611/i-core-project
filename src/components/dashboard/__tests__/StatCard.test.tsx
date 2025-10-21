import React from 'react'
import { render, screen } from '@/lib/test-utils'
import { StatCard } from '../StatCard'

describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: 1234,
    subtitle: 'Test subtitle',
  }

  it('renders with basic props', () => {
    render(<StatCard {...defaultProps} />)

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('Test subtitle')).toBeInTheDocument()
  })

  it('formats numbers correctly', () => {
    render(<StatCard title="Count" value={1234567} />)
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('displays string values as-is', () => {
    render(<StatCard title="Rate" value="15.5%" />)
    expect(screen.getByText('15.5%')).toBeInTheDocument()
  })

  it('renders with different colors', () => {
    const colors = ['blue', 'green', 'yellow', 'purple', 'red'] as const

    colors.forEach(color => {
      const { container, unmount } = render(
        <StatCard title="Test" value={100} color={color} />
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass(`bg-${color}-50`, `border-${color}-200`, `text-${color}-800`)
      unmount()
    })
  })

  it('renders with icon', () => {
    render(
      <StatCard
        title="Test"
        value={100}
        icon={<span data-testid="test-icon">📊</span>}
      />
    )

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('displays trend indicator correctly', () => {
    const positiveTrend = { value: 5.2, isPositive: true }
    const { rerender } = render(
      <StatCard title="Test" value={100} trend={positiveTrend} />
    )

    expect(screen.getByText('↗')).toBeInTheDocument()
    expect(screen.getByText('5.2%')).toBeInTheDocument()
    expect(screen.getByText('5.2%').closest('div')).toHaveClass('text-green-600')

    const negativeTrend = { value: -3.1, isPositive: false }
    rerender(<StatCard title="Test" value={100} trend={negativeTrend} />)

    expect(screen.getByText('↘')).toBeInTheDocument()
    expect(screen.getByText('3.1%')).toBeInTheDocument()
    expect(screen.getByText('3.1%').closest('div')).toHaveClass('text-red-600')
  })

  it('renders without optional props', () => {
    render(<StatCard title="Minimal" value={42} />)

    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
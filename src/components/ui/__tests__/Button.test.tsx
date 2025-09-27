import { render, user, getByRole } from '@/lib/test-utils'
import { Button } from '../Button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600', 'text-white')
  })

  it('renders with different variants', () => {
    const variants = [
      { variant: 'default' as const, expectedClass: 'bg-blue-600' },
      { variant: 'destructive' as const, expectedClass: 'bg-red-600' },
      { variant: 'outline' as const, expectedClass: 'border-gray-300' },
      { variant: 'secondary' as const, expectedClass: 'bg-gray-100' },
      { variant: 'ghost' as const, expectedClass: 'hover:bg-gray-100' },
      { variant: 'link' as const, expectedClass: 'underline-offset-4' },
    ]

    variants.forEach(({ variant, expectedClass }) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>)
      const button = getByRole('button')
      expect(button).toHaveClass(expectedClass)
      unmount()
    })
  })

  it('renders with different sizes', () => {
    const sizes = [
      { size: 'default' as const, expectedClass: 'h-10' },
      { size: 'sm' as const, expectedClass: 'h-9' },
      { size: 'lg' as const, expectedClass: 'h-11' },
      { size: 'icon' as const, expectedClass: 'h-10 w-10' },
    ]

    sizes.forEach(({ size, expectedClass }) => {
      const { unmount } = render(<Button size={size}>Test</Button>)
      const button = getByRole('button')
      expect(button).toHaveClass(expectedClass)
      unmount()
    })
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = getByRole('button')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled button</Button>)
    const button = getByRole('button')

    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none')
  })

  it('accepts custom className', () => {
    render(<Button className="custom-class">Test</Button>)
    const button = getByRole('button')

    expect(button).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Test</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
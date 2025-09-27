# Component Documentation

## Overview

L-Core provides a comprehensive component library built with React, TypeScript, and Tailwind CSS. Components are designed to be reusable, accessible, and consistent across the application.

## Design System

### Color Palette

```typescript
const colors = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af'
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
}
```

### Typography Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Captions, labels |
| `text-sm` | 14px | 20px | Body text, small |
| `text-base` | 16px | 24px | Body text, default |
| `text-lg` | 18px | 28px | Large body text |
| `text-xl` | 20px | 28px | Small headings |
| `text-2xl` | 24px | 32px | Section headings |
| `text-3xl` | 30px | 36px | Page headings |

### Spacing Scale

| Class | Size | Usage |
|-------|------|-------|
| `p-1` | 4px | Minimal padding |
| `p-2` | 8px | Small padding |
| `p-4` | 16px | Standard padding |
| `p-6` | 24px | Large padding |
| `p-8` | 32px | Extra large padding |

## Base UI Components

### Button

A versatile button component with multiple variants and sizes.

#### Props

```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}
```

#### Usage

```tsx
import { Button } from '@/components/ui/Button'

// Basic button
<Button>Click me</Button>

// Button variants
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Subtle</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Regular</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// With custom styling
<Button className="w-full" variant="outline">
  Full Width Button
</Button>
```

#### Accessibility

- Uses semantic `<button>` element
- Supports keyboard navigation (Tab, Enter, Space)
- Proper focus indicators
- ARIA attributes for screen readers

### Card

A flexible container component for grouping related content.

#### Props

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
}
```

#### Subcomponents

- `CardHeader` - Header section with padding
- `CardTitle` - Styled title component
- `CardDescription` - Muted description text
- `CardContent` - Main content area
- `CardFooter` - Footer section for actions

#### Usage

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      Card description goes here
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input

Form input component with consistent styling.

#### Props

```typescript
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}
```

#### Usage

```tsx
import { Input } from '@/components/ui/Input'

// Basic input
<Input placeholder="Enter text..." />

// With label
<div>
  <label htmlFor="email">Email</label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>

// With validation state
<Input
  className="border-red-300 focus:border-red-500"
  placeholder="Invalid input"
/>
```

### Badge

Small status or category indicators.

#### Props

```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  children: React.ReactNode
  className?: string
}
```

#### Usage

```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
```

## Dashboard Components

### StatCard

Displays key performance metrics with optional trend indicators.

#### Props

```typescript
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}
```

#### Usage

```tsx
import { StatCard } from '@/components/dashboard/StatCard'

<StatCard
  title="Total Messages"
  value={1234}
  subtitle="This month"
  color="blue"
  icon="📧"
  trend={{ value: 5.2, isPositive: true }}
/>
```

#### Features

- Automatic number formatting (1,234)
- Color-coded styling
- Trend indicators with arrows
- Icon support
- Responsive design

### StatusBadge

Displays status information with predefined styles.

#### Props

```typescript
interface StatusBadgeProps {
  status: 'sent' | 'scheduled' | 'draft' | 'failed' | 'active' | 'completed' | 'pending'
}
```

#### Usage

```tsx
import { StatusBadge } from '@/components/dashboard/StatusBadge'

<StatusBadge status="sent" />
<StatusBadge status="scheduled" />
<StatusBadge status="failed" />
```

#### Status Mapping

| Status | Label | Color |
|--------|-------|-------|
| `sent` | 送信済み | Green |
| `scheduled` | スケジュール済み | Blue |
| `draft` | 下書き | Gray |
| `failed` | 送信失敗 | Red |
| `active` | 実行中 | Green |
| `completed` | 完了 | Gray |
| `pending` | 待機中 | Yellow |

### QuickActions

Grid of quick action buttons for common tasks.

#### Props

```typescript
interface QuickActionsProps {
  actions?: Array<{
    href: string
    icon: string
    title: string
    description: string
  }>
  title?: string
}
```

#### Usage

```tsx
import { QuickActions } from '@/components/dashboard/QuickActions'

const customActions = [
  {
    href: '/messages/new',
    icon: '📝',
    title: 'Create Message',
    description: 'Send a new message'
  },
  {
    href: '/analytics',
    icon: '📊',
    title: 'View Analytics',
    description: 'Check performance metrics'
  }
]

<QuickActions actions={customActions} title="Quick Actions" />
```

## Message Components

### MessageCard

Displays message information in a card format with action buttons.

#### Props

```typescript
interface MessageCardProps {
  message: {
    id: number
    title: string
    content: string
    status: 'sent' | 'scheduled' | 'draft' | 'failed'
    type: 'text' | 'image' | 'video' | 'template' | 'flex'
    sentAt?: string
    scheduledAt?: string
    recipients: number
    responses: number
  }
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onDuplicate?: (id: number) => void
  onSend?: (id: number) => void
  onCancel?: (id: number) => void
}
```

#### Usage

```tsx
import { MessageCard } from '@/components/messages/MessageCard'

<MessageCard
  message={message}
  onEdit={(id) => navigate(`/messages/${id}/edit`)}
  onDelete={(id) => handleDelete(id)}
  onDuplicate={(id) => handleDuplicate(id)}
  onSend={(id) => handleSend(id)}
/>
```

#### Features

- Dynamic action buttons based on message status
- Message type icons
- Time/date formatting
- Response statistics
- Hover effects

### MessageTypeIcon

Displays icons for different message types.

#### Props

```typescript
interface MessageTypeIconProps {
  type: 'text' | 'image' | 'video' | 'template' | 'flex' | 'carousel' | 'audio'
  size?: 'sm' | 'md' | 'lg'
}
```

#### Usage

```tsx
import { MessageTypeIcon } from '@/components/messages/MessageTypeIcon'

<MessageTypeIcon type="text" size="md" />
<MessageTypeIcon type="image" size="lg" />
```

#### Icon Mapping

| Type | Icon | Label |
|------|------|-------|
| `text` | 📝 | テキスト |
| `image` | 🖼️ | 画像 |
| `video` | 🎬 | 動画 |
| `template` | 📋 | テンプレート |
| `flex` | 🎨 | フレックス |
| `carousel` | 🎠 | カルーセル |
| `audio` | 🎵 | 音声 |

### MessageFilters

Filter and search interface for message lists.

#### Props

```typescript
interface MessageFiltersProps {
  tabs: Array<{
    key: string
    label: string
    count?: number
  }>
  selectedTab: string
  searchTerm: string
  onTabChange: (tab: string) => void
  onSearchChange: (term: string) => void
  onFilterClick?: () => void
  showCount?: boolean
}
```

#### Usage

```tsx
import { MessageFilters } from '@/components/messages/MessageFilters'

const [selectedTab, setSelectedTab] = useState('all')
const [searchTerm, setSearchTerm] = useState('')

const tabs = [
  { key: 'all', label: '全て', count: 150 },
  { key: 'sent', label: '送信済み', count: 120 },
  { key: 'draft', label: '下書き', count: 30 }
]

<MessageFilters
  tabs={tabs}
  selectedTab={selectedTab}
  searchTerm={searchTerm}
  onTabChange={setSelectedTab}
  onSearchChange={setSearchTerm}
  showCount={true}
/>
```

## Layout Components

### Header

Application header with navigation and user actions.

#### Props

```typescript
interface HeaderProps {
  title?: string
  navigation?: Array<{
    href: string
    label: string
    isActive?: boolean
  }>
  actions?: React.ReactNode
}
```

#### Usage

```tsx
import { Header } from '@/components/layout/Header'

const navigation = [
  { href: '/dashboard', label: '概要' },
  { href: '/messages', label: 'メッセージ' },
  { href: '/analytics', label: '分析' }
]

<Header
  title="L-Core"
  navigation={navigation}
  actions={
    <Button>
      <Link href="/messages/new">新規メッセージ</Link>
    </Button>
  }
/>
```

#### Features

- Responsive navigation
- Active state highlighting
- Custom action area
- Mobile-friendly hamburger menu

## Utility Functions

### Formatting Utilities

```typescript
import { formatNumber, formatDate, formatPercentage } from '@/lib/utils'

// Number formatting with locale
formatNumber(1234) // "1,234"
formatNumber(1234567) // "1,234,567"

// Date formatting
formatDate('2024-01-01T10:00:00Z') // "2024/01/01 10:00"
formatDate(new Date()) // Current date formatted

// Percentage formatting
formatPercentage(15.789) // "15.8%"
formatPercentage(15.789, 2) // "15.79%"
```

### CSS Class Utilities

```typescript
import { cn } from '@/lib/utils'

// Merge Tailwind classes
cn('px-4 py-2', 'bg-blue-500', 'text-white')
// Result: "px-4 py-2 bg-blue-500 text-white"

// Conditional classes
cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)
```

## Custom Hooks

### useMessages

Hook for managing message state and operations.

```typescript
import { useMessages } from '@/hooks/useMessages'

const {
  messages,
  loading,
  error,
  pagination,
  actions
} = useMessages({
  status: 'sent',
  type: 'text'
})

// Create message
await actions.create({
  title: 'New Message',
  content: 'Message content',
  type: 'text'
})

// Update message
await actions.update(messageId, {
  title: 'Updated Title'
})

// Send message
await actions.send(messageId, ['recipient1'])
```

### useAnalytics

Hook for analytics data and operations.

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

const {
  data,
  dashboardStats,
  loading,
  error,
  actions
} = useAnalytics({
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  }
})

// Get performance data
const performance = await actions.getMessagePerformance(
  { start: '2024-01-01', end: '2024-01-31' },
  'day'
)
```

## Theming and Customization

### Theme Configuration

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
}
```

### Component Customization

```tsx
// Custom styled button
<Button className="bg-brand-500 hover:bg-brand-600">
  Custom Button
</Button>

// Override default styles
<Card className="border-2 border-brand-200 shadow-lg">
  Enhanced Card
</Card>
```

## Best Practices

### Component Development

1. **Use TypeScript**: All components should have proper type definitions
2. **Follow naming conventions**: Use PascalCase for components, camelCase for props
3. **Implement accessibility**: Include ARIA attributes and keyboard support
4. **Write tests**: Every component should have corresponding test files
5. **Document props**: Use JSDoc comments for complex prop interfaces

### Performance Optimization

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering logic */}</div>
})

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Event handling logic
}, [dependency])

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveDataProcessing(rawData)
}, [rawData])
```

### Styling Guidelines

1. **Use Tailwind utilities**: Prefer utility classes over custom CSS
2. **Maintain consistency**: Use design system colors and spacing
3. **Mobile-first**: Design for mobile, enhance for desktop
4. **Semantic markup**: Use appropriate HTML elements
5. **Focus states**: Ensure all interactive elements have visible focus states

## Testing Components

### Test Structure

```tsx
import { render, user, screen } from '@/lib/test-utils'
import { Button } from '../Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Testing Best Practices

1. **Test user interactions**: Focus on what users can see and do
2. **Use meaningful queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test error states**: Ensure components handle errors gracefully
4. **Mock external dependencies**: Mock API calls and external services
5. **Verify accessibility**: Test with screen readers and keyboard navigation

## Migration Guide

### From v1 to v2

```tsx
// Old API (v1)
<Button type="primary">Submit</Button>

// New API (v2)
<Button variant="default">Submit</Button>
```

### Breaking Changes

- `Button.type` prop renamed to `variant`
- `Card.bordered` prop removed, use `className="border"`
- `Input.error` prop removed, use `className="border-red-300"`

For complete migration instructions, see [MIGRATION.md](./MIGRATION.md).

## Support

For component-related questions:

- **Component Storybook**: [storybook.l-core.com](https://storybook.l-core.com)
- **Design System**: [design.l-core.com](https://design.l-core.com)
- **GitHub Issues**: [Report bugs](https://github.com/l-core/components/issues)
- **Discord**: [#components channel](https://discord.gg/l-core)
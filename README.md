# L-Core LINE Messaging System

A comprehensive LINE messaging platform built with Next.js, TypeScript, and modern React patterns. This system provides a complete solution for managing LINE bot communications, message campaigns, analytics, and template management.

## 🚀 Features

### Core Messaging
- **Multi-format Messages**: Support for text, images, videos, templates, and Flex messages
- **Smart Scheduling**: Advanced message scheduling with timezone support
- **Bulk Operations**: Send messages to multiple recipients efficiently
- **Template System**: Reusable message templates with variable substitution

### Campaign Management
- **Campaign Builder**: Create and manage multi-message campaigns
- **Audience Segmentation**: Target specific user groups with precision
- **A/B Testing**: Test different message variations for optimal performance
- **Automated Workflows**: Set up recurring campaigns and auto-responses

### Analytics & Insights
- **Real-time Metrics**: Live dashboard with key performance indicators
- **Response Tracking**: Monitor message delivery and response rates
- **User Engagement**: Track user behavior and engagement patterns
- **Export Capabilities**: Generate reports in CSV, Excel, and PDF formats

### Developer Experience
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Component Library**: Reusable UI components with consistent design
- **API Client**: Unified API client with error handling and request optimization
- **Testing Suite**: Complete test coverage with Jest and React Testing Library

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- LINE Developer Account
- OpenAI API key (for AI-powered features)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/l-core.git
   cd l-core
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```

   Configure the following environment variables:
   ```env
   # LINE Bot Configuration
   LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
   LINE_CHANNEL_SECRET=your_line_channel_secret

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Firebase Configuration
   FIREBASE_CONFIG=your_firebase_config_json

   # Application URLs
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Database Setup**
   ```bash
   npm run db:setup
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🏗 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.js          # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── messages/         # Message-related components
│   ├── templates/        # Template components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api/              # API client and services
│   ├── auth/             # Authentication utilities
│   ├── utils/            # General utilities
│   └── validation/       # Input validation schemas
├── types/                # TypeScript type definitions
└── constants/            # Application constants
```

## 🎯 Usage

### Basic Message Sending

```typescript
import { api } from '@/lib/api'

// Send a simple text message
const message = await api.messages.create({
  title: 'Welcome Message',
  content: 'Hello! Welcome to our service.',
  type: 'text',
  recipients: ['user-id-1', 'user-id-2']
})

await api.messages.send(message.id)
```

### Using Templates

```typescript
// Create a message from template
const templateMessage = await api.templates.createMessageFromTemplate(
  templateId,
  {
    customerName: 'John Doe',
    productName: 'Premium Plan'
  },
  {
    title: 'Personalized Offer',
    recipients: ['user-id']
  }
)
```

### Campaign Management

```typescript
// Create and launch a campaign
const campaign = await api.campaigns.create({
  name: 'Summer Sale Campaign',
  messageIds: [message1.id, message2.id],
  targetAudience: {
    segments: ['premium-users', 'active-users']
  },
  schedule: {
    startAt: '2024-06-01T09:00:00Z',
    frequency: 'weekly'
  }
})
```

### Analytics Retrieval

```typescript
// Get dashboard analytics
const analytics = await api.analytics.getDashboardStats()

// Get detailed performance data
const performance = await api.analytics.getMessagePerformance(
  { start: '2024-01-01', end: '2024-12-31' },
  'month'
)
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Writing Tests

The project uses Jest and React Testing Library. Test utilities are available in `src/lib/test-utils.tsx`:

```typescript
import { render, user, createMockMessage } from '@/lib/test-utils'
import { MessageCard } from '@/components/messages/MessageCard'

describe('MessageCard', () => {
  it('displays message information correctly', () => {
    const message = createMockMessage({
      title: 'Test Message',
      content: 'Test content'
    })

    render(<MessageCard message={message} />)

    expect(screen.getByText('Test Message')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})
```

## 🎨 Component Library

### Base UI Components

```typescript
import { Button, Card, Input, Badge } from '@/components/ui'

// Button with variants
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Delete</Button>

// Card layout
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Specialized Components

```typescript
import { StatCard, StatusBadge, MessageCard } from '@/components/dashboard'

// Statistics display
<StatCard
  title="Total Messages"
  value={1234}
  subtitle="This month"
  color="blue"
  trend={{ value: 5.2, isPositive: true }}
/>

// Status indication
<StatusBadge status="sent" />

// Message display
<MessageCard
  message={message}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## 📡 API Reference

### Message Service

```typescript
// Get paginated messages
const messages = await messageService.getMessages(
  { status: 'sent', type: 'text' },
  { page: 1, limit: 20 }
)

// Create new message
const newMessage = await messageService.createMessage({
  title: 'New Message',
  content: 'Message content',
  type: 'text'
})

// Send message immediately
await messageService.sendMessage(messageId, ['recipient-1'])

// Schedule message
await messageService.scheduleMessage(
  messageId,
  '2024-12-01T10:00:00Z',
  ['recipient-1']
)
```

### Template Service

```typescript
// Get templates by category
const templates = await templateService.getTemplates(
  { category: 'marketing', businessType: 'retail' }
)

// Preview template
const preview = await templateService.previewTemplate(
  templateId,
  { customerName: 'John', discount: '20%' }
)
```

### Analytics Service

```typescript
// Get dashboard statistics
const stats = await analyticsService.getDashboardStats()

// Export analytics data
const exportData = await analyticsService.exportAnalytics(
  'xlsx',
  {
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
    metrics: ['messages', 'responses', 'engagement']
  }
)
```

## 🔧 Configuration

### TypeScript Configuration

The project uses strict TypeScript configuration for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Tailwind CSS

Custom utility classes and component styles are defined in `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  }
}
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure all production environment variables are configured:

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
LINE_WEBHOOK_URL=https://your-domain.com/api/webhook
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance Monitoring

The application includes built-in performance monitoring:

```typescript
import { monitor } from '@/lib/performance/monitor'

// Track custom metrics
monitor.track('message_sent', {
  messageType: 'text',
  recipientCount: 100,
  duration: 1500
})

// Monitor API performance
const result = await monitor.measure('api_call', () =>
  api.messages.getMessages()
)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

### Code Quality Standards

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format

# Run all quality checks
npm run quality:check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.l-core.com](https://docs.l-core.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/l-core/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/l-core/discussions)
- **Email**: support@l-core.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [LINE Messaging API](https://developers.line.biz) - LINE platform integration
- [OpenAI](https://openai.com) - AI-powered features
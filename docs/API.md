# L-Core API Documentation

## Overview

The L-Core API provides a comprehensive interface for managing LINE messaging operations, templates, campaigns, and analytics. The API follows RESTful conventions and returns JSON responses.

## Base URL

```
Production: https://api.l-core.com/v1
Development: http://localhost:3000/api
```

## Authentication

All API requests require authentication using Bearer tokens:

```http
Authorization: Bearer <your-access-token>
```

## Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId: string
  }
}
```

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "title",
      "reason": "Title is required"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456"
  }
}
```

## Pagination

List endpoints support pagination with the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-based) |
| `limit` | number | 20 | Items per page (max 100) |
| `sort` | string | `createdAt` | Sort field |
| `order` | string | `desc` | Sort order (`asc` or `desc`) |

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

## Messages API

### Get Messages

Retrieve a paginated list of messages with optional filtering.

```http
GET /messages
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `draft`, `scheduled`, `sent`, `failed` |
| `type` | string | Filter by type: `text`, `image`, `video`, `template`, `flex` |
| `search` | string | Search in title and content |
| `dateFrom` | string | ISO date string |
| `dateTo` | string | ISO date string |

#### Example Request
```http
GET /messages?status=sent&type=text&page=1&limit=10
```

#### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Welcome Message",
        "content": "Welcome to our service!",
        "status": "sent",
        "type": "text",
        "sentAt": "2024-01-01T10:00:00Z",
        "recipients": 150,
        "responses": 45,
        "createdAt": "2024-01-01T09:00:00Z",
        "updatedAt": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### Get Single Message

Retrieve a specific message by ID.

```http
GET /messages/{id}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Welcome Message",
    "content": "Welcome to our service!",
    "status": "sent",
    "type": "text",
    "sentAt": "2024-01-01T10:00:00Z",
    "recipients": 150,
    "responses": 45,
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### Create Message

Create a new message.

```http
POST /messages
```

#### Request Body
```json
{
  "title": "New Message",
  "content": "Message content here",
  "type": "text",
  "recipients": ["user_id_1", "user_id_2"]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "New Message",
    "content": "Message content here",
    "status": "draft",
    "type": "text",
    "recipients": 0,
    "responses": 0,
    "createdAt": "2024-01-01T11:00:00Z",
    "updatedAt": "2024-01-01T11:00:00Z"
  }
}
```

### Update Message

Update an existing message.

```http
PATCH /messages/{id}
```

#### Request Body
```json
{
  "title": "Updated Message Title",
  "content": "Updated content"
}
```

### Delete Message

Delete a message.

```http
DELETE /messages/{id}
```

#### Response
```json
{
  "success": true,
  "data": null
}
```

### Send Message

Send a message immediately.

```http
POST /messages/{id}/send
```

#### Request Body
```json
{
  "recipients": ["user_id_1", "user_id_2"]
}
```

### Schedule Message

Schedule a message for later delivery.

```http
POST /messages/{id}/schedule
```

#### Request Body
```json
{
  "scheduledAt": "2024-01-02T10:00:00Z",
  "recipients": ["user_id_1", "user_id_2"]
}
```

### Cancel Scheduled Message

Cancel a scheduled message.

```http
POST /messages/{id}/cancel
```

### Duplicate Message

Create a copy of an existing message.

```http
POST /messages/{id}/duplicate
```

### Get Message Analytics

Get detailed analytics for a specific message.

```http
GET /messages/{id}/analytics
```

#### Response
```json
{
  "success": true,
  "data": {
    "deliveryStats": {
      "sent": 100,
      "delivered": 95,
      "failed": 5,
      "pending": 0
    },
    "responseStats": {
      "responses": 23,
      "responseRate": 24.2,
      "clickThroughs": 15,
      "clicks": 12
    },
    "timeline": [
      {
        "timestamp": "2024-01-01T10:00:00Z",
        "event": "sent",
        "count": 100
      }
    ]
  }
}
```

## Templates API

### Get Templates

Retrieve available message templates.

```http
GET /templates
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `businessType` | string | Filter by business type |
| `search` | string | Search in template name and content |

#### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Welcome Template",
        "content": "Welcome {customerName}!",
        "category": "greeting",
        "businessType": "retail",
        "variables": {
          "customerName": "string"
        },
        "usage": 25,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### Create Template

Create a new message template.

```http
POST /templates
```

#### Request Body
```json
{
  "name": "New Template",
  "content": "Hello {customerName}, check out our {productName}!",
  "category": "marketing",
  "businessType": "retail",
  "variables": {
    "customerName": "string",
    "productName": "string"
  }
}
```

### Preview Template

Preview a template with variable substitution.

```http
POST /templates/{id}/preview
```

#### Request Body
```json
{
  "variables": {
    "customerName": "John Doe",
    "productName": "Premium Plan"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "content": "Hello {customerName}, check out our {productName}!",
    "preview": "Hello John Doe, check out our Premium Plan!"
  }
}
```

### Create Message from Template

Generate a message using a template.

```http
POST /templates/{id}/create-message
```

#### Request Body
```json
{
  "variables": {
    "customerName": "John Doe",
    "productName": "Premium Plan"
  },
  "title": "Personalized Offer",
  "recipients": ["user_id_1"]
}
```

### Get Template Categories

Get available template categories.

```http
GET /templates/categories
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "marketing",
      "name": "Marketing",
      "description": "Promotional and marketing messages",
      "templateCount": 15
    },
    {
      "id": "support",
      "name": "Customer Support",
      "description": "Customer service templates",
      "templateCount": 8
    }
  ]
}
```

## Analytics API

### Get Dashboard Stats

Get overview statistics for the dashboard.

```http
GET /analytics/dashboard
```

#### Response
```json
{
  "success": true,
  "data": {
    "totalMessages": 1250,
    "sentToday": 45,
    "responseRate": 18.5,
    "activeUsers": 850,
    "trends": {
      "messages": 12,
      "responses": 8,
      "users": -3
    }
  }
}
```

### Get Analytics Data

Get detailed analytics with customizable parameters.

```http
POST /analytics
```

#### Request Body
```json
{
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": ["messages", "responses", "engagement"],
  "groupBy": "day"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalMessages": 500,
      "totalResponses": 125,
      "responseRate": 25.0,
      "activeUsers": 300
    },
    "trends": [
      {
        "date": "2024-01-01",
        "messages": 25,
        "responses": 8,
        "responseRate": 32.0
      }
    ],
    "breakdown": {
      "byType": {
        "text": 300,
        "image": 150,
        "template": 50
      },
      "byStatus": {
        "sent": 450,
        "scheduled": 30,
        "draft": 20
      }
    }
  }
}
```

### Get Message Performance

Get message performance metrics over time.

```http
GET /analytics/messages
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Start date (ISO format) |
| `endDate` | string | End date (ISO format) |
| `groupBy` | string | Group by: `day`, `week`, `month` |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "sent": 100,
      "delivered": 95,
      "failed": 5,
      "responses": 25,
      "responseRate": 26.3
    }
  ]
}
```

### Export Analytics

Generate and download analytics reports.

```http
POST /analytics/export
```

#### Request Body
```json
{
  "format": "xlsx",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": ["messages", "responses", "engagement"]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.l-core.com/downloads/analytics_2024_01.xlsx",
    "filename": "analytics_2024_01.xlsx",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (e.g., duplicate) |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## Rate Limits

API requests are rate-limited based on your subscription plan:

| Plan | Requests per minute | Burst limit |
|------|-------------------|-------------|
| Free | 100 | 200 |
| Pro | 1,000 | 2,000 |
| Enterprise | 10,000 | 20,000 |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

Configure webhooks to receive real-time notifications about message events.

### Webhook Events

| Event | Description |
|-------|-------------|
| `message.sent` | Message successfully sent |
| `message.delivered` | Message delivered to recipient |
| `message.failed` | Message delivery failed |
| `message.response` | User responded to message |
| `campaign.started` | Campaign started |
| `campaign.completed` | Campaign completed |

### Webhook Payload

```json
{
  "event": "message.sent",
  "timestamp": "2024-01-01T10:00:00Z",
  "data": {
    "messageId": 123,
    "recipientId": "user_123",
    "status": "sent"
  }
}
```

## SDKs and Libraries

Official SDKs are available for popular programming languages:

- **JavaScript/TypeScript**: `npm install @l-core/sdk`
- **Python**: `pip install l-core-sdk`
- **PHP**: `composer require l-core/sdk`
- **Go**: `go get github.com/l-core/go-sdk`

### JavaScript SDK Example

```typescript
import { LCore } from '@l-core/sdk'

const client = new LCore({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.l-core.com/v1'
})

// Send a message
const message = await client.messages.create({
  title: 'Hello World',
  content: 'Hello from L-Core!',
  type: 'text'
})

await client.messages.send(message.id, ['user_123'])
```

## Support

For API support and questions:

- **Documentation**: [docs.l-core.com](https://docs.l-core.com)
- **API Status**: [status.l-core.com](https://status.l-core.com)
- **Support Email**: api-support@l-core.com
- **Discord**: [L-Core Community](https://discord.gg/l-core)
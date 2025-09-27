// Base API types
export interface ApiResponse<T = any> {
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

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Message related types
export interface MessageRequest {
  title: string
  content: string
  type: 'text' | 'image' | 'video' | 'template' | 'flex'
  recipients?: string[]
  scheduledAt?: string
}

export interface MessageResponse {
  id: number
  title: string
  content: string
  status: 'sent' | 'scheduled' | 'draft' | 'failed'
  type: 'text' | 'image' | 'video' | 'template' | 'flex'
  sentAt?: string
  scheduledAt?: string
  recipients: number
  responses: number
  createdAt: string
  updatedAt: string
}

export interface MessageFilters {
  status?: string
  type?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

// Template related types
export interface TemplateRequest {
  name: string
  content: string
  category: string
  businessType: string
  variables?: Record<string, any>
}

export interface TemplateResponse {
  id: number
  name: string
  content: string
  category: string
  businessType: string
  variables: Record<string, any>
  usage: number
  createdAt: string
  updatedAt: string
}

// Analytics types
export interface AnalyticsRequest {
  dateRange: {
    start: string
    end: string
  }
  metrics?: string[]
  groupBy?: string
}

export interface AnalyticsResponse {
  overview: {
    totalMessages: number
    totalResponses: number
    responseRate: number
    activeUsers: number
  }
  trends: Array<{
    date: string
    messages: number
    responses: number
    responseRate: number
  }>
  breakdown: {
    byType: Record<string, number>
    byStatus: Record<string, number>
    byCategory: Record<string, number>
  }
}

// Campaign types
export interface CampaignRequest {
  name: string
  description?: string
  messageIds: number[]
  targetAudience: {
    segments?: string[]
    filters?: Record<string, any>
  }
  schedule: {
    startAt: string
    endAt?: string
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly'
  }
}

export interface CampaignResponse {
  id: number
  name: string
  description?: string
  status: 'active' | 'scheduled' | 'completed' | 'paused'
  progress: number
  metrics: {
    totalMessages: number
    totalResponses: number
    responseRate: number
  }
  schedule: {
    startAt: string
    endAt?: string
    frequency?: string
  }
  createdAt: string
  updatedAt: string
}
import { apiClient } from '../client'
import {
  MessageRequest,
  MessageResponse,
  MessageFilters,
  PaginationParams,
  PaginatedResponse
} from '../types'

export class MessageService {
  private endpoint = '/messages'

  // Get all messages with optional filtering and pagination
  async getMessages(
    filters?: MessageFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<MessageResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<PaginatedResponse<MessageResponse>>(this.endpoint, params)
  }

  // Get single message by ID
  async getMessage(id: number): Promise<MessageResponse> {
    return apiClient.get<MessageResponse>(`${this.endpoint}/${id}`)
  }

  // Create new message
  async createMessage(data: MessageRequest): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(this.endpoint, data)
  }

  // Update existing message
  async updateMessage(id: number, data: Partial<MessageRequest>): Promise<MessageResponse> {
    return apiClient.patch<MessageResponse>(`${this.endpoint}/${id}`, data)
  }

  // Delete message
  async deleteMessage(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`)
  }

  // Send message immediately
  async sendMessage(id: number, recipients?: string[]): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(`${this.endpoint}/${id}/send`, {
      recipients
    })
  }

  // Schedule message for later delivery
  async scheduleMessage(
    id: number,
    scheduledAt: string,
    recipients?: string[]
  ): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(`${this.endpoint}/${id}/schedule`, {
      scheduledAt,
      recipients
    })
  }

  // Cancel scheduled message
  async cancelScheduledMessage(id: number): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(`${this.endpoint}/${id}/cancel`)
  }

  // Duplicate message
  async duplicateMessage(id: number): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(`${this.endpoint}/${id}/duplicate`)
  }

  // Get message analytics
  async getMessageAnalytics(id: number): Promise<{
    deliveryStats: {
      sent: number
      delivered: number
      failed: number
      pending: number
    }
    responseStats: {
      responses: number
      responseRate: number
      clickThroughs: number
      clicks: number
    }
    timeline: Array<{
      timestamp: string
      event: string
      count: number
    }>
  }> {
    return apiClient.get(`${this.endpoint}/${id}/analytics`)
  }

  // Upload media for message
  async uploadMedia(file: File): Promise<{
    id: string
    url: string
    type: string
    size: number
  }> {
    return apiClient.upload('/media/upload', file)
  }
}

export const messageService = new MessageService()
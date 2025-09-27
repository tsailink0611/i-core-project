import { apiClient } from '../client'
import { AnalyticsRequest, AnalyticsResponse } from '../types'

export class AnalyticsService {
  private endpoint = '/analytics'

  // Get general analytics data
  async getAnalytics(request?: AnalyticsRequest): Promise<AnalyticsResponse> {
    return apiClient.post<AnalyticsResponse>(this.endpoint, request)
  }

  // Get dashboard overview stats
  async getDashboardStats(): Promise<{
    totalMessages: number
    sentToday: number
    responseRate: number
    activeUsers: number
    trends: {
      messages: number
      responses: number
      users: number
    }
  }> {
    return apiClient.get(`${this.endpoint}/dashboard`)
  }

  // Get message performance
  async getMessagePerformance(
    dateRange: { start: string; end: string },
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{
    date: string
    sent: number
    delivered: number
    failed: number
    responses: number
    responseRate: number
  }>> {
    return apiClient.get(`${this.endpoint}/messages`, {
      startDate: dateRange.start,
      endDate: dateRange.end,
      groupBy
    })
  }

  // Get campaign analytics
  async getCampaignAnalytics(campaignId?: number): Promise<Array<{
    id: number
    name: string
    status: string
    progress: number
    metrics: {
      totalMessages: number
      totalResponses: number
      responseRate: number
      clickThroughRate: number
    }
    performance: Array<{
      date: string
      messages: number
      responses: number
    }>
  }>> {
    const params = campaignId ? { campaignId } : {}
    return apiClient.get(`${this.endpoint}/campaigns`, params)
  }

  // Get audience insights
  async getAudienceInsights(): Promise<{
    demographics: {
      ageGroups: Record<string, number>
      gender: Record<string, number>
      locations: Record<string, number>
    }
    behavior: {
      activeHours: Record<string, number>
      responsePatterns: Record<string, number>
      preferredMessageTypes: Record<string, number>
    }
    engagement: {
      highEngagementUsers: number
      mediumEngagementUsers: number
      lowEngagementUsers: number
      churnedUsers: number
    }
  }> {
    return apiClient.get(`${this.endpoint}/audience`)
  }

  // Get template performance
  async getTemplatePerformance(): Promise<Array<{
    templateId: number
    templateName: string
    category: string
    usage: number
    averageResponseRate: number
    performance: {
      sent: number
      responses: number
      responseRate: number
    }
  }>> {
    return apiClient.get(`${this.endpoint}/templates`)
  }

  // Export analytics data
  async exportAnalytics(
    format: 'csv' | 'xlsx' | 'pdf',
    request?: AnalyticsRequest
  ): Promise<{
    downloadUrl: string
    filename: string
    expiresAt: string
  }> {
    return apiClient.post(`${this.endpoint}/export`, {
      format,
      ...request
    })
  }

  // Get real-time metrics
  async getRealTimeMetrics(): Promise<{
    currentOnlineUsers: number
    messagesBeingSent: number
    responsesInLastHour: number
    systemStatus: 'healthy' | 'warning' | 'error'
    lastUpdated: string
  }> {
    return apiClient.get(`${this.endpoint}/realtime`)
  }
}

export const analyticsService = new AnalyticsService()
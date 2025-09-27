// Export all API services
export { messageService, MessageService } from './services/messages'
export { templateService, TemplateService } from './services/templates'
export { analyticsService, AnalyticsService } from './services/analytics'

// Export API client
export { apiClient, ApiClient, ApiError } from './client'

// Export types
export * from './types'

// Create convenience object for all services
export const api = {
  messages: messageService,
  templates: templateService,
  analytics: analyticsService
} as const

// Export individual services for direct import
export {
  messageService as messages,
  templateService as templates,
  analyticsService as analytics
}
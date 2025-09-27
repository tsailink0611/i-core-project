import { apiClient } from '../client'
import {
  TemplateRequest,
  TemplateResponse,
  PaginationParams,
  PaginatedResponse
} from '../types'

export class TemplateService {
  private endpoint = '/templates'

  // Get all templates with optional filtering and pagination
  async getTemplates(
    filters?: {
      category?: string
      businessType?: string
      search?: string
    },
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TemplateResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<PaginatedResponse<TemplateResponse>>(this.endpoint, params)
  }

  // Get single template by ID
  async getTemplate(id: number): Promise<TemplateResponse> {
    return apiClient.get<TemplateResponse>(`${this.endpoint}/${id}`)
  }

  // Create new template
  async createTemplate(data: TemplateRequest): Promise<TemplateResponse> {
    return apiClient.post<TemplateResponse>(this.endpoint, data)
  }

  // Update existing template
  async updateTemplate(id: number, data: Partial<TemplateRequest>): Promise<TemplateResponse> {
    return apiClient.patch<TemplateResponse>(`${this.endpoint}/${id}`, data)
  }

  // Delete template
  async deleteTemplate(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`)
  }

  // Get template categories
  async getCategories(): Promise<Array<{
    id: string
    name: string
    description?: string
    templateCount: number
  }>> {
    return apiClient.get(`${this.endpoint}/categories`)
  }

  // Get business types
  async getBusinessTypes(): Promise<Array<{
    id: string
    name: string
    description?: string
    templateCount: number
  }>> {
    return apiClient.get(`${this.endpoint}/business-types`)
  }

  // Preview template with variables
  async previewTemplate(
    id: number,
    variables: Record<string, any>
  ): Promise<{
    content: string
    preview: string
  }> {
    return apiClient.post(`${this.endpoint}/${id}/preview`, { variables })
  }

  // Create message from template
  async createMessageFromTemplate(
    templateId: number,
    variables: Record<string, any>,
    messageData?: Partial<{
      title: string
      recipients: string[]
      scheduledAt: string
    }>
  ): Promise<{
    messageId: number
    content: string
  }> {
    return apiClient.post(`${this.endpoint}/${templateId}/create-message`, {
      variables,
      ...messageData
    })
  }

  // Get popular templates
  async getPopularTemplates(limit: number = 10): Promise<TemplateResponse[]> {
    return apiClient.get(`${this.endpoint}/popular`, { limit })
  }

  // Search templates
  async searchTemplates(
    query: string,
    filters?: {
      category?: string
      businessType?: string
    }
  ): Promise<TemplateResponse[]> {
    return apiClient.get(`${this.endpoint}/search`, {
      q: query,
      ...filters
    })
  }
}

export const templateService = new TemplateService()
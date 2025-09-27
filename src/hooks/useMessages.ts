'use client'

import { useState, useEffect, useCallback } from 'react'
import { messageService } from '@/lib/api'
import {
  MessageResponse,
  MessageRequest,
  MessageFilters,
  PaginationParams,
  PaginatedResponse
} from '@/lib/api/types'

interface UseMessagesState {
  messages: MessageResponse[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  } | null
}

export function useMessages(
  filters?: MessageFilters,
  paginationParams?: PaginationParams
) {
  const [state, setState] = useState<UseMessagesState>({
    messages: [],
    loading: false,
    error: null,
    pagination: null
  })

  const fetchMessages = useCallback(async (
    currentFilters?: MessageFilters,
    currentPagination?: PaginationParams
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await messageService.getMessages(
        currentFilters || filters,
        currentPagination || paginationParams
      )

      setState({
        messages: response.items,
        loading: false,
        error: null,
        pagination: response.pagination
      })

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [filters, paginationParams])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const createMessage = useCallback(async (data: MessageRequest) => {
    try {
      const newMessage = await messageService.createMessage(data)
      setState(prev => ({
        ...prev,
        messages: [newMessage, ...prev.messages]
      }))
      return newMessage
    } catch (error) {
      throw error
    }
  }, [])

  const updateMessage = useCallback(async (id: number, data: Partial<MessageRequest>) => {
    try {
      const updatedMessage = await messageService.updateMessage(id, data)
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === id ? updatedMessage : msg
        )
      }))
      return updatedMessage
    } catch (error) {
      throw error
    }
  }, [])

  const deleteMessage = useCallback(async (id: number) => {
    try {
      await messageService.deleteMessage(id)
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== id)
      }))
    } catch (error) {
      throw error
    }
  }, [])

  const sendMessage = useCallback(async (id: number, recipients?: string[]) => {
    try {
      const sentMessage = await messageService.sendMessage(id, recipients)
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === id ? sentMessage : msg
        )
      }))
      return sentMessage
    } catch (error) {
      throw error
    }
  }, [])

  const scheduleMessage = useCallback(async (
    id: number,
    scheduledAt: string,
    recipients?: string[]
  ) => {
    try {
      const scheduledMessage = await messageService.scheduleMessage(id, scheduledAt, recipients)
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === id ? scheduledMessage : msg
        )
      }))
      return scheduledMessage
    } catch (error) {
      throw error
    }
  }, [])

  const duplicateMessage = useCallback(async (id: number) => {
    try {
      const duplicatedMessage = await messageService.duplicateMessage(id)
      setState(prev => ({
        ...prev,
        messages: [duplicatedMessage, ...prev.messages]
      }))
      return duplicatedMessage
    } catch (error) {
      throw error
    }
  }, [])

  const refresh = useCallback(() => {
    return fetchMessages()
  }, [fetchMessages])

  return {
    ...state,
    actions: {
      create: createMessage,
      update: updateMessage,
      delete: deleteMessage,
      send: sendMessage,
      schedule: scheduleMessage,
      duplicate: duplicateMessage,
      refresh,
      fetchMessages
    }
  }
}
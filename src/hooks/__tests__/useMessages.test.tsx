import { renderHook, waitFor } from '@testing-library/react'
import { useMessages } from '../useMessages'
import { messageService } from '@/lib/api'
import { createMockMessage, mockApiResponse } from '@/lib/test-utils'

// Mock the message service
jest.mock('@/lib/api', () => ({
  messageService: {
    getMessages: jest.fn(),
    createMessage: jest.fn(),
    updateMessage: jest.fn(),
    deleteMessage: jest.fn(),
    sendMessage: jest.fn(),
    scheduleMessage: jest.fn(),
    duplicateMessage: jest.fn(),
  },
}))

const mockMessageService = messageService as jest.Mocked<typeof messageService>

describe('useMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches messages on mount', async () => {
    const mockMessages = [createMockMessage({ id: 1 }), createMockMessage({ id: 2 })]
    const mockResponse = {
      items: mockMessages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    }

    mockMessageService.getMessages.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useMessages())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.messages).toEqual(mockMessages)
    expect(result.current.pagination).toEqual(mockResponse.pagination)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch messages'
    mockMessageService.getMessages.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.messages).toEqual([])
  })

  it('creates new message', async () => {
    const existingMessage = createMockMessage({ id: 1 })
    const newMessage = createMockMessage({ id: 2, title: 'New Message' })

    mockMessageService.getMessages.mockResolvedValue({
      items: [existingMessage],
      pagination: { total: 1, page: 1, limit: 10, pages: 1 },
    })
    mockMessageService.createMessage.mockResolvedValue(newMessage)

    const { result } = renderHook(() => useMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.actions.create({
      title: 'New Message',
      content: 'New content',
      type: 'text',
    })

    expect(mockMessageService.createMessage).toHaveBeenCalledWith({
      title: 'New Message',
      content: 'New content',
      type: 'text',
    })
    expect(result.current.messages).toEqual([newMessage, existingMessage])
  })

  it('updates existing message', async () => {
    const originalMessage = createMockMessage({ id: 1, title: 'Original' })
    const updatedMessage = createMockMessage({ id: 1, title: 'Updated' })

    mockMessageService.getMessages.mockResolvedValue({
      items: [originalMessage],
      pagination: { total: 1, page: 1, limit: 10, pages: 1 },
    })
    mockMessageService.updateMessage.mockResolvedValue(updatedMessage)

    const { result } = renderHook(() => useMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.actions.update(1, { title: 'Updated' })

    expect(mockMessageService.updateMessage).toHaveBeenCalledWith(1, { title: 'Updated' })
    expect(result.current.messages[0]).toEqual(updatedMessage)
  })

  it('deletes message', async () => {
    const message1 = createMockMessage({ id: 1 })
    const message2 = createMockMessage({ id: 2 })

    mockMessageService.getMessages.mockResolvedValue({
      items: [message1, message2],
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    })
    mockMessageService.deleteMessage.mockResolvedValue(undefined)

    const { result } = renderHook(() => useMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.actions.delete(1)

    expect(mockMessageService.deleteMessage).toHaveBeenCalledWith(1)
    expect(result.current.messages).toEqual([message2])
  })

  it('sends message', async () => {
    const draftMessage = createMockMessage({ id: 1, status: 'draft' })
    const sentMessage = createMockMessage({ id: 1, status: 'sent' })

    mockMessageService.getMessages.mockResolvedValue({
      items: [draftMessage],
      pagination: { total: 1, page: 1, limit: 10, pages: 1 },
    })
    mockMessageService.sendMessage.mockResolvedValue(sentMessage)

    const { result } = renderHook(() => useMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.actions.send(1, ['user1', 'user2'])

    expect(mockMessageService.sendMessage).toHaveBeenCalledWith(1, ['user1', 'user2'])
    expect(result.current.messages[0]).toEqual(sentMessage)
  })

  it('schedules message', async () => {
    const draftMessage = createMockMessage({ id: 1, status: 'draft' })
    const scheduledMessage = createMockMessage({ id: 1, status: 'scheduled' })

    mockMessageService.getMessages.mockResolvedValue({
      items: [draftMessage],
      pagination: { total: 1, page: 1, limit: 10, pages: 1 },
    })
    mockMessageService.scheduleMessage.mockResolvedValue(scheduledMessage)

    const { result } = renderHook(() => useMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const scheduledAt = '2024-12-01T10:00:00Z'
    await result.current.actions.schedule(1, scheduledAt, ['user1'])

    expect(mockMessageService.scheduleMessage).toHaveBeenCalledWith(1, scheduledAt, ['user1'])
    expect(result.current.messages[0]).toEqual(scheduledMessage)
  })

  it('duplicates message', async () => {
    const originalMessage = createMockMessage({ id: 1, title: 'Original' })
    const duplicatedMessage = createMockMessage({ id: 2, title: 'Original (Copy)' })

    mockMessageService.getMessages.mockResolvedValue({
      items: [originalMessage],
      pagination: { total: 1, page: 1, limit: 10, pages: 1 },
    })
    mockMessageService.duplicateMessage.mockResolvedValue(duplicatedMessage)

    const { result } = renderHook(() => useMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.actions.duplicate(1)

    expect(mockMessageService.duplicateMessage).toHaveBeenCalledWith(1)
    expect(result.current.messages).toEqual([duplicatedMessage, originalMessage])
  })
})
/**
 * メッセージ保存用のlocalStorageユーティリティ
 */

export interface SavedMessage {
  id: string
  title: string
  content: string
  scheduleSettings: {
    sendDate: string
    sendTime: string
    targetAudience: string
  }
  businessTemplate?: {
    businessType: string
    targetCustomer: string
    objectives: string[]
  }
  status: 'draft' | 'scheduled' | 'sent'
  createdAt: string
  sentAt?: string
  recipients?: number
  responses?: number
  type: 'text'
}

const STORAGE_KEY = 'l-core-saved-messages'

/**
 * 全てのメッセージを取得
 */
export function getSavedMessages(): SavedMessage[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load messages:', error)
    return []
  }
}

/**
 * メッセージを保存
 */
export function saveMessage(message: Omit<SavedMessage, 'id' | 'createdAt' | 'status'>): SavedMessage {
  const messages = getSavedMessages()

  const newMessage: SavedMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    recipients: 0,
    responses: 0
  }

  messages.unshift(newMessage)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))

  return newMessage
}

/**
 * メッセージを削除
 */
export function deleteMessage(id: string): void {
  const messages = getSavedMessages()
  const filtered = messages.filter(msg => msg.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * メッセージを更新
 */
export function updateMessage(id: string, updates: Partial<SavedMessage>): void {
  const messages = getSavedMessages()
  const updated = messages.map(msg =>
    msg.id === id ? { ...msg, ...updates } : msg
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

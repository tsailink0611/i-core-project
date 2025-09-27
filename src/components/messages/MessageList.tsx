'use client'

import { memo, useCallback, useMemo } from 'react'
import Link from 'next/link'

interface Message {
  id: number
  title: string
  content: string
  status: string
  sentAt?: string
  scheduledAt?: string
  recipients: number
  responses: number
  type: string
}

interface MessageListProps {
  messages: Message[]
  onMessageAction?: (messageId: number, action: string) => void
}

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const styles = {
    sent: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800'
  }

  const labels = {
    sent: '送信済み',
    scheduled: 'スケジュール済み',
    draft: '下書き',
    failed: '送信失敗'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
})

const TypeIcon = memo(function TypeIcon({ type }: { type: string }) {
  const icons = {
    text: '📝',
    image: '🖼️',
    video: '🎬',
    template: '📋',
    flex: '🎨'
  }

  return <span className="text-lg">{icons[type as keyof typeof icons] || '📝'}</span>
})

const MessageItem = memo(function MessageItem({
  message,
  onAction
}: {
  message: Message
  onAction?: (messageId: number, action: string) => void
}) {
  const handleAction = useCallback((action: string) => {
    onAction?.(message.id, action)
  }, [message.id, onAction])

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(message.content)
  }, [message.content])

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <TypeIcon type={message.type} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {message.title}
              </h3>
              <StatusBadge status={message.status} />
            </div>
            <p className="text-gray-600 mb-3 line-clamp-2">
              {message.content}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              {message.status === 'sent' && (
                <>
                  <span>送信日時: {message.sentAt}</span>
                  <span>配信数: {message.recipients.toLocaleString()}名</span>
                  <span>応答数: {message.responses}件</span>
                </>
              )}
              {message.status === 'scheduled' && (
                <>
                  <span>配信予定: {message.scheduledAt}</span>
                  <span>配信予定数: {message.recipients.toLocaleString()}名</span>
                </>
              )}
              {message.status === 'draft' && (
                <span>下書き保存済み</span>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center space-x-2 ml-4">
          {message.status === 'draft' && (
            <>
              <button
                onClick={() => handleAction('edit')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                編集
              </button>
              <button
                onClick={() => handleAction('send')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
              >
                送信
              </button>
            </>
          )}
          {message.status === 'scheduled' && (
            <>
              <button
                onClick={() => handleAction('edit')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                編集
              </button>
              <button
                onClick={() => handleAction('cancel')}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                キャンセル
              </button>
            </>
          )}
          {message.status === 'sent' && (
            <>
              <button
                onClick={() => handleAction('detail')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                詳細
              </button>
              <button
                onClick={() => handleAction('copy')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                複製
              </button>
            </>
          )}
          <button
            onClick={handleCopyToClipboard}
            className="text-gray-400 hover:text-gray-600"
            title="メッセージをコピー"
          >
            📋
          </button>
        </div>
      </div>
    </div>
  )
})

const MessageList = memo(function MessageList({ messages, onMessageAction }: MessageListProps) {
  const handleMessageAction = useCallback((messageId: number, action: string) => {
    onMessageAction?.(messageId, action)
  }, [onMessageAction])

  const EmptyState = useMemo(() => (
    <div className="p-12 text-center">
      <div className="text-gray-400 text-4xl mb-4">📭</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">メッセージがありません</h3>
      <p className="text-gray-500 mb-6">
        新しいメッセージを作成して始めましょう。
      </p>
      <Link
        href="/dashboard/messages/new"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        新規メッセージ作成
      </Link>
    </div>
  ), [])

  if (messages.length === 0) {
    return EmptyState
  }

  return (
    <div className="divide-y divide-gray-200">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onAction={handleMessageAction}
        />
      ))}
    </div>
  )
})

export default MessageList
'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { MessageTypeIcon } from './MessageTypeIcon'
import { formatDate, formatNumber } from '@/lib/utils'

export interface Message {
  id: number
  title: string
  content: string
  status: 'sent' | 'scheduled' | 'draft' | 'failed'
  sentAt?: string
  scheduledAt?: string
  recipients: number
  responses: number
  type: 'text' | 'image' | 'video' | 'template' | 'flex'
}

interface MessageCardProps {
  message: Message
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onDuplicate?: (id: number) => void
  onSend?: (id: number) => void
  onCancel?: (id: number) => void
}

export function MessageCard({
  message,
  onEdit,
  onDelete,
  onDuplicate,
  onSend,
  onCancel
}: MessageCardProps) {
  const getActionButtons = () => {
    switch (message.status) {
      case 'draft':
        return (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(message.id)}
              >
                編集
              </Button>
            )}
            {onSend && (
              <Button
                size="sm"
                onClick={() => onSend(message.id)}
              >
                送信
              </Button>
            )}
          </>
        )
      case 'scheduled':
        return (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(message.id)}
              >
                編集
              </Button>
            )}
            {onCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(message.id)}
              >
                キャンセル
              </Button>
            )}
          </>
        )
      case 'sent':
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
            >
              詳細
            </Button>
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(message.id)}
              >
                複製
              </Button>
            )}
          </>
        )
      default:
        return null
    }
  }

  const getTimeInfo = () => {
    if (message.status === 'sent' && message.sentAt) {
      return (
        <>
          <span>送信日時: {formatDate(message.sentAt)}</span>
          <span>配信数: {formatNumber(message.recipients)}名</span>
          <span>応答数: {formatNumber(message.responses)}件</span>
        </>
      )
    }

    if (message.status === 'scheduled' && message.scheduledAt) {
      return (
        <>
          <span>配信予定: {formatDate(message.scheduledAt)}</span>
          <span>配信予定数: {formatNumber(message.recipients)}名</span>
        </>
      )
    }

    if (message.status === 'draft') {
      return <span>下書き保存済み</span>
    }

    return null
  }

  return (
    <Card className="hover:bg-gray-50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <MessageTypeIcon type={message.type} />
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
                {getTimeInfo()}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {getActionButtons()}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(message.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
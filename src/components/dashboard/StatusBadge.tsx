'use client'

import { Badge } from '@/components/ui/Badge'

interface StatusBadgeProps {
  status: 'sent' | 'scheduled' | 'draft' | 'failed' | 'active' | 'completed' | 'pending'
}

const statusConfig = {
  sent: {
    label: '送信済み',
    variant: 'success' as const
  },
  scheduled: {
    label: 'スケジュール済み',
    variant: 'default' as const
  },
  draft: {
    label: '下書き',
    variant: 'secondary' as const
  },
  failed: {
    label: '送信失敗',
    variant: 'destructive' as const
  },
  active: {
    label: '実行中',
    variant: 'success' as const
  },
  completed: {
    label: '完了',
    variant: 'secondary' as const
  },
  pending: {
    label: '待機中',
    variant: 'warning' as const
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
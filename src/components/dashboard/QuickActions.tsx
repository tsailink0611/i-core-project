'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface QuickAction {
  href: string
  icon: string
  title: string
  description: string
}

const defaultActions: QuickAction[] = [
  {
    href: '/dashboard/messages/new',
    icon: '📝',
    title: 'メッセージ作成',
    description: '新しいメッセージを作成・送信'
  },
  {
    href: '/dashboard/campaigns/new',
    icon: '🚀',
    title: 'キャンペーン開始',
    description: '新しいキャンペーンを設定'
  },
  {
    href: '/dashboard/analytics',
    icon: '📊',
    title: '詳細分析',
    description: '詳細なレポートを確認'
  }
]

interface QuickActionsProps {
  actions?: QuickAction[]
  title?: string
}

export function QuickActions({
  actions = defaultActions,
  title = 'クイックアクション'
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
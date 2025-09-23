'use client'

import { useState } from 'react'
import Link from 'next/link'

// ダミーデータ（実際はAPIから取得）
const mockData = {
  stats: {
    totalMessages: 12450,
    sentToday: 234,
    responseRate: 18.5,
    activeUsers: 1825
  },
  recentMessages: [
    { id: 1, content: '新商品のご案内です', timestamp: '2025-09-21 10:30', status: 'sent', recipients: 1200 },
    { id: 2, content: 'キャンペーン情報をお届け', timestamp: '2025-09-21 09:15', status: 'scheduled', recipients: 800 },
    { id: 3, content: 'ありがとうございます！', timestamp: '2025-09-21 08:45', status: 'sent', recipients: 150 }
  ],
  campaigns: [
    { id: 1, name: '秋の新商品キャンペーン', status: 'active', progress: 65, responses: 342 },
    { id: 2, name: '会員限定セール', status: 'scheduled', progress: 0, responses: 0 },
    { id: 3, name: 'アンケート調査', status: 'completed', progress: 100, responses: 156 }
  ]
}

const StatCard = ({ title, value, subtitle, color = 'blue' }: {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  }

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-75">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    sent: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  }

  const labels = {
    sent: '送信済み',
    scheduled: 'スケジュール済み',
    failed: '送信失敗',
    active: '実行中',
    completed: '完了'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                l-core
              </Link>
              <nav className="ml-8 flex space-x-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  概要
                </button>
                <Link href="/dashboard/messages" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  メッセージ
                </Link>
                <Link href="/dashboard/analytics" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  分析
                </Link>
                <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  設定
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                新規メッセージ
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総送信数"
            value={mockData.stats.totalMessages.toLocaleString()}
            subtitle="累計メッセージ"
            color="blue"
          />
          <StatCard
            title="本日の送信"
            value={mockData.stats.sentToday}
            subtitle="今日送信済み"
            color="green"
          />
          <StatCard
            title="応答率"
            value={`${mockData.stats.responseRate}%`}
            subtitle="平均応答率"
            color="yellow"
          />
          <StatCard
            title="アクティブユーザー"
            value={mockData.stats.activeUsers.toLocaleString()}
            subtitle="30日間"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近のメッセージ */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">最近のメッセージ</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockData.recentMessages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{message.content}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-500">{message.timestamp}</p>
                        <p className="text-sm text-gray-500">{message.recipients}名に送信</p>
                      </div>
                    </div>
                    <StatusBadge status={message.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 進行中のキャンペーン */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">キャンペーン状況</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockData.campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {campaign.responses}件の応答
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/messages/new" className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-medium text-gray-900">メッセージ作成</h3>
                <p className="text-sm text-gray-500">新しいメッセージを作成・送信</p>
              </div>
            </Link>
            <Link href="/dashboard/campaigns/new" className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-medium text-gray-900">キャンペーン開始</h3>
                <p className="text-sm text-gray-500">新しいキャンペーンを設定</p>
              </div>
            </Link>
            <Link href="/dashboard/analytics" className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-medium text-gray-900">詳細分析</h3>
                <p className="text-sm text-gray-500">詳細なレポートを確認</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
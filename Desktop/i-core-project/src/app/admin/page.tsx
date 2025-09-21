'use client'

import { useState } from 'react'
import Link from 'next/link'

// ダミーデータ
const mockSystemData = {
  stats: {
    totalUsers: 1234,
    totalOrganizations: 89,
    totalMessages: 456789,
    systemHealth: 99.2,
    serverLoad: 45.6,
    monthlyRevenue: 2450000
  },
  recentActivity: [
    { id: 1, type: 'user_created', message: '新規ユーザー登録: tanaka@example.com', timestamp: '2025-09-21 20:45' },
    { id: 2, type: 'message_sent', message: '大量配信完了: 10,000件送信', timestamp: '2025-09-21 20:30' },
    { id: 3, type: 'system_alert', message: 'API使用量が80%に到達', timestamp: '2025-09-21 20:15' },
    { id: 4, type: 'organization_created', message: '新規組織作成: 株式会社サンプル', timestamp: '2025-09-21 19:50' }
  ],
  llmModels: [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', status: 'active', usage: 45231, cost: 89456 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', status: 'active', usage: 123456, cost: 12345 },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', status: 'testing', usage: 8901, cost: 23456 }
  ],
  alerts: [
    { id: 1, level: 'warning', message: 'サーバー負荷が高くなっています', timestamp: '2025-09-21 20:45' },
    { id: 2, level: 'info', message: 'データベース最適化が完了しました', timestamp: '2025-09-21 19:30' },
    { id: 3, level: 'error', message: 'API制限に到達したユーザーがいます', timestamp: '2025-09-21 18:15' }
  ]
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    testing: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800'
  }

  const labels = {
    active: '稼働中',
    testing: 'テスト中',
    inactive: '停止中',
    error: 'エラー'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}

const AlertBadge = ({ level }: { level: string }) => {
  const styles = {
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  }

  const icons = {
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[level as keyof typeof styles]}`}>
      <span className="mr-1">{icons[level as keyof typeof icons]}</span>
      {level.toUpperCase()}
    </span>
  )
}

export default function AdminPage() {
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
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                ADMIN
              </span>
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
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'users'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ユーザー管理
                </button>
                <button
                  onClick={() => setActiveTab('models')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'models'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  AIモデル管理
                </button>
                <button
                  onClick={() => setActiveTab('system')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'system'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  システム
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                ユーザー画面
              </Link>
              <div className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">システム管理</h1>
          <p className="text-gray-600 mt-1">l-coreシステムの管理・監視・設定</p>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* システム統計 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">👥</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">総ユーザー数</p>
                    <p className="text-2xl font-bold text-gray-900">{mockSystemData.stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🏢</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">組織数</p>
                    <p className="text-2xl font-bold text-gray-900">{mockSystemData.stats.totalOrganizations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📨</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">総メッセージ数</p>
                    <p className="text-2xl font-bold text-gray-900">{mockSystemData.stats.totalMessages.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">⚡</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">システム稼働率</p>
                    <p className="text-2xl font-bold text-green-600">{mockSystemData.stats.systemHealth}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">💻</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">サーバー負荷</p>
                    <p className="text-2xl font-bold text-blue-600">{mockSystemData.stats.serverLoad}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">💰</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">月間売上</p>
                    <p className="text-2xl font-bold text-green-600">¥{mockSystemData.stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* アラート */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">システムアラート</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {mockSystemData.alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertBadge level={alert.level} />
                        <span className="text-sm text-gray-900">{alert.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 最近のアクティビティ */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">最近のアクティビティ</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {mockSystemData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border-l-4 border-blue-400 bg-blue-50">
                      <span className="text-sm text-gray-900">{activity.message}</span>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">AIモデル管理</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                新規モデル追加
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      モデル名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      プロバイダー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      使用量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      コスト
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockSystemData.llmModels.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={model.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.usage.toLocaleString()} tokens
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{model.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">設定</button>
                        <button className="text-green-600 hover:text-green-900">統計</button>
                        <button className="text-red-600 hover:text-red-900">停止</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">システム設定</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">メンテナンスモード</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">新規登録許可</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">APIレート制限</span>
                  <input
                    type="number"
                    defaultValue="1000"
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">データベース状況</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">使用容量</span>
                  <span className="text-sm font-medium">2.4 GB / 100 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '2.4%' }}></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">接続数</span>
                  <span className="text-sm font-medium">45 / 1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">最終バックアップ</span>
                  <span className="text-sm font-medium">2025-09-21 03:00</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
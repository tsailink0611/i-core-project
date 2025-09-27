'use client'

import { useState } from 'react'
import Link from 'next/link'

// ダミーデータ
const mockMessages = [
  {
    id: 1,
    title: '新商品のご案内',
    content: '【NEW】秋の新商品が入荷しました！限定20%OFFで販売中です。詳細はこちら→',
    status: 'sent',
    sentAt: '2025-09-21 10:30',
    recipients: 1200,
    responses: 45,
    type: 'text'
  },
  {
    id: 2,
    title: 'キャンペーン情報',
    content: '🎉会員様限定！特別セールのお知らせです。今なら送料無料でお届けします。',
    status: 'scheduled',
    scheduledAt: '2025-09-22 09:00',
    recipients: 800,
    responses: 0,
    type: 'text'
  },
  {
    id: 3,
    title: '商品画像付きメッセージ',
    content: '人気商品の詳細画像をお送りします',
    status: 'draft',
    recipients: 0,
    responses: 0,
    type: 'image'
  },
  {
    id: 4,
    title: 'アンケート調査',
    content: 'お客様満足度向上のため、簡単なアンケートにご協力ください。',
    status: 'sent',
    sentAt: '2025-09-20 14:15',
    recipients: 500,
    responses: 156,
    type: 'template'
  }
]

const StatusBadge = ({ status }: { status: string }) => {
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
}

const TypeIcon = ({ type }: { type: string }) => {
  const icons = {
    text: '📝',
    image: '🖼️',
    video: '🎬',
    template: '📋',
    flex: '🎨'
  }

  return <span className="text-lg">{icons[type as keyof typeof icons] || '📝'}</span>
}

export default function MessagesPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = selectedTab === 'all' || message.status === selectedTab
    return matchesSearch && matchesTab
  })

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
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  概要
                </Link>
                <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  メッセージ
                </span>
                <Link href="/dashboard/templates" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  テンプレート
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
              <Link href="/dashboard/messages/new" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                新規メッセージ
              </Link>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">メッセージ管理</h1>
          <p className="text-gray-600 mt-1">メッセージの作成・送信・管理を行います</p>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* タブ */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: '全て' },
                  { key: 'sent', label: '送信済み' },
                  { key: 'scheduled', label: 'スケジュール' },
                  { key: 'draft', label: '下書き' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 検索 */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="メッセージを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  フィルター
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* メッセージリスト */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              メッセージ一覧 ({filteredMessages.length}件)
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
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
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          編集
                        </button>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                          送信
                        </button>
                      </>
                    )}
                    {message.status === 'scheduled' && (
                      <>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          編集
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          キャンセル
                        </button>
                      </>
                    )}
                    {message.status === 'sent' && (
                      <>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          詳細
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          複製
                        </button>
                      </>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">メッセージがありません</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? '検索条件に一致するメッセージが見つかりませんでした。' : '新しいメッセージを作成して始めましょう。'}
              </p>
              <Link href="/dashboard/messages/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                新規メッセージ作成
              </Link>
            </div>
          )}
        </div>

        {/* クイック統計 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📨</div>
              <div>
                <p className="text-sm font-medium text-gray-500">総送信数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockMessages.filter(m => m.status === 'sent').reduce((sum, m) => sum + m.recipients, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💬</div>
              <div>
                <p className="text-sm font-medium text-gray-500">総応答数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockMessages.filter(m => m.status === 'sent').reduce((sum, m) => sum + m.responses, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-500">平均応答率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const sentMessages = mockMessages.filter(m => m.status === 'sent')
                    const totalSent = sentMessages.reduce((sum, m) => sum + m.recipients, 0)
                    const totalResponses = sentMessages.reduce((sum, m) => sum + m.responses, 0)
                    return totalSent > 0 ? `${((totalResponses / totalSent) * 100).toFixed(1)}%` : '0%'
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
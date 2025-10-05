'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSavedMessages, updateMessage, type SavedMessage } from '@/lib/messageStorage'

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
  const router = useRouter()
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [resendingMessageId, setResendingMessageId] = useState<string | null>(null)

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadMessages = () => {
      const savedMessages = getSavedMessages()
      setMessages(savedMessages)
    }

    loadMessages()

    // Refresh messages when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMessages()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = selectedTab === 'all' || message.status === selectedTab
    return matchesSearch && matchesTab
  })

  const handleResend = async (message: SavedMessage) => {
    if (!confirm(`「${message.title}」を再送信しますか？\n\nメッセージ: ${message.content.substring(0, 50)}...`)) {
      return
    }

    setResendingMessageId(message.id)

    try {
      // Send message via LINE API
      const response = await fetch('/api/line/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.content,
          targetAudience: message.scheduleSettings.targetAudience || 'all'
        })
      })

      if (!response.ok) {
        throw new Error('メッセージの送信に失敗しました')
      }

      // Update message status to sent
      updateMessage(message.id, {
        status: 'sent',
        sentAt: new Date().toISOString()
      })

      // Reload messages
      setMessages(getSavedMessages())

      alert('メッセージを再送信しました')
    } catch (error) {
      console.error('Resend error:', error)
      alert('メッセージの再送信に失敗しました。\nエラー: ' + (error instanceof Error ? error.message : '不明なエラー'))
    } finally {
      setResendingMessageId(null)
    }
  }

  const handleEditAndSend = (message: SavedMessage) => {
    // Store message data in localStorage for the templates page to retrieve
    localStorage.setItem('l-core-edit-message', JSON.stringify({
      title: message.title,
      content: message.content,
      scheduleSettings: message.scheduleSettings,
      businessTemplate: message.businessTemplate
    }))

    // Navigate to templates page
    router.push('/dashboard/templates')
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

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
                <Link href="/dashboard/cost" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  コスト管理
                </Link>
                <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  設定
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/templates" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
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
                        {message.status === 'sent' && message.sentAt && (
                          <>
                            <span>送信日時: {formatDateTime(message.sentAt)}</span>
                            <span>配信数: {(message.recipients || 0).toLocaleString()}名</span>
                            <span>応答数: {(message.responses || 0)}件</span>
                          </>
                        )}
                        {message.status === 'scheduled' && (
                          <>
                            <span>配信予定: {message.scheduleSettings.sendDate} {message.scheduleSettings.sendTime}</span>
                            <span>対象: {message.scheduleSettings.targetAudience || '全会員'}</span>
                          </>
                        )}
                        {message.status === 'draft' && (
                          <>
                            <span>下書き保存済み</span>
                            <span>作成日時: {formatDateTime(message.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center space-x-2 ml-4">
                    {message.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleEditAndSend(message)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleResend(message)}
                          disabled={resendingMessageId === message.id}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {resendingMessageId === message.id ? '送信中...' : '送信'}
                        </button>
                      </>
                    )}
                    {message.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleEditAndSend(message)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleResend(message)}
                          disabled={resendingMessageId === message.id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {resendingMessageId === message.id ? '送信中...' : '今すぐ送信'}
                        </button>
                      </>
                    )}
                    {message.status === 'sent' && (
                      <>
                        <button
                          onClick={() => handleResend(message)}
                          disabled={resendingMessageId === message.id}
                          className="text-green-600 hover:text-green-800 text-sm font-medium disabled:text-gray-400"
                        >
                          {resendingMessageId === message.id ? '送信中...' : '再送信'}
                        </button>
                        <button
                          onClick={() => handleEditAndSend(message)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          編集して送信
                        </button>
                      </>
                    )}
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
              <Link href="/dashboard/templates" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
                  {messages.filter(m => m.status === 'sent').reduce((sum, m) => sum + (m.recipients || 0), 0).toLocaleString()}
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
                  {messages.filter(m => m.status === 'sent').reduce((sum, m) => sum + (m.responses || 0), 0)}
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
                    const sentMessages = messages.filter(m => m.status === 'sent')
                    const totalSent = sentMessages.reduce((sum, m) => sum + (m.recipients || 0), 0)
                    const totalResponses = sentMessages.reduce((sum, m) => sum + (m.responses || 0), 0)
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

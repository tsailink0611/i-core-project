'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MessageForm {
  title: string
  content: string
  type: 'text' | 'image' | 'template' | 'flex'
  sendType: 'immediate' | 'scheduled'
  scheduledAt: string
  recipients: 'all' | 'segment' | 'custom'
  useAI: boolean
  aiPrompt: string
}

export default function NewMessagePage() {
  const [form, setForm] = useState<MessageForm>({
    title: '',
    content: '',
    type: 'text',
    sendType: 'immediate',
    scheduledAt: '',
    recipients: 'all',
    useAI: false,
    aiPrompt: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleInputChange = (field: keyof MessageForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const generateWithAI = async () => {
    setIsGenerating(true)
    // AI生成のシミュレーション
    setTimeout(() => {
      setForm(prev => ({
        ...prev,
        content: `【AI自動生成】${prev.aiPrompt}に基づいて作成されたメッセージです。\n\nこんにちは！お客様に特別なご案内をお届けします。\n\n✨ 限定20%OFFキャンペーン実施中 ✨\n\n期間限定でお得にお買い物いただけます。この機会をお見逃しなく！\n\n詳細はこちら → https://example.com/campaign`
      }))
      setIsGenerating(false)
    }, 2000)
  }

  const handleSubmit = (action: 'save' | 'send') => {
    console.log(`${action} message:`, form)
    // 実際の処理はここに実装
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
              <Link href="/dashboard/messages" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                キャンセル
              </Link>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">新規メッセージ作成</h1>
          <p className="text-gray-600 mt-1">AIアシスタント機能を使って効率的にメッセージを作成</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メイン編集エリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メッセージタイトル
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="例: 新商品のご案内"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メッセージタイプ
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="text">テキストメッセージ</option>
                    <option value="image">画像付きメッセージ</option>
                    <option value="template">テンプレートメッセージ</option>
                    <option value="flex">Flexメッセージ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI生成機能 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">🤖 AI アシスタント</h2>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.useAI}
                    onChange={(e) => handleInputChange('useAI', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">AI生成を使用</span>
                </label>
              </div>

              {form.useAI && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      生成指示（プロンプト）
                    </label>
                    <textarea
                      value={form.aiPrompt}
                      onChange={(e) => handleInputChange('aiPrompt', e.target.value)}
                      placeholder="例: 新商品の20%OFFキャンペーンを告知する親しみやすいメッセージを作成してください"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={generateWithAI}
                    disabled={isGenerating || !form.aiPrompt.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        生成中...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        AIで生成
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* メッセージ内容 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">メッセージ内容</h2>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {previewMode ? '編集モード' : 'プレビュー'}
                </button>
              </div>

              {previewMode ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <div className="bg-white rounded-lg p-4 max-w-sm mx-auto shadow-sm">
                    <div className="text-sm text-gray-500 mb-2">LINEプレビュー</div>
                    <div className="whitespace-pre-wrap text-sm">
                      {form.content || 'メッセージ内容がここに表示されます'}
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  value={form.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="メッセージ内容を入力してください..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              <div className="mt-2 text-sm text-gray-500">
                {form.content.length} / 5000 文字
              </div>
            </div>
          </div>

          {/* サイドパネル */}
          <div className="space-y-6">
            {/* 送信設定 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">送信設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    送信タイミング
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="immediate"
                        checked={form.sendType === 'immediate'}
                        onChange={(e) => handleInputChange('sendType', e.target.value)}
                        className="mr-2"
                      />
                      即座に送信
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="scheduled"
                        checked={form.sendType === 'scheduled'}
                        onChange={(e) => handleInputChange('sendType', e.target.value)}
                        className="mr-2"
                      />
                      日時を指定
                    </label>
                  </div>
                </div>

                {form.sendType === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      送信日時
                    </label>
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    送信対象
                  </label>
                  <select
                    value={form.recipients}
                    onChange={(e) => handleInputChange('recipients', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全ユーザー (1,234名)</option>
                    <option value="segment">セグメント別</option>
                    <option value="custom">カスタム選択</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 予想効果 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">予想効果</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">配信数</span>
                  <span className="text-sm font-medium">1,234名</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">開封予想</span>
                  <span className="text-sm font-medium">約85% (1,049名)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">応答予想</span>
                  <span className="text-sm font-medium">約18% (222名)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">コスト見積</span>
                  <span className="text-sm font-medium">¥247</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              <button
                onClick={() => handleSubmit('send')}
                disabled={!form.title.trim() || !form.content.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {form.sendType === 'immediate' ? '今すぐ送信' : 'スケジュール設定'}
              </button>

              <button
                onClick={() => handleSubmit('save')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700"
              >
                下書き保存
              </button>

              <Link
                href="/dashboard/messages"
                className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 text-center block"
              >
                キャンセル
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: '',
    lineChannelId: '',
    lineChannelSecret: '',
    openaiApiKey: '',
    timezone: 'Asia/Tokyo',
    language: 'ja',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
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
                <Link href="/dashboard/messages" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  メッセージ
                </Link>
                <Link href="/dashboard/templates" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  テンプレート
                </Link>
                <Link href="/dashboard/analytics" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  分析
                </Link>
                <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  設定
                </span>
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
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600 mt-1">L-Coreシステムの各種設定を管理します</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本設定 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">基本設定</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店舗名
                  </label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 居酒屋さくら"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイムゾーン
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Tokyo">日本時間 (JST)</option>
                    <option value="America/New_York">東部時間 (EST)</option>
                    <option value="Europe/London">グリニッジ標準時 (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    言語
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LINE設定 */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">LINE設定</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    チャンネルID
                  </label>
                  <input
                    type="text"
                    value={settings.lineChannelId}
                    onChange={(e) => setSettings({...settings, lineChannelId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="LINE公式アカウントのチャンネルID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    チャンネルシークレット
                  </label>
                  <input
                    type="password"
                    value={settings.lineChannelSecret}
                    onChange={(e) => setSettings({...settings, lineChannelSecret: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="LINE公式アカウントのチャンネルシークレット"
                  />
                </div>
              </div>
            </div>

            {/* AI設定 */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">AI設定</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({...settings, openaiApiKey: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="GPT-5-mini用のAPIキー"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    GPT-5-miniを使用するためのAPIキーを入力してください
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 通知設定 */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">通知設定</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    メール通知
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, email: e.target.checked}
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    プッシュ通知
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, push: e.target.checked}
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    SMS通知
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, sms: e.target.checked}
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* システム情報 */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">システム情報</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">バージョン</span>
                  <span className="text-gray-900">v1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">更新日</span>
                  <span className="text-gray-900">2025-09-28</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">API状態</span>
                  <span className="text-green-600">正常</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
            設定を保存
          </button>
        </div>
      </main>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'

type RichMenuTemplate = 'reservation' | 'menu' | 'coupon'
type ActionType = 'url' | 'text' | 'none'

interface ButtonAction {
  type: ActionType
  label: string
  data: string // URL or text to send
}

interface RichMenuData {
  title: string
  startDate: string
  endDate: string
  template: RichMenuTemplate
  buttons: ButtonAction[]
}

export default function RichMenuPage() {
  const [menuData, setMenuData] = useState<RichMenuData>({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    template: 'reservation',
    buttons: [
      { type: 'url', label: '予約する', data: '' },
      { type: 'url', label: 'メニュー', data: '' },
      { type: 'url', label: 'クーポン', data: '' },
      { type: 'url', label: 'アクセス', data: '' },
      { type: 'text', label: 'お問い合わせ', data: 'お問い合わせ' },
      { type: 'url', label: '公式サイト', data: '' },
    ],
  })

  const templates = [
    {
      id: 'reservation' as RichMenuTemplate,
      name: '予約型',
      description: '予約ボタンを中心に配置',
      icon: '📅',
    },
    {
      id: 'menu' as RichMenuTemplate,
      name: 'メニュー表示型',
      description: '商品・サービス紹介',
      icon: '📋',
    },
    {
      id: 'coupon' as RichMenuTemplate,
      name: 'クーポン型',
      description: '特典・割引訴求',
      icon: '🎫',
    },
  ]

  const handleSave = () => {
    console.log('Rich Menu Data:', menuData)
    alert('リッチメニューが保存されました！（デモモード）')
  }

  const updateButton = (index: number, field: keyof ButtonAction, value: string) => {
    const newButtons = [...menuData.buttons]
    newButtons[index] = { ...newButtons[index], [field]: value }
    setMenuData({ ...menuData, buttons: newButtons })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-purple-600 hover:text-purple-800 mb-4 inline-block"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📱 リッチメニュー作成
          </h1>
          <p className="text-gray-600">
            トークルームに表示される視覚的なメニューを作成します
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Settings */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 基本設定</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={menuData.title}
                    onChange={(e) => setMenuData({ ...menuData, title: e.target.value })}
                    placeholder="例: 秋のキャンペーンメニュー"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ※タイトルはLINE Official Account Managerのみで使用されます
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      表示開始日
                    </label>
                    <input
                      type="date"
                      value={menuData.startDate}
                      onChange={(e) => setMenuData({ ...menuData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      表示終了日
                    </label>
                    <input
                      type="date"
                      value={menuData.endDate}
                      onChange={(e) => setMenuData({ ...menuData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎨 テンプレート選択</h2>

              <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setMenuData({ ...menuData, template: template.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      menuData.template === template.id
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{template.icon}</div>
                    <div className="font-semibold text-sm text-gray-800">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Button Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🔘 ボタン設定</h2>

              <div className="space-y-4">
                {menuData.buttons.map((button, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-700">ボタン {index + 1}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          ボタンテキスト
                        </label>
                        <input
                          type="text"
                          value={button.label}
                          onChange={(e) => updateButton(index, 'label', e.target.value)}
                          placeholder="例: 予約する"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          アクション
                        </label>
                        <select
                          value={button.type}
                          onChange={(e) => updateButton(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="url">URLを開く</option>
                          <option value="text">テキストを送信</option>
                          <option value="none">なし</option>
                        </select>
                      </div>

                      {button.type === 'url' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            value={button.data}
                            onChange={(e) => updateButton(index, 'data', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      )}

                      {button.type === 'text' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            送信テキスト
                          </label>
                          <input
                            type="text"
                            value={button.data}
                            onChange={(e) => updateButton(index, 'data', e.target.value)}
                            placeholder="例: お問い合わせ"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              💾 リッチメニューを保存
            </button>
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">👀 プレビュー</h2>

              {/* iPhone Frame */}
              <div className="mx-auto max-w-sm">
                <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-gray-100 h-12 flex items-center justify-center">
                      <div className="text-xs font-semibold">9:41</div>
                    </div>

                    {/* Chat Area */}
                    <div className="bg-[#E5DDD5] h-64 p-4">
                      <div className="text-center text-gray-500 text-sm">
                        トークルーム
                      </div>
                    </div>

                    {/* Rich Menu */}
                    <div className="bg-white border-t-2 border-gray-200">
                      <div className="grid grid-cols-3 gap-0 border-b border-gray-200">
                        {menuData.buttons.slice(0, 3).map((button, index) => (
                          <div
                            key={index}
                            className="aspect-square border-r border-gray-200 last:border-r-0 flex flex-col items-center justify-center p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-2xl mb-1">
                              {button.type === 'url' ? '🔗' : button.type === 'text' ? '💬' : '📌'}
                            </div>
                            <div className="text-xs font-medium text-gray-700 text-center leading-tight">
                              {button.label || `ボタン${index + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-0">
                        {menuData.buttons.slice(3, 6).map((button, index) => (
                          <div
                            key={index + 3}
                            className="aspect-square border-r border-gray-200 last:border-r-0 flex flex-col items-center justify-center p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-2xl mb-1">
                              {button.type === 'url' ? '🔗' : button.type === 'text' ? '💬' : '📌'}
                            </div>
                            <div className="text-xs font-medium text-gray-700 text-center leading-tight">
                              {button.label || `ボタン${index + 4}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>💡 デモモード:</strong> 実際のLINE連携はまだ実装されていません。保存ボタンをクリックするとコンソールに設定内容が出力されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

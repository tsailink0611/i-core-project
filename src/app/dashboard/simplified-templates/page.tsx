'use client'

import { useState } from 'react'
import Link from 'next/link'
import { simplifiedBusinessCategories, simplifiedBusinessTemplates, generatePersonaPrompt, type SimplifiedBusinessTemplate } from '@/lib/templates/simplifiedBusinessTemplates'

export default function SimplifiedTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<SimplifiedBusinessTemplate | null>(null)
  const [showPersonaAI, setShowPersonaAI] = useState(false)
  const [promotionSuggestions, setPromotionSuggestions] = useState<string[]>([])
  const [messageSchedules, setMessageSchedules] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingSchedules, setIsGeneratingSchedules] = useState(false)

  const resetSelection = () => {
    setSelectedCategory('')
    setSelectedSubCategory('')
    setSelectedTemplate(null)
    setShowPersonaAI(false)
    setPromotionSuggestions([])
    setMessageSchedules([])
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubCategory('')
    setSelectedTemplate(null)
    setShowPersonaAI(false)
  }

  const handleSubCategorySelect = (subCategory: string) => {
    setSelectedSubCategory(subCategory)
    setSelectedTemplate(null)
    setShowPersonaAI(false)
  }

  const handleTemplateSelect = (businessType: string) => {
    const template = simplifiedBusinessTemplates[businessType.replace(/\s+/g, '_').toLowerCase() + '_template']
    if (template) {
      setSelectedTemplate(template)
      setShowPersonaAI(true)
    } else {
      // デモ用のテンプレートを作成
      const demoTemplate: SimplifiedBusinessTemplate = {
        id: businessType.replace(/\s+/g, '_').toLowerCase(),
        name: businessType,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        storeName: `${businessType} 〇〇`,
        priceRange: '3000-8000円',
        atmosphere: '居心地の良い',
        targetCustomers: ['30代女性', '40代女性', '地域住民'],
        businessHours: '10:00-19:00（月曜定休）',
        features: `${businessType}の専門店として、お客様に最高のサービスを提供します。`,
        goals: 'リピーター獲得、顧客満足度向上、地域密着',
        messageStyle: '親しみやすい',
        persona: `あなたは${businessType}のオーナーとして、L-core（LINE公式アカウント販促システム）の運営責任者です。${selectedCategory}の専門家として、お客様との信頼関係を大切にしたコミュニケーションを心がけています。`
      }
      setSelectedTemplate(demoTemplate)
      setShowPersonaAI(true)
    }
  }

  const generatePromotionIdeas = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-persona-promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaPrompt: generatePersonaPrompt(selectedTemplate),
          businessTemplate: selectedTemplate
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPromotionSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Promotion generation error:', error)
      // デモ用の提案を表示
      setPromotionSuggestions([
        '季節限定メニューの告知（春の新メニュー、夏の冷たいメニュー等）',
        '記念日特典（開店記念日、お客様の誕生日等）',
        '天候連動キャンペーン（雨の日サービス、暑い日の特典等）',
        'リピーター向け特典（スタンプカード、会員限定サービス等）',
        'SNS連動企画（写真投稿キャンペーン、口コミ投稿特典等）'
      ])
    }
    setIsGenerating(false)
  }

  const generateMessageSchedules = async () => {
    if (!selectedTemplate) return

    setIsGeneratingSchedules(true)
    try {
      const response = await fetch('/api/generate-message-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaPrompt: generatePersonaPrompt(selectedTemplate),
          businessTemplate: selectedTemplate
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessageSchedules(data.schedules || [])
      }
    } catch (error) {
      console.error('Schedule generation error:', error)
      // デモ用のスケジュールを表示
      setMessageSchedules([
        {
          title: '平日ハッピーアワー告知',
          timing: '毎週月曜日 15:00',
          frequency: '週1回',
          message: '🍻今週もハッピーアワー開催中！平日17-19時はドリンク全品半額です♪ お仕事帰りにぜひお立ち寄りください！',
          purpose: '平日早い時間の集客向上'
        },
        {
          title: '週末おすすめメニュー',
          timing: '毎週金曜日 12:00',
          frequency: '週1回',
          message: '🐟週末は新鮮な海鮮料理をご用意してお待ちしております！土日は19時以降のご予約がおすすめです✨',
          purpose: '週末の来店促進'
        },
        {
          title: '雨の日特典告知',
          timing: '雨予報の日 10:00',
          frequency: '天候次第',
          message: '☔本日雨予報のため、お会計10%OFFサービス実施中！温かいお料理でお客様をお迎えします♪',
          purpose: '悪天候時の売上確保'
        }
      ])
    }
    setIsGeneratingSchedules(false)
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
                <Link href="/dashboard/simplified-templates" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずナビ */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={resetSelection} className="hover:text-blue-600">
              業種選択
            </button>
            {selectedCategory && (
              <>
                <span>{'>'}</span>
                <button
                  onClick={() => {
                    setSelectedSubCategory('')
                    setSelectedTemplate(null)
                    setShowPersonaAI(false)
                  }}
                  className="hover:text-blue-600"
                >
                  {selectedCategory}
                </button>
              </>
            )}
            {selectedSubCategory && (
              <>
                <span>{'>'}</span>
                <button
                  onClick={() => {
                    setSelectedTemplate(null)
                    setShowPersonaAI(false)
                  }}
                  className="hover:text-blue-600"
                >
                  {selectedSubCategory}
                </button>
              </>
            )}
            {selectedTemplate && (
              <>
                <span>{'>'}</span>
                <span className="text-blue-600 font-medium">{selectedTemplate.name}</span>
              </>
            )}
          </div>
        </div>

        {/* メインカテゴリ選択 */}
        {!selectedCategory && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              業種カテゴリを選択してください
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.keys(simplifiedBusinessCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-300"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">
                      {category === '飲食業' ? '🍽️' :
                       category === 'サロン・美容' ? '💄' : '🏥'}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{category}</h3>
                    <p className="text-gray-600 text-sm">
                      {category === '飲食業' ? '居酒屋、和食、洋食、カフェ・バー等' :
                       category === 'サロン・美容' ? '美容院、ネイル、エステ、マッサージ等' :
                       'クリニック、歯科、整骨院、治療院等'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* サブカテゴリ選択 */}
        {selectedCategory && !selectedSubCategory && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedCategory}の詳細分野を選択
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(simplifiedBusinessCategories[selectedCategory]).map((subCategory) => (
                <button
                  key={subCategory}
                  onClick={() => handleSubCategorySelect(subCategory)}
                  className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{subCategory}</h3>
                  <p className="text-sm text-gray-600">
                    {simplifiedBusinessCategories[selectedCategory][subCategory].length}種類のテンプレート
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 業種テンプレート選択 */}
        {selectedCategory && selectedSubCategory && !selectedTemplate && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedSubCategory}の具体的な業種を選択
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {simplifiedBusinessCategories[selectedCategory][selectedSubCategory].map((businessType) => (
                <button
                  key={businessType}
                  onClick={() => handleTemplateSelect(businessType)}
                  className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300 text-left"
                >
                  <h4 className="font-medium text-gray-900">{businessType}</h4>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 選択されたテンプレート表示 & ペルソナAI */}
        {selectedTemplate && (
          <div className="space-y-8">
            {/* 自動入力されたテンプレート */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ✅ {selectedTemplate.name} - 自動入力完了
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">店舗名</label>
                    <input type="text" value={selectedTemplate.storeName} readOnly
                           className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">価格帯</label>
                    <input type="text" value={selectedTemplate.priceRange} readOnly
                           className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">雰囲気</label>
                    <input type="text" value={selectedTemplate.atmosphere} readOnly
                           className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">営業時間</label>
                    <input type="text" value={selectedTemplate.businessHours} readOnly
                           className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ターゲット客層</label>
                    <input type="text" value={selectedTemplate.targetCustomers.join('、')} readOnly
                           className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メッセージスタイル</label>
                    <input type="text" value={selectedTemplate.messageStyle} readOnly
                           className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">店舗の特徴・強み</label>
                <textarea value={selectedTemplate.features} readOnly rows={3}
                         className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
            </div>

            {/* ペルソナAI設定 */}
            {showPersonaAI && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🤖 専用AIペルソナ作成完了
                </h3>
                <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">あなた専用のAIアシスタント設定</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedTemplate.persona}</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={generatePromotionIdeas}
                    disabled={isGenerating}
                    className={`${isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } text-white px-6 py-3 rounded-lg font-medium flex items-center`}
                  >
                    <span className="mr-2">💡</span>
                    {isGenerating ? 'AI提案生成中...' : 'プロモーション企画を提案してもらう'}
                  </button>

                  <button
                    onClick={generateMessageSchedules}
                    disabled={isGeneratingSchedules}
                    className={`${isGeneratingSchedules
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    } text-white px-6 py-3 rounded-lg font-medium flex items-center`}
                  >
                    <span className="mr-2">📅</span>
                    {isGeneratingSchedules ? 'スケジュール生成中...' : '配信スケジュール＆メッセージ生成'}
                  </button>
                </div>
              </div>
            )}

            {/* AIからのプロモーション提案 */}
            {promotionSuggestions.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📢 AIからのプロモーション提案
                </h3>
                <div className="space-y-3">
                  {promotionSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-800">{suggestion}</p>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(suggestion)}
                          className="ml-4 text-sm text-blue-600 hover:text-blue-700"
                        >
                          📋 コピー
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  💡 これらの提案をコピー&ペーストして、具体的なメッセージ作成にお使いください。
                </div>
              </div>
            )}

            {/* メッセージスケジュール */}
            {messageSchedules.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📅 配信スケジュール＆メッセージ（完成版）
                </h3>
                <div className="space-y-4">
                  {messageSchedules.map((schedule, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{schedule.title}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">配信タイミング:</span><br />
                              {schedule.timing}
                            </div>
                            <div>
                              <span className="font-medium">配信頻度:</span><br />
                              {schedule.frequency}
                            </div>
                            <div>
                              <span className="font-medium">目的:</span><br />
                              {schedule.purpose}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">配信メッセージ（コピー用）</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(schedule.message)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 flex items-center"
                          >
                            📋 メッセージをコピー
                          </button>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{schedule.message}</p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            const scheduleText = `【${schedule.title}】\n配信: ${schedule.timing}\n頻度: ${schedule.frequency}\n目的: ${schedule.purpose}\n\nメッセージ:\n${schedule.message}`
                            navigator.clipboard.writeText(scheduleText)
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                          📋 スケジュール全体をコピー
                        </button>
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          📱 LINE配信予約（準備中）
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-medium text-gray-900 mb-2">💡 使い方</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 「メッセージをコピー」でLINE公式アカウントに直接ペースト可能</li>
                    <li>• 「スケジュール全体をコピー」で管理表やカレンダーアプリに保存</li>
                    <li>• 配信タイミングに合わせて手動送信、または将来的に自動配信機能を利用</li>
                    <li>• メッセージは{selectedTemplate?.name}専用に最適化済み</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBusinessTemplate } from '@/lib/templates/businessTemplates'
import { getPromotionTemplates, getSeasonalPromotions, type PromotionTemplate, type BusinessPromotions } from '@/lib/templates/promotionTemplates'
import { BUSINESS_CATEGORIES, getMainCategories, getSubCategories, getBusinessTypes } from '@/constants/businessCategories'
import type { BusinessTemplate } from '@/types/business'

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('')
  const [showCustomization, setShowCustomization] = useState(false)
  const [businessDetails, setBusinessDetails] = useState<BusinessTemplate>({
    storeName: '',
    priceRange: '',
    atmosphere: '',
    targetCustomers: [] as string[],
    businessHours: '',
    features: '',
    goals: '',
    messageStyle: ''
  })
  const [aiMessages, setAiMessages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [availablePromotions, setAvailablePromotions] = useState<BusinessPromotions | null>(null)
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionTemplate | null>(null)
  const [showPromotionSelector, setShowPromotionSelector] = useState(false)

  const resetSelection = () => {
    setSelectedCategory('')
    setSelectedSubCategory('')
    setSelectedBusinessType('')
    setShowCustomization(false)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubCategory('')
    setSelectedBusinessType('')
    setShowCustomization(false)
  }

  const handleSubCategorySelect = (subCategory: string) => {
    setSelectedSubCategory(subCategory)
    setSelectedBusinessType('')
    setShowCustomization(false)
  }

  const handleBusinessTypeSelect = (businessType: string) => {
    setSelectedBusinessType(businessType)
    setShowCustomization(true)

    // テンプレートデータを自動設定
    const template = getBusinessTemplate(selectedCategory, selectedSubCategory, businessType)
    if (template) {
      setBusinessDetails({
        ...template,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        businessType: businessType
      })
    }

    // プロモーションテンプレートを読み込み
    const promotions = getPromotionTemplates(selectedCategory, selectedSubCategory, businessType)
    setAvailablePromotions(promotions)
    setSelectedPromotion(null)
    setShowPromotionSelector(true)
  }

  // AI応答テスト関数
  const handleAITest = async () => {
    setIsGenerating(true)
    setAiMessages([])

    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessTemplate: businessDetails,
          count: 3,
          selectedPromotion: selectedPromotion
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiMessages(data.messages || [])
      } else {
        setAiMessages(['エラー: メッセージの生成に失敗しました。'])
      }
    } catch (error) {
      console.error('AI Test Error:', error)
      setAiMessages(['エラー: ネットワークエラーが発生しました。'])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setBusinessDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleCustomerToggle = (customer: string) => {
    setBusinessDetails(prev => ({
      ...prev,
      targetCustomers: prev.targetCustomers.includes(customer)
        ? prev.targetCustomers.filter(c => c !== customer)
        : [...prev.targetCustomers, customer]
    }))
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
                <Link href="/dashboard/templates" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  テンプレート
                </Link>
                <Link href="/dashboard/analytics" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  分析
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずナビ */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={resetSelection}
              className="hover:text-blue-600"
            >
              業種選択
            </button>
            {selectedCategory && (
              <>
                <span>{'>'}</span>
                <button
                  onClick={() => {
                    setSelectedSubCategory('')
                    setSelectedBusinessType('')
                    setShowCustomization(false)
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
                    setSelectedBusinessType('')
                    setShowCustomization(false)
                  }}
                  className="hover:text-blue-600"
                >
                  {selectedSubCategory}
                </button>
              </>
            )}
            {selectedBusinessType && (
              <>
                <span>{'>'}</span>
                <span className="text-blue-600 font-medium">{selectedBusinessType}</span>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {!selectedCategory && '業種別テンプレート選択'}
            {selectedCategory && !selectedSubCategory && `${selectedCategory} - 業態選択`}
            {selectedSubCategory && !selectedBusinessType && `${selectedSubCategory} - 詳細タイプ選択`}
            {selectedBusinessType && '店舗情報カスタマイズ'}
          </h1>
          <p className="text-gray-600 mt-1">
            {!selectedCategory && 'お店の業種を選択して、最適なLINEメッセージテンプレートを設定しましょう'}
            {selectedCategory && !selectedSubCategory && 'より具体的な業態を選択してください'}
            {selectedSubCategory && !selectedBusinessType && '最も近いビジネスタイプを選択してください'}
            {selectedBusinessType && 'お店の詳細情報を入力して、専用AIアシスタントを作成します'}
          </p>
        </div>

        {/* 業種選択 */}
        {!selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(businessCategories).map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
              >
                <div className="text-lg font-semibold text-gray-900 mb-2">{category}</div>
                <div className="text-sm text-gray-600">
                  {Object.keys(businessCategories[category]).length}種類の業態
                </div>
              </button>
            ))}
          </div>
        )}

        {/* サブカテゴリ選択 */}
        {selectedCategory && !selectedSubCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(businessCategories[selectedCategory]).map((subCategory) => (
              <button
                key={subCategory}
                onClick={() => handleSubCategorySelect(subCategory)}
                className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
              >
                <div className="text-lg font-semibold text-gray-900 mb-2">{subCategory}</div>
                <div className="text-sm text-gray-600">
                  {businessCategories[selectedCategory][subCategory].length}つのタイプから選択
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ビジネスタイプ選択 */}
        {selectedSubCategory && !selectedBusinessType && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessCategories[selectedCategory][selectedSubCategory].map((businessType: string) => (
              <button
                key={businessType}
                onClick={() => handleBusinessTypeSelect(businessType)}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
              >
                <div className="text-base font-medium text-gray-900">{businessType}</div>
              </button>
            ))}
          </div>
        )}

        {/* カスタマイズフォーム */}
        {showCustomization && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedBusinessType}店の詳細設定
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">基本情報</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店舗名
                  </label>
                  <input
                    type="text"
                    placeholder="例: 居酒屋 田中"
                    value={businessDetails.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    客単価
                  </label>
                  <select
                    value={businessDetails.priceRange}
                    onChange={(e) => handleInputChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="1000未満">1,000円未満</option>
                    <option value="1000-3000">1,000-3,000円</option>
                    <option value="3000-5000">3,000-5,000円</option>
                    <option value="5000-10000">5,000-10,000円</option>
                    <option value="10000以上">10,000円以上</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店舗の雰囲気
                  </label>
                  <select
                    value={businessDetails.atmosphere}
                    onChange={(e) => handleInputChange('atmosphere', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="カジュアル">カジュアル・親しみやすい</option>
                    <option value="落ち着いた">落ち着いた・上品</option>
                    <option value="活気のある">活気のある・賑やか</option>
                    <option value="高級">高級・格式のある</option>
                    <option value="モダン">モダン・おしゃれ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    主な客層
                  </label>
                  <div className="space-y-2">
                    {['20代男性', '20代女性', '30代男性', '30代女性', '40代男性', '40代女性', '50代以上', 'ファミリー', 'カップル', 'ビジネス利用'].map((demographic) => (
                      <label key={demographic} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={businessDetails.targetCustomers.includes(demographic)}
                          onChange={() => handleCustomerToggle(demographic)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{demographic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 詳細設定 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">詳細設定</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    営業時間
                  </label>
                  <input
                    type="text"
                    placeholder="例: 17:00-24:00"
                    value={businessDetails.businessHours}
                    onChange={(e) => handleInputChange('businessHours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    特徴・売り
                  </label>
                  <textarea
                    placeholder="例: 新鮮な海鮮を使った料理、手作りの温かい料理、地元の食材にこだわり"
                    rows={3}
                    value={businessDetails.features}
                    onChange={(e) => handleInputChange('features', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店舗の目標・方針
                  </label>
                  <textarea
                    placeholder="例: お客様に居心地の良い時間を提供する、リピーターを増やす、地域に愛される店作り"
                    rows={3}
                    value={businessDetails.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メッセージトーン
                  </label>
                  <select
                    value={businessDetails.messageStyle}
                    onChange={(e) => handleInputChange('messageStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="親しみやすい">親しみやすい・フレンドリー</option>
                    <option value="丁寧">丁寧・礼儀正しい</option>
                    <option value="カジュアル">カジュアル・気軽</option>
                    <option value="高級感">高級感・上品</option>
                    <option value="地域密着">地域密着・温かい</option>
                  </select>
                </div>
              </div>
            </div>

            {/* プロモーション企画選択エリア */}
            {availablePromotions && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📢 プロモーション企画選択 (半自動テンプレート)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      定期プロモーション
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePromotions.regular.map((promo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPromotion(promo)}
                          className={`p-3 text-left rounded-lg border ${
                            selectedPromotion?.title === promo.title
                              ? 'border-blue-500 bg-blue-100'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{promo.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{promo.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            ターゲット: {promo.target.join('、')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      季節・イベント企画
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePromotions.seasonal.map((promo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPromotion(promo)}
                          className={`p-3 text-left rounded-lg border ${
                            selectedPromotion?.title === promo.title
                              ? 'border-blue-500 bg-blue-100'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{promo.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{promo.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            期待効果: {promo.expectedEffect}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      天候連動・特別企画
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[...availablePromotions.weather, ...availablePromotions.special].map((promo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPromotion(promo)}
                          className={`p-3 text-left rounded-lg border ${
                            selectedPromotion?.title === promo.title
                              ? 'border-blue-500 bg-blue-100'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{promo.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{promo.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            実施条件: {promo.trigger}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedPromotion && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-medium text-gray-900 mb-2">選択中の企画</h4>
                      <div className="text-sm space-y-1">
                        <div><strong>企画名:</strong> {selectedPromotion.title}</div>
                        <div><strong>内容:</strong> {selectedPromotion.description}</div>
                        <div><strong>ターゲット:</strong> {selectedPromotion.target.join('、')}</div>
                        <div><strong>期待効果:</strong> {selectedPromotion.expectedEffect}</div>
                        <div className="mt-2">
                          <strong>参考メッセージ例:</strong>
                          <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                            {selectedPromotion.messageExample}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    💡 企画を選択するとAIがその内容に基づいてメッセージを生成します。選択しない場合は一般的なプロモーションメッセージを生成します。
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleAITest}
                disabled={isGenerating}
                className={`${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-3 rounded-lg font-medium flex items-center`}
              >
                <span className="mr-2">🧪</span>
                {isGenerating ? 'AI生成中...' : 'AIテスト実行 (GPT-5-mini)'}
              </button>
              <Link
                href="/dashboard/messages/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center"
              >
                <span className="mr-2">🤖</span>
                専用AIアシスタントを作成してメッセージ作成へ
              </Link>
              <button className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700">
                テンプレートを保存
              </button>
            </div>

            {/* AI生成メッセージ表示エリア */}
            {aiMessages.length > 0 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🤖 AI生成メッセージ (GPT-5-mini)
                </h3>
                <div className="space-y-4">
                  {aiMessages.map((message, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          パターン {index + 1}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(message)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          📋 コピー
                        </button>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  ※ これらは{businessDetails.storeName || 'お店'}の情報を基にAIが自動生成したサンプルメッセージです。
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
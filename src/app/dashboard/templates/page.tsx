'use client'

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import Link from 'next/link'
import { getBusinessTemplate } from '@/lib/templates/businessTemplates'
import { getPromotionTemplates, getSeasonalPromotions, type PromotionTemplate, type BusinessPromotions } from '@/lib/templates/promotionTemplates'
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories'
import type { BusinessTemplate } from '@/types/business'
import { usePerformanceMonitor } from '@/lib/performance/monitor'
import { useApiCache } from '@/hooks/useApiCache'

// Lazy load heavy components
const TemplateHeader = lazy(() => import('@/components/templates/TemplateHeader'))
const CategorySelector = lazy(() => import('@/components/templates/CategorySelector'))
const SubCategorySelector = lazy(() => import('@/components/templates/SubCategorySelector'))
const BusinessTypeSelector = lazy(() => import('@/components/templates/BusinessTypeSelector'))
const PromotionSelector = lazy(() => import('@/components/templates/PromotionSelector'))

export default function TemplatesPage() {
  const { measureUserInteraction, measureApiCall } = usePerformanceMonitor()
  const { fetchWithCache } = useApiCache<string[]>()

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

  const resetSelection = useCallback(() => {
    measureUserInteraction('template-reset-selection')
    setSelectedCategory('')
    setSelectedSubCategory('')
    setSelectedBusinessType('')
    setShowCustomization(false)
    setAvailablePromotions(null)
    setSelectedPromotion(null)
    setShowPromotionSelector(false)
  }, [measureUserInteraction])

  const handleCategorySelect = useCallback((category: string) => {
    measureUserInteraction('template-category-select', { category })
    setSelectedCategory(category)
    setSelectedSubCategory('')
    setSelectedBusinessType('')
    setShowCustomization(false)
  }, [measureUserInteraction])

  const handleSubCategorySelect = useCallback((subCategory: string) => {
    measureUserInteraction('template-subcategory-select', { subCategory })
    setSelectedSubCategory(subCategory)
    setSelectedBusinessType('')
    setShowCustomization(false)
  }, [measureUserInteraction])

  const handleCategoryReset = useCallback(() => {
    setSelectedSubCategory('')
    setSelectedBusinessType('')
    setShowCustomization(false)
  }, [])

  const handleSubCategoryReset = useCallback(() => {
    setSelectedBusinessType('')
    setShowCustomization(false)
  }, [])

  const handleBusinessTypeSelect = useCallback((businessType: string) => {
    measureUserInteraction('template-businesstype-select', {
      category: selectedCategory,
      subCategory: selectedSubCategory,
      businessType
    })

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
  }, [selectedCategory, selectedSubCategory, measureUserInteraction])

  // AI応答テスト関数（キャッシュ対応）
  const handleAITest = useCallback(async () => {
    setIsGenerating(true)
    setAiMessages([])

    const cacheKey = `ai-messages-${JSON.stringify({ businessDetails, selectedPromotion })}`

    try {
      const messages = await measureApiCall(
        'generate-ai-messages',
        () => fetchWithCache(
          cacheKey,
          async () => {
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

            if (!response.ok) {
              throw new Error('メッセージの生成に失敗しました。')
            }

            const data = await response.json()
            return data.messages || []
          }
        ),
        { category: selectedCategory, subCategory: selectedSubCategory }
      )

      setAiMessages(messages)
    } catch (error) {
      console.error('AI Test Error:', error)
      setAiMessages(['エラー: ' + (error instanceof Error ? error.message : 'ネットワークエラーが発生しました。')])
    } finally {
      setIsGenerating(false)
    }
  }, [businessDetails, selectedPromotion, selectedCategory, selectedSubCategory, measureApiCall, fetchWithCache])

  const handleInputChange = useCallback((field: string, value: string | string[]) => {
    setBusinessDetails(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCustomerToggle = useCallback((customer: string) => {
    setBusinessDetails(prev => ({
      ...prev,
      targetCustomers: prev.targetCustomers.includes(customer)
        ? prev.targetCustomers.filter(c => c !== customer)
        : [...prev.targetCustomers, customer]
    }))
  }, [])

  const handlePromotionSelect = useCallback((promotion: PromotionTemplate) => {
    setSelectedPromotion(promotion)
  }, [])

  // Memoized business categories for performance
  const businessCategories = useMemo(() => BUSINESS_CATEGORIES, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b animate-pulse"></div>}>
        <TemplateHeader
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          selectedBusinessType={selectedBusinessType}
          onResetSelection={resetSelection}
          onCategoryReset={handleCategoryReset}
          onSubCategoryReset={handleSubCategoryReset}
        />
      </Suspense>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{Array.from({length: 4}).map((_, i) => <div key={i} className="p-6 bg-gray-200 rounded-lg animate-pulse h-24"></div>)}</div>}>
            <CategorySelector onCategorySelect={handleCategorySelect} />
          </Suspense>
        )}

        {/* サブカテゴリ選択 */}
        {selectedCategory && !selectedSubCategory && (
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length: 3}).map((_, i) => <div key={i} className="p-6 bg-gray-200 rounded-lg animate-pulse h-20"></div>)}</div>}>
            <SubCategorySelector
              selectedCategory={selectedCategory}
              onSubCategorySelect={handleSubCategorySelect}
            />
          </Suspense>
        )}

        {/* ビジネスタイプ選択 */}
        {selectedSubCategory && !selectedBusinessType && (
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length: 6}).map((_, i) => <div key={i} className="p-4 bg-gray-200 rounded-lg animate-pulse h-16"></div>)}</div>}>
            <BusinessTypeSelector
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onBusinessTypeSelect={handleBusinessTypeSelect}
            />
          </Suspense>
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
              <Suspense fallback={<div className="mt-6 p-6 bg-blue-50 rounded-lg animate-pulse h-64"></div>}>
                <PromotionSelector
                  availablePromotions={availablePromotions}
                  selectedPromotion={selectedPromotion}
                  onPromotionSelect={handlePromotionSelect}
                />
              </Suspense>
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
                <span className="mr-2">🎉</span>
                {isGenerating ? 'AI生成中...' : 'プロモーションAI生成 (GPT-5-mini)'}
              </button>
              <Link
                href={`/dashboard/simplified-templates?preset=${encodeURIComponent(JSON.stringify(businessDetails))}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center"
              >
                <span className="mr-2">🤖</span>
                専用AIアシスタントでメッセージ作成
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
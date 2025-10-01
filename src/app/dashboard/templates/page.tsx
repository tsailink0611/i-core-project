'use client'

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import Link from 'next/link'
import { getBusinessTemplate } from '@/lib/templates/businessTemplates'
import { getPromotionTemplates, getSeasonalPromotions, type PromotionTemplate, type BusinessPromotions } from '@/lib/templates/promotionTemplates'
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories'
import type { BusinessTemplate } from '@/types/business'
import { usePerformanceMonitor } from '@/lib/performance/monitor'
import { useApiCache } from '@/hooks/useApiCache'

// Enhanced message structure for integrated format
interface EnhancedMessage {
  title: string
  message: string
  timing: string
  frequency: string
  reason: string
  seasonal: string
  effect: string
  isEnhanced: boolean
}

// Utility function to parse enhanced AI responses
function parseEnhancedResponse(response: string): EnhancedMessage | null {
  // Check if response contains enhanced format markers
  if (!response.includes('【企画名】') || !response.includes('■ メッセージ内容:')) {
    return null
  }

  try {
    const titleMatch = response.match(/【企画名】:?\s*(.+?)(?:\n|$)/)
    const messageMatch = response.match(/■ メッセージ内容:?\s*[「『](.+?)[」』]/)
    const timingMatch = response.match(/■ 配信タイミング:?\s*(.+?)(?:\n|■|$)/)
    const frequencyMatch = response.match(/■ 配信頻度:?\s*(.+?)(?:\n|■|$)/)
    const reasonMatch = response.match(/■ 配信理由:?\s*(.+?)(?:\n|■|$)/)
    const seasonalMatch = response.match(/■ 季節考慮:?\s*(.+?)(?:\n|■|$)/)
    const effectMatch = response.match(/■ 期待効果:?\s*(.+?)(?:\n|■|$)/)

    if (titleMatch && messageMatch) {
      return {
        title: titleMatch[1].trim(),
        message: messageMatch[1].trim(),
        timing: timingMatch?.[1]?.trim() || '',
        frequency: frequencyMatch?.[1]?.trim() || '',
        reason: reasonMatch?.[1]?.trim() || '',
        seasonal: seasonalMatch?.[1]?.trim() || '',
        effect: effectMatch?.[1]?.trim() || '',
        isEnhanced: true
      }
    }
  } catch (error) {
    console.error('Error parsing enhanced response:', error)
  }

  return null
}

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
    category: '',
    subCategory: '',
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
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState('')
  const [scheduleSettings, setScheduleSettings] = useState({
    sendDate: '',
    sendTime: '',
    frequency: 'once',
    title: '',
    campaignType: ''
  })
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
    console.log('Template Search:', { selectedCategory, selectedSubCategory, businessType })
    const template = getBusinessTemplate(selectedCategory, selectedSubCategory, businessType)
    console.log('Found template:', template)
    if (template) {
      const newBusinessDetails = {
        ...template,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        businessType: businessType
      }
      console.log('Setting business details:', newBusinessDetails)
      setBusinessDetails(newBusinessDetails)
    } else {
      console.error('Template not found for:', { selectedCategory, selectedSubCategory, businessType })
    }

    // プロモーションテンプレートを読み込み
    const promotions = getPromotionTemplates(selectedCategory, selectedSubCategory, businessType)
    setAvailablePromotions(promotions)
    setSelectedPromotion(null)
    setShowPromotionSelector(true)
  }, [selectedCategory, selectedSubCategory, measureUserInteraction])
  // テンプレート自動読み込み useEffect
  useEffect(() => {
    if (selectedCategory && selectedSubCategory && selectedBusinessType) {
      console.log("🔄 useEffect: Loading template...", { selectedCategory, selectedSubCategory, selectedBusinessType })
      const template = getBusinessTemplate(selectedCategory, selectedSubCategory, selectedBusinessType)
      console.log("📦 useEffect: Template result:", template)

      if (template) {
        const newBusinessDetails = {
          storeName: template.storeName || "",
          category: selectedCategory,
          subCategory: selectedSubCategory,
          businessType: selectedBusinessType,
          priceRange: template.priceRange || "",
          atmosphere: template.atmosphere || "",
          targetCustomers: template.targetCustomers || [],
          businessHours: template.businessHours || "",
          features: template.features || "",
          goals: template.goals || "",
          messageStyle: template.messageStyle || "",
          sampleMessages: template.sampleMessages,
          aiPrompt: template.aiPrompt
        }
        console.log("✅ useEffect: Setting businessDetails:", newBusinessDetails)
        setBusinessDetails(newBusinessDetails)
      } else {
        console.error("❌ useEffect: Template not found")
      }
    }
  }, [selectedCategory, selectedSubCategory, selectedBusinessType])


  // 統合型プロモーション企画+スケジュール生成関数
  const handlePromotionGeneration = useCallback(async () => {
    setIsGenerating(true)
    setAiMessages([])

    try {
      // 業種別の最適化されたプロンプト作成
      const businessType = `${selectedCategory}の${selectedSubCategory}`
      const storeName = businessDetails.storeName || '店舗'
      const features = businessDetails.features || ''
      const targetCustomers = businessDetails.targetCustomers.join('、') || '一般のお客様'

      console.log('AI Generation Debug:', {
        selectedCategory,
        selectedSubCategory,
        selectedBusinessType,
        businessType,
        storeName,
        features,
        targetCustomers,
        businessDetails
      })

      const detailedPrompt = `あなたは${businessType}のマーケティング専門家です。

【店舗情報】
- 店舗名: ${storeName}
- 業種: ${businessType}
- 特徴: ${features}
- ターゲット層: ${targetCustomers}
- 営業時間: ${businessDetails.businessHours || '営業時間未設定'}
- 価格帯: ${businessDetails.priceRange || '価格帯未設定'}
- 雰囲気: ${businessDetails.atmosphere || '雰囲気未設定'}
- メッセージスタイル: ${businessDetails.messageStyle || '親しみやすい'}

以下の形式で、メッセージ+スケジュール統合企画を5つ提案してください：

1. 【企画名】: 具体的で魅力的な企画名
   ■ メッセージ内容: 「実際に送信するLINEメッセージ（100-150文字、絵文字1-2個）」
   ■ 配信タイミング: 具体的な曜日・時間（例：毎週火曜15:00）
   ■ 配信頻度: 週1回/月1回/季節限定など
   ■ 配信理由: なぜこの時間が最適か
   ■ 季節考慮: 時期特性・イベント連動
   ■ 期待効果: 狙う成果

2. 【企画名】: ...

各企画は以下の観点で考えてください：
- ${businessType}の営業リズム（${businessDetails.businessHours}）に最適化
- ターゲット層（${targetCustomers}）のライフスタイル考慮
- ${businessDetails.messageStyle || '親しみやすい'}なトーンでの自然な表現
- 実施しやすい現実的なタイミング設定
- 季節性や特別な時期を活用した提案
- 価格帯（${businessDetails.priceRange}）に応じた企画内容`

      const response = await fetch('/api/generate-persona-promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaPrompt: detailedPrompt,
          businessTemplate: {
            category: selectedCategory,
            subCategory: selectedSubCategory,
            businessType: selectedBusinessType,
            storeName: storeName,
            features: features,
            atmosphere: businessDetails.atmosphere || '',
            priceRange: businessDetails.priceRange || '',
            targetCustomers: businessDetails.targetCustomers || []
          }
        })
      })

      if (!response.ok) {
        throw new Error('プロモーション企画の生成に失敗しました。')
      }

      const data = await response.json()
      if (data.suggestions && data.suggestions.length > 0) {
        setAiMessages(data.suggestions)
      } else {
        setAiMessages(['プロモーション企画の生成に失敗しました。'])
      }
    } catch (error) {
      console.error('プロモーション生成エラー:', error)
      setAiMessages(['エラーが発生しました。業種と店舗情報を確認してください。'])
    } finally {
      setIsGenerating(false)
    }
  }, [businessDetails, selectedCategory, selectedSubCategory, selectedBusinessType])

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

  // Enhanced message parsing with auto-extraction of schedule details
  const extractScheduleFromMessage = useCallback((message: string, enhancedData: any) => {
    let scheduleInfo = {
      title: '',
      frequency: 'once' as string,
      dayOfWeek: '',
      timeOfDay: '',
      sendDate: '',
      sendTime: '',
      campaignType: ''
    }

    const fullText = message + (enhancedData ? ` ${enhancedData.timing} ${enhancedData.frequency} ${enhancedData.message}` : '')

    if (enhancedData) {
      // Extract title
      scheduleInfo.title = enhancedData.title

      // Extract campaign type from message content
      const campaignPatterns = [
        { pattern: /誕生日特典|誕生日|バースデー/i, type: '誕生日特典' },
        { pattern: /記念日|アニバーサリー/i, type: '記念日' },
        { pattern: /新メニュー|新商品|新サービス/i, type: '新商品・新サービス' },
        { pattern: /限定|期間限定/i, type: '期間限定' },
        { pattern: /クーポン|割引|OFF/i, type: 'クーポン・割引' },
        { pattern: /ポイント/i, type: 'ポイント特典' },
        { pattern: /キャンペーン|フェア/i, type: 'キャンペーン' },
        { pattern: /イベント/i, type: 'イベント告知' }
      ]

      for (const { pattern, type } of campaignPatterns) {
        if (pattern.test(fullText)) {
          scheduleInfo.campaignType = type
          break
        }
      }

      // Extract frequency with more patterns
      if (enhancedData.frequency.includes('週') || /週一|毎週|週ごと/i.test(fullText)) {
        scheduleInfo.frequency = 'weekly'
      } else if (enhancedData.frequency.includes('月') || /月一|毎月|月ごと/i.test(fullText)) {
        scheduleInfo.frequency = 'monthly'
      } else if (enhancedData.frequency.includes('日') || /毎日|日々/i.test(fullText)) {
        scheduleInfo.frequency = 'daily'
      }

      // Extract specific dates (e.g., "15日", "何日")
      const dateMatch = fullText.match(/(\d{1,2})日/)
      if (dateMatch) {
        const day = parseInt(dateMatch[1], 10)
        const today = new Date()
        const targetDate = new Date(today.getFullYear(), today.getMonth(), day)

        // If date is in the past, move to next month
        if (targetDate < today) {
          targetDate.setMonth(targetDate.getMonth() + 1)
        }

        scheduleInfo.sendDate = targetDate.toISOString().split('T')[0]
      }

      // Extract day of week from timing
      const dayPatterns = {
        '月曜': 'monday',
        '火曜': 'tuesday',
        '水曜': 'wednesday',
        '木曜': 'thursday',
        '金曜': 'friday',
        '土曜': 'saturday',
        '日曜': 'sunday'
      }

      for (const [jpDay, enDay] of Object.entries(dayPatterns)) {
        if (enhancedData.timing.includes(jpDay)) {
          scheduleInfo.dayOfWeek = enDay
          break
        }
      }

      // Extract time of day
      const timePatterns = {
        '朝': '09:00',
        '午前': '10:00',
        '昼': '12:00',
        '午後': '15:00',
        '夕方': '17:00',
        '夜': '19:00',
        '深夜': '22:00'
      }

      for (const [jpTime, defaultTime] of Object.entries(timePatterns)) {
        if (enhancedData.timing.includes(jpTime)) {
          scheduleInfo.timeOfDay = jpTime
          scheduleInfo.sendTime = defaultTime
          break
        }
      }

      // Set default send date if not specified
      if (!scheduleInfo.sendDate) {
        const today = new Date()
        scheduleInfo.sendDate = today.toISOString().split('T')[0]
      }
    }

    return scheduleInfo
  }, [])

  const handleMessageSelect = useCallback((message: string) => {
    const enhancedData = parseEnhancedResponse(message)

    setSelectedMessage(enhancedData ? enhancedData.message : message)
    setShowMessageForm(true)

    // Auto-extract schedule information
    if (enhancedData) {
      const extracted = extractScheduleFromMessage(message, enhancedData)
      setScheduleSettings(prev => ({
        ...prev,
        title: extracted.title,
        frequency: extracted.frequency,
        sendDate: extracted.sendDate,
        sendTime: extracted.sendTime,
        campaignType: extracted.campaignType
      }))
    } else {
      setScheduleSettings(prev => ({
        ...prev,
        title: `${businessDetails.storeName || 'お店'}からのお知らせ`
      }))
    }
  }, [businessDetails.storeName, extractScheduleFromMessage])

  const handleScheduleChange = useCallback((field: string, value: string) => {
    setScheduleSettings(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSaveMessage = useCallback(async () => {
    try {
      // ここで実際のメッセージ保存処理を実装
      console.log('Saving message:', {
        message: selectedMessage,
        schedule: scheduleSettings,
        businessTemplate: businessDetails
      })

      // 成功時の処理
      setShowMessageForm(false)
      setSelectedMessage('')
      alert('メッセージが保存されました！')
    } catch (error) {
      console.error('Message save error:', error)
      alert('メッセージの保存に失敗しました。')
    }
  }, [selectedMessage, scheduleSettings, businessDetails])

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
            {selectedCategory && selectedSubCategory && selectedBusinessType && (
              <div className="mt-8 flex space-x-4">
                <button
                  onClick={handlePromotionGeneration}
                  disabled={isGenerating}
                  className={`${
                    isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-6 py-3 rounded-lg font-medium flex items-center`}
                >
                  <span className="mr-2">🎉</span>
                  {isGenerating ? 'AI生成中...' : 'プロモーション企画+スケジュール生成 (GPT-5-mini)'}
                </button>
              </div>
            )}

            {/* AI生成メッセージ表示エリア - Enhanced */}
            {aiMessages.length > 0 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🤖 AI生成メッセージ (GPT-5-mini)
                </h3>
                <div className="space-y-6">
                  {aiMessages.map((message, index) => {
                    const enhancedData = parseEnhancedResponse(message)

                    return (
                      <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {enhancedData ? (
                          // Enhanced format display
                          <div className="p-6">
                            {/* Header with title and actions */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                  🎉 {enhancedData.title}
                                </h4>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  パターン {index + 1}
                                </span>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => navigator.clipboard.writeText(enhancedData.message)}
                                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  📋 コピー
                                </button>
                                <button
                                  onClick={() => handleMessageSelect(enhancedData.message)}
                                  className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                                >
                                  📝 使用する
                                </button>
                              </div>
                            </div>

                            {/* Message content */}
                            <div className="mb-6">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">💬 メッセージ内容</h5>
                              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                                <p className="text-gray-800 leading-relaxed">{enhancedData.message}</p>
                              </div>
                            </div>

                            {/* Schedule information grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {enhancedData.timing && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                  <h6 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                                    ⏰ 配信タイミング
                                  </h6>
                                  <p className="text-sm text-blue-700">{enhancedData.timing}</p>
                                </div>
                              )}

                              {enhancedData.frequency && (
                                <div className="p-4 bg-purple-50 rounded-lg">
                                  <h6 className="text-sm font-medium text-purple-800 mb-1 flex items-center">
                                    🔄 配信頻度
                                  </h6>
                                  <p className="text-sm text-purple-700">{enhancedData.frequency}</p>
                                </div>
                              )}

                              {enhancedData.effect && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                  <h6 className="text-sm font-medium text-green-800 mb-1 flex items-center">
                                    🎯 期待効果
                                  </h6>
                                  <p className="text-sm text-green-700">{enhancedData.effect}</p>
                                </div>
                              )}
                            </div>

                            {/* Additional information */}
                            {(enhancedData.reason || enhancedData.seasonal) && (
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enhancedData.reason && (
                                  <div className="p-4 bg-yellow-50 rounded-lg">
                                    <h6 className="text-sm font-medium text-yellow-800 mb-1 flex items-center">
                                      💡 配信理由
                                    </h6>
                                    <p className="text-sm text-yellow-700">{enhancedData.reason}</p>
                                  </div>
                                )}

                                {enhancedData.seasonal && (
                                  <div className="p-4 bg-orange-50 rounded-lg">
                                    <h6 className="text-sm font-medium text-orange-800 mb-1 flex items-center">
                                      🌸 季節考慮
                                    </h6>
                                    <p className="text-sm text-orange-700">{enhancedData.seasonal}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Fallback: Simple format display for backward compatibility
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-600">
                                パターン {index + 1}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigator.clipboard.writeText(message)}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  📋 コピー
                                </button>
                                <button
                                  onClick={() => handleMessageSelect(message)}
                                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                  📝 使用する
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  ※ これらは{businessDetails.storeName || 'お店'}の情報を基にAIが自動生成したサンプルメッセージです。
                </div>
              </div>
            )}

            {/* メッセージ設定フォーム */}
            {showMessageForm && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-blue-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    📝 メッセージとスケジュール設定
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      設定中
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowMessageForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 選択されたメッセージ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💬 選択されたメッセージ
                    </label>
                    <div className="relative">
                      <textarea
                        value={selectedMessage}
                        onChange={(e) => setSelectedMessage(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="メッセージ内容を編集できます"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {selectedMessage.length}/150文字
                      </div>
                    </div>
                  </div>

                  {/* スケジュール設定 */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      📅 スケジュール設定
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🎯 メッセージタイトル
                        </label>
                        <input
                          type="text"
                          value={scheduleSettings.title}
                          onChange={(e) => handleScheduleChange('title', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="メッセージのタイトル"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🏷️ キャンペーンタイプ
                        </label>
                        <select
                          value={scheduleSettings.campaignType}
                          onChange={(e) => handleScheduleChange('campaignType', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">選択してください</option>
                          <option value="誕生日特典">誕生日特典</option>
                          <option value="記念日">記念日</option>
                          <option value="新商品・新サービス">新商品・新サービス</option>
                          <option value="期間限定">期間限定</option>
                          <option value="クーポン・割引">クーポン・割引</option>
                          <option value="ポイント特典">ポイント特典</option>
                          <option value="キャンペーン">キャンペーン</option>
                          <option value="イベント告知">イベント告知</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🔄 配信頻度
                        </label>
                        <select
                          value={scheduleSettings.frequency}
                          onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="once">一回のみ</option>
                          <option value="daily">毎日</option>
                          <option value="weekly">毎週</option>
                          <option value="monthly">毎月</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📅 配信日
                        </label>
                        <input
                          type="date"
                          value={scheduleSettings.sendDate}
                          onChange={(e) => handleScheduleChange('sendDate', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ⏰ 配信時間
                        </label>
                        <input
                          type="time"
                          value={scheduleSettings.sendTime}
                          onChange={(e) => handleScheduleChange('sendTime', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowMessageForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSaveMessage}
                      disabled={!selectedMessage || !scheduleSettings.sendDate || !scheduleSettings.sendTime}
                      className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                        !selectedMessage || !scheduleSettings.sendDate || !scheduleSettings.sendTime
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                      }`}
                    >
                      💾 メッセージを保存
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
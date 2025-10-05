'use client'

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import Link from 'next/link'
import { getBusinessTemplate } from '@/lib/templates/businessTemplates'
import { getPromotionTemplates, getSeasonalPromotions, type PromotionTemplate, type BusinessPromotions } from '@/lib/templates/promotionTemplates'
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories'
import type { BusinessTemplate } from '@/types/business'
import { usePerformanceMonitor } from '@/lib/performance/monitor'
import { useApiCache } from '@/hooks/useApiCache'
import { saveMessage } from '@/lib/messageStorage'

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
  const [showMessageForm, setShowMessageForm] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState('')
  const [scheduleSettings, setScheduleSettings] = useState({
    sendDate: '',
    sendTime: '',
    frequency: 'once',
    title: '',
    campaignType: '',
    dayOfWeek: '',
    dayOfMonth: '',
    targetCondition: ''
  })
  const [availablePromotions, setAvailablePromotions] = useState<BusinessPromotions | null>(null)
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionTemplate | null>(null)
  const [promotionType, setPromotionType] = useState<string>('')
  const [seasonalContext, setSeasonalContext] = useState<string>('')
  const [showPromotionSelector, setShowPromotionSelector] = useState(false)

  // Load edit message data from localStorage when page loads
  useEffect(() => {
    const editMessageData = localStorage.getItem('l-core-edit-message')
    if (editMessageData) {
      try {
        const data = JSON.parse(editMessageData)

        // Set selected message and show form
        setSelectedMessage(data.content || '')
        setShowMessageForm(true)

        // Set schedule settings
        if (data.scheduleSettings) {
          setScheduleSettings(prev => ({
            ...prev,
            sendDate: data.scheduleSettings.sendDate || '',
            sendTime: data.scheduleSettings.sendTime || '',
            targetCondition: data.scheduleSettings.targetAudience || ''
          }))
        }

        // Set business details if available
        if (data.businessTemplate) {
          const businessType = data.businessTemplate.businessType || ''
          const parts = businessType.split(' > ')

          if (parts.length >= 3) {
            setSelectedCategory(parts[0])
            setSelectedSubCategory(parts[1])
            setSelectedBusinessType(parts[2])
            setShowCustomization(true)
          }
        }

        // Set schedule title
        if (data.title) {
          setScheduleSettings(prev => ({
            ...prev,
            title: data.title
          }))
        }

        // Clear the localStorage item after loading
        localStorage.removeItem('l-core-edit-message')
      } catch (error) {
        console.error('Failed to load edit message data:', error)
      }
    }
  }, [])

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

      // プロモーション種別に応じた詳細コンテキスト
      const promotionTypeContext = {
        birthday: '誕生日特典。顧客の誕生日当日または前後に送る特別なオファー。パーソナライズされた温かみのあるメッセージと、誕生日限定の特典を含める。',
        discount: '割引・クーポンキャンペーン。期間限定の特別価格や割引率を明示。緊急性を持たせつつ、お得感を強調する。',
        weather: `天気連動プロモーション。${seasonalContext === 'sunny' ? '晴れの日' : seasonalContext === 'rainy' ? '雨の日' : seasonalContext === 'cloudy' ? '曇りの日' : '雪の日'}に最適な商品やサービスを提案。天気ならではの価値提案を含める。`,
        season: `季節限定プロモーション。${seasonalContext === 'spring' ? '春（3-5月）' : seasonalContext === 'summer' ? '夏（6-8月）' : seasonalContext === 'autumn' ? '秋（9-11月）' : '冬（12-2月）'}の季節感を活かした企画。旬の商品、季節イベント、気候に応じた提案を含める。`,
        new_product: '新商品・新サービスの案内。新しさと価値を強調し、初回限定特典や先行体験の機会を提供。',
        event: 'イベント告知。具体的な日時、場所、参加方法を明記。イベントならではの特別感と限定性を訴求。',
        anniversary: '登録記念日プロモーション。「登録から○ヶ月/○年経過」を祝い、感謝の気持ちと特別なオファーを伝える。',
        auto: '季節・トレンドを自動判定したプロモーション。現在の時期（10月）を考慮し、秋の行楽シーズン、ハロウィン、年末に向けた企画を提案。'
      }

      const selectedContext = promotionTypeContext[promotionType as keyof typeof promotionTypeContext] || promotionTypeContext.auto

      console.log('AI Generation Debug:', {
        selectedCategory,
        selectedSubCategory,
        selectedBusinessType,
        businessType,
        storeName,
        features,
        targetCustomers,
        promotionType,
        seasonalContext,
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

【プロモーション種別】
${selectedContext}

以下の形式で、具体的で実行可能なメッセージ+スケジュール統合企画を5つ提案してください。
各企画は実際にLINEで送信できる完成度の高いメッセージ、明確な配信スケジュール、期待される効果を含めてください。

1. 【企画名】: 具体的で魅力的な企画名（プロモーション種別を反映）
   ■ メッセージ内容: 「実際に送信するLINEメッセージ（120-150文字、適切な絵文字2-3個、具体的なオファー内容、行動喚起を含む）」
   ■ 配信タイミング: 具体的な曜日・時間（例：毎週火曜15:00、誕生日当日10:00）
   ■ 配信頻度: 週1回/月1回/季節限定/イベント連動など
   ■ 配信理由: なぜこの時間・タイミングが最適か（顧客行動、業種特性を考慮）
   ■ 季節考慮: 時期特性・イベント連動・天気連動（該当する場合）
   ■ 期待効果: 具体的な成果（例：来店率20%向上、リピート率向上、新規獲得など）

2. 【企画名】: ...

各企画は以下の観点で深く考えてください：
- プロモーション種別「${selectedContext}」に完全に沿った内容
- ${businessType}の営業リズム（${businessDetails.businessHours}）に最適化
- ターゲット層（${targetCustomers}）のライフスタイル・行動パターンを深く理解
- ${businessDetails.messageStyle || '親しみやすい'}なトーンで自然かつ魅力的な表現
- 実施しやすく効果測定可能なタイミング設定
- 季節性・天気・特別な時期を最大限活用
- 価格帯（${businessDetails.priceRange}）に見合った価値提案
- 競合との差別化と独自性
- 顧客にとっての明確なベネフィット`

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
            targetCustomers: businessDetails.targetCustomers || [],
            businessHours: businessDetails.businessHours || '',
            goals: businessDetails.goals || '',
            messageStyle: businessDetails.messageStyle || '',
            promotionType: promotionType,
            seasonalContext: seasonalContext,
            scheduleFrequency: scheduleSettings.frequency,
            scheduleDayOfWeek: scheduleSettings.dayOfWeek,
            scheduleDayOfMonth: scheduleSettings.dayOfMonth,
            scheduleSendDate: scheduleSettings.sendDate,
            scheduleSendTime: scheduleSettings.sendTime,
            aiPrompt: detailedPrompt  // 詳細プロンプトをaiPromptとして渡す
          }
        })
      })

      if (!response.ok) {
        throw new Error('プロモーション企画の生成に失敗しました。')
      }

      const data = await response.json()
      if (data.suggestions && data.suggestions.length > 0) {
        // 最初の提案を自動的にメッセージフォームに反映
        const firstSuggestion = data.suggestions[0]
        const enhancedData = parseEnhancedResponse(firstSuggestion)

        if (enhancedData) {
          // Enhanced形式の場合、詳細情報を抽出
          setSelectedMessage(enhancedData.message)
          setScheduleSettings(prev => ({
            ...prev,
            title: enhancedData.title || `${businessDetails.storeName || 'お店'}からのお知らせ`
          }))
        } else {
          // シンプル形式の場合
          setSelectedMessage(firstSuggestion)
        }

        // メッセージフォームを自動表示
        setShowMessageForm(true)

        // 残りの提案もaiMessagesに保存（後で選択できるように）
        setAiMessages(data.suggestions)
      } else {
        alert('プロモーション企画の生成に失敗しました。')
      }
    } catch (error) {
      console.error('プロモーション生成エラー:', error)
      alert('エラーが発生しました。業種と店舗情報を確認してください。')
    } finally {
      setIsGenerating(false)
    }
  }, [businessDetails, selectedCategory, selectedSubCategory, selectedBusinessType, promotionType, seasonalContext])

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
      if (!selectedMessage || !scheduleSettings.sendDate || !scheduleSettings.sendTime) {
        alert('メッセージ、配信日、配信時間は必須項目です。')
        return
      }

      // localStorageに保存
      const savedMessage = saveMessage({
        title: scheduleSettings.title || `${businessDetails.storeName || 'お店'}からのお知らせ`,
        content: selectedMessage,
        scheduleSettings: {
          sendDate: scheduleSettings.sendDate,
          sendTime: scheduleSettings.sendTime,
          targetAudience: scheduleSettings.targetCondition || '全会員'
        },
        businessTemplate: {
          businessType: `${selectedCategory} > ${selectedSubCategory} > ${selectedBusinessType}`,
          targetCustomer: businessDetails.targetCustomers.join('、') || '一般のお客様',
          objectives: [businessDetails.goals || '顧客満足度向上']
        },
        type: 'text'
      })

      console.log('Message saved successfully:', savedMessage)

      // 成功時の処理
      setShowMessageForm(false)
      setSelectedMessage('')
      setScheduleSettings({
        sendDate: '',
        sendTime: '',
        frequency: 'once',
        title: '',
        campaignType: '',
        dayOfWeek: '',
        dayOfMonth: '',
        targetCondition: ''
      })
      alert(`メッセージが保存されました！\n配信予定: ${scheduleSettings.sendDate} ${scheduleSettings.sendTime}`)
    } catch (error) {
      console.error('Message save error:', error)
      alert('メッセージの保存に失敗しました。')
    }
  }, [selectedMessage, scheduleSettings, businessDetails, selectedCategory, selectedSubCategory, selectedBusinessType])

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

            {/* プロモーション種別選択 - カスタマイズフォーム内に配置 */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  🎯 プロモーション種別を選択
                  <span className="ml-2 text-sm font-normal text-gray-600">(AI生成の質が向上します)</span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { id: 'birthday', icon: '🎂', label: '誕生日特典', desc: '顧客の誕生日に送る特別オファー' },
                    { id: 'discount', icon: '💰', label: '割引・クーポン', desc: '期間限定の割引キャンペーン' },
                    { id: 'weather', icon: '🌤️', label: '天気連動', desc: '天気に応じたプロモーション' },
                    { id: 'season', icon: '🍂', label: '季節のおすすめ', desc: '春夏秋冬の季節限定' },
                    { id: 'new_product', icon: '✨', label: '新商品・新サービス', desc: '新しい商品やサービスの案内' },
                    { id: 'event', icon: '🎉', label: 'イベント告知', desc: 'イベントやキャンペーンの告知' },
                    { id: 'anniversary', icon: '⏰', label: '登録記念日', desc: '登録から○ヶ月/○年記念' },
                    { id: 'auto', icon: '🎯', label: 'お任せ', desc: '季節・トレンドを自動判定' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPromotionType(type.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        promotionType === type.id
                          ? 'border-purple-500 bg-purple-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                    </button>
                  ))}
                </div>

                {/* 季節選択（季節のおすすめ選択時のみ表示） */}
                {promotionType === 'season' && (
                  <div className="mb-6 p-4 bg-white rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">季節を選択</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'spring', icon: '🌸', label: '春' },
                        { id: 'summer', icon: '☀️', label: '夏' },
                        { id: 'autumn', icon: '🍂', label: '秋' },
                        { id: 'winter', icon: '❄️', label: '冬' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSeasonalContext(s.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            seasonalContext === s.id
                              ? 'border-purple-500 bg-purple-100'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="text-xl">{s.icon}</div>
                          <div className="text-sm font-medium mt-1">{s.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 天気選択（天気連動選択時のみ表示） */}
                {promotionType === 'weather' && (
                  <div className="mb-6 p-4 bg-white rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">天気を選択</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'sunny', icon: '☀️', label: '晴れ' },
                        { id: 'rainy', icon: '🌧️', label: '雨' },
                        { id: 'cloudy', icon: '☁️', label: '曇り' },
                        { id: 'snow', icon: '⛄', label: '雪' }
                      ].map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSeasonalContext(w.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            seasonalContext === w.id
                              ? 'border-purple-500 bg-purple-100'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="text-xl">{w.icon}</div>
                          <div className="text-sm font-medium mt-1">{w.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

            </div>

            {/* スケジュール頻度設定 - プロモーション種別選択後に表示 */}
            {promotionType && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300 shadow-md">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  📅 配信スケジュール設定
                  <span className="ml-2 text-sm font-normal text-gray-600">(頻度と日時を設定)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 配信頻度選択 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      配信頻度
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'once', label: '1回のみ', icon: '📅' },
                        { id: 'weekly', label: '週1回', icon: '📆' },
                        { id: 'biweekly', label: '隔週', icon: '🗓️' },
                        { id: 'monthly', label: '月1回', icon: '📊' }
                      ].map((freq) => (
                        <button
                          key={freq.id}
                          onClick={() => handleScheduleChange('frequency', freq.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            scheduleSettings.frequency === freq.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{freq.icon}</span>
                            <span className="text-sm font-medium">{freq.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 配信日時設定 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      初回配信日時
                    </label>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="date"
                          value={scheduleSettings.sendDate}
                          onChange={(e) => handleScheduleChange('sendDate', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="配信日"
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          value={scheduleSettings.sendTime}
                          onChange={(e) => handleScheduleChange('sendTime', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="配信時間"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 曜日指定（週1回・隔週の場合のみ表示） */}
                  {(scheduleSettings.frequency === 'weekly' || scheduleSettings.frequency === 'biweekly') && (
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        配信曜日
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {[
                          { id: 'monday', label: '月', full: '月曜日' },
                          { id: 'tuesday', label: '火', full: '火曜日' },
                          { id: 'wednesday', label: '水', full: '水曜日' },
                          { id: 'thursday', label: '木', full: '木曜日' },
                          { id: 'friday', label: '金', full: '金曜日' },
                          { id: 'saturday', label: '土', full: '土曜日' },
                          { id: 'sunday', label: '日', full: '日曜日' }
                        ].map((day) => (
                          <button
                            key={day.id}
                            onClick={() => handleScheduleChange('dayOfWeek', day.id)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              scheduleSettings.dayOfWeek === day.id
                                ? 'border-green-500 bg-green-100 font-bold'
                                : 'border-gray-200 bg-white hover:border-green-300'
                            }`}
                            title={day.full}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 日付指定（月1回の場合のみ表示） */}
                  {scheduleSettings.frequency === 'monthly' && (
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        配信日（毎月）
                      </label>
                      <select
                        value={scheduleSettings.dayOfMonth || ''}
                        onChange={(e) => handleScheduleChange('dayOfMonth', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">日付を選択</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>
                            毎月{day}日
                          </option>
                        ))}
                        <option value="last">毎月末日</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            {selectedCategory && selectedSubCategory && selectedBusinessType && promotionType && (
              <div className="mt-8 flex space-x-4">
                <button
                  onClick={handlePromotionGeneration}
                  disabled={isGenerating}
                  className={`${
                    isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-6 py-3 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all`}
                >
                  <span className="mr-2">🎉</span>
                  {isGenerating ? 'AI生成中...' : 'プロモーション企画+スケジュール生成 (GPT-5-mini)'}
                </button>
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

                  {/* プロモーション詳細入力 */}
                  {/* シンプル化：必須項目のみ */}
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      📅 配信設定（必須）
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          配信日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={scheduleSettings.sendDate}
                          onChange={(e) => handleScheduleChange('sendDate', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          配信時間 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={scheduleSettings.sendTime}
                          onChange={(e) => handleScheduleChange('sendTime', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          対象顧客
                        </label>
                        <input
                          type="text"
                          value={scheduleSettings.targetCondition || ''}
                          onChange={(e) => handleScheduleChange('targetCondition', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="例: 全会員"
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
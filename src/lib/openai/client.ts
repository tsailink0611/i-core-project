// OpenAI API クライアント設定
import OpenAI from 'openai'
import { getPromotionTemplates, getSeasonalPromotions, getWeatherPromotions, type PromotionTemplate } from '@/lib/templates/promotionTemplates'
import { resolveModel } from './modelRouter'
import type { BusinessTemplate } from '@/types/business'

// OpenAI シングルトンクライアント
let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    })
  }
  return _client
}

// GPT-3.5-turbo（mini）を使用したメッセージ生成
export async function generateMessage(
  businessTemplate: BusinessTemplate,
  messageType: 'greeting' | 'promotion' | 'announcement' | 'seasonal' = 'promotion',
  promotionContext?: PromotionTemplate
): Promise<string> {
  // プロモーション企画コンテキストを取得
  let promotionInfo = ''
  if (promotionContext) {
    promotionInfo = `
実施予定のプロモーション企画：
- 企画名：${promotionContext.title}
- 内容：${promotionContext.description}
- ターゲット：${Array.isArray(promotionContext.target) ? promotionContext.target.join('、') : (promotionContext.target || '一般のお客様')}
- 期待効果：${promotionContext.expectedEffect}
- 参考例文：${promotionContext.messageExample}
`
  } else if (businessTemplate.category && businessTemplate.subCategory && businessTemplate.businessType) {
    // 季節のプロモーションを自動取得
    const seasonalPromotions = getSeasonalPromotions(
      businessTemplate.category,
      businessTemplate.subCategory,
      businessTemplate.businessType
    )
    if (seasonalPromotions.length > 0) {
      const promo = seasonalPromotions[0]
      promotionInfo = `
現在実施可能な季節企画：
- 企画名：${promo.title}
- 内容：${promo.description}
- ターゲット：${Array.isArray(promo.target) ? promo.target.join('、') : (promo.target || '一般のお客様')}
`
    }
  }

  const systemPrompt = `あなたは${businessTemplate.storeName}のプロモーション・マーケティングアシスタントです。
【店舗情報】
- 業種：${businessTemplate.category || ''} > ${businessTemplate.subCategory || ''} > ${businessTemplate.businessType || ''}
- 店舗名：${businessTemplate.storeName}
- 特徴：${businessTemplate.features}
- 雰囲気：${businessTemplate.atmosphere}
- 価格帯：${businessTemplate.priceRange}
- ターゲット層：${Array.isArray(businessTemplate.targetCustomers) ? businessTemplate.targetCustomers.join('、') : (businessTemplate.targetCustomers || '一般のお客様')}
- 営業時間：${businessTemplate.businessHours}
- 目標：${businessTemplate.goals}
- メッセージトーン：${businessTemplate.messageStyle}
${businessTemplate.aiPrompt || ''}

${promotionInfo}

以下の条件でLINE公式アカウント用メッセージを作成してください：
- 文字数は100-150文字程度
- 絵文字を1-2個使用して親しみやすく
- ${businessTemplate.messageStyle}なトーンで
- 具体的な行動を促すCTAを含める
- 店舗の特徴や強みを活かした内容に
- ターゲット層（${Array.isArray(businessTemplate.targetCustomers) ? businessTemplate.targetCustomers.join('、') : (businessTemplate.targetCustomers || '一般のお客様')}）に響く表現で`

  const userPrompt = {
    greeting: '初めてのお客様向けの挨拶メッセージを作成してください。店舗の魅力と特徴を伝え、親しみやすい第一印象を与えてください。',
    promotion: promotionContext
      ? `「${promotionContext.title}」のプロモーションメッセージを作成してください。企画の魅力を伝え、お客様の来店を促してください。`
      : '今週のおすすめや特別キャンペーンのメッセージを作成してください。店舗の強みを活かしたお得感のある企画を提案してください。',
    announcement: '重要なお知らせ（営業時間変更や新サービスなど）のメッセージを作成してください。',
    seasonal: '現在の季節に合わせた特別企画やメニューのメッセージを作成してください。季節感を演出し、この時期だけの特別感を表現してください。'
  }

  try {
    const openai = getOpenAI()
    const model = await resolveModel(openai)

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt[messageType] }
      ],
      max_completion_tokens: 400, // GPT-4o-mini用の正しいパラメータ
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      console.warn('Model returned empty content, retrying with different prompt...')
      // リトライロジック: より具体的なプロンプトで再試行
      const retryResponse = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: `あなたは${businessTemplate.storeName}のLINE公式アカウント運用担当です。必ず日本語で100-150文字程度のメッセージを作成してください。` },
          { role: 'user', content: `${businessTemplate.storeName}の${messageType === 'promotion' ? 'キャンペーン告知' : messageType === 'greeting' ? '初回挨拶' : messageType === 'seasonal' ? '季節のお知らせ' : 'お知らせ'}メッセージを絵文字1-2個を使って作成してください。必ず具体的な内容を含めてください。` }
        ],
        max_completion_tokens: 400,
        temperature: 0,
      })
      return retryResponse.choices[0]?.message?.content?.trim() || `こんにちは！${businessTemplate.storeName}です🎉 ${businessTemplate.features}でお待ちしています！`
    }
    return content
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error('メッセージの生成に失敗しました。')
  }
}

// 複数パターンのメッセージを一度に生成
export async function generateMultipleMessages(
  businessTemplate: BusinessTemplate,
  count: number = 3,
  selectedPromotion?: PromotionTemplate
): Promise<string[]> {
  const messageTypes: ('greeting' | 'promotion' | 'announcement' | 'seasonal')[] =
    ['promotion', 'seasonal', 'greeting']

  const promises = messageTypes.slice(0, count).map(type =>
    generateMessage(businessTemplate, type, selectedPromotion)
  )

  try {
    const messages = await Promise.all(promises)
    return messages
  } catch (error) {
    console.error('Failed to generate multiple messages:', error)
    return ['メッセージの生成に失敗しました。']
  }
}
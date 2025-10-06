// OpenAI API クライアント設定
import OpenAI from 'openai'
import { getPromotionTemplates, getSeasonalPromotions, getWeatherPromotions, type PromotionTemplate } from '@/lib/templates/promotionTemplates'
import { resolveModel } from './modelRouter'
import type { BusinessTemplate } from '@/types/business'

// OpenAI シングルトンクライアント
let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY

    // Validate API key before creating client
    if (!apiKey || apiKey === '' || typeof apiKey !== 'string' || !apiKey.startsWith('sk-')) {
      console.error('OpenAI API Key validation failed:', {
        hasKey: !!apiKey,
        keyType: typeof apiKey,
        keyLength: apiKey?.length || 0,
        validFormat: apiKey?.startsWith('sk-') || false
      })
      throw new Error('Invalid or missing OPENAI_API_KEY environment variable')
    }

    _client = new OpenAI({
      apiKey: apiKey,
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
  // カスタムAIプロンプトがある場合は、それを優先使用
  const hasCustomPrompt = !!businessTemplate.aiPrompt

  // プロモーション企画コンテキストを取得(カスタムプロンプトがない場合のみ)
  let promotionInfo = ''
  if (!hasCustomPrompt) {
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
  }

  // カスタムプロンプトがある場合は簡潔なシステムプロンプト（店舗情報のみ）、ない場合は詳細な指示
  const systemPrompt = hasCustomPrompt
    ? `あなたは${businessTemplate.storeName}のLINE公式アカウント運用担当のプロフェッショナルマーケターです。

【厳守事項】
- ユーザーが指定した形式を一字一句厳密に守ること
- 「■ メッセージ内容:」は必ず120文字以上200文字以内にすること（絵文字・記号含む）
- メッセージが短すぎる場合は、具体的なオファー内容・期限・特典詳細を追加して120文字以上にすること
- 実際にLINEで送信できる実用的な企画のみ提案すること
- 具体的な数値・タイミング・効果を必ず含めること`
    : `あなたは${businessTemplate.storeName}のプロモーション・マーケティングアシスタントです。
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

${promotionInfo}

以下の条件でLINE公式アカウント用メッセージを作成してください：
- 文字数は100-150文字程度
- 絵文字を1-2個使用して親しみやすく
- ${businessTemplate.messageStyle}なトーンで
- 具体的な行動を促すCTAを含める
- 店舗の特徴や強みを活かした内容に
- ターゲット層（${Array.isArray(businessTemplate.targetCustomers) ? businessTemplate.targetCustomers.join('、') : (businessTemplate.targetCustomers || '一般のお客様')}）に響く表現で`

  // カスタムプロンプトがある場合はそのまま使用、ない場合はデフォルトプロンプト
  const userPrompt = hasCustomPrompt
    ? businessTemplate.aiPrompt
    : {
        greeting: '初めてのお客様向けの挨拶メッセージを作成してください。店舗の魅力と特徴を伝え、親しみやすい第一印象を与えてください。',
        promotion: promotionContext
          ? `「${promotionContext.title}」のプロモーションメッセージを作成してください。企画の魅力を伝え、お客様の来店を促してください。`
          : '今週のおすすめや特別キャンペーンのメッセージを作成してください。店舗の強みを活かしたお得感のある企画を提案してください。',
        announcement: '重要なお知らせ（営業時間変更や新サービスなど）のメッセージを作成してください。',
        seasonal: '現在の季節に合わせた特別企画やメニューのメッセージを作成してください。季節感を演出し、この時期だけの特別感を表現してください。'
      }[messageType]

  console.log('Custom Prompt Check:', { hasCustomPrompt, messageType, promptLength: typeof userPrompt === 'string' ? userPrompt.length : 0 })

  try {
    const openai = getOpenAI()
    const model = await resolveModel(openai)

    // デバッグログ: 送信するプロンプトを確認
    console.log('=== AI API Debug ===')
    console.log('Model:', model)
    console.log('Has Custom Prompt:', hasCustomPrompt)
    console.log('Message Type:', messageType)
    console.log('System Prompt Length:', systemPrompt.length)
    console.log('User Prompt Length:', typeof userPrompt === 'string' ? userPrompt.length : 0)
    console.log('\n--- FULL SYSTEM PROMPT ---')
    console.log(systemPrompt)
    console.log('\n--- FULL USER PROMPT ---')
    console.log(userPrompt)
    console.log('==================\n')

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt || '' }
      ],
      max_completion_tokens: 4000, // GPT-5-miniの推論トークン + 生成トークン用に増量
      temperature: 1,
    })

    console.log('\n=== OpenAI RESPONSE ===')
    console.log('Response Object:', JSON.stringify(response, null, 2))
    console.log('Choices:', response.choices)
    console.log('First Choice:', response.choices[0])
    console.log('Message:', response.choices[0]?.message)
    console.log('Content:', response.choices[0]?.message?.content)
    console.log('======================\n')

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
        max_completion_tokens: 2000,
        temperature: 1,
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

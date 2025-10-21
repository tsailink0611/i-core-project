import { NextRequest, NextResponse } from 'next/server'
import * as line from '@line/bot-sdk'
import OpenAI from 'openai'

const config: line.MiddlewareConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const lineClient = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
})

// デモ用店舗情報（本番ではFirestoreから取得）
const STORE_INFO = {
  name: 'Hair Atelier LUXE',
  type: '美容院・ヘアサロン',
  hours: '10:00-20:00（日曜定休）',
  phone: '03-1234-5678',
  address: '東京都渋谷区〇〇1-2-3',
  features: '完全個室のプライベート空間。一流技術者による丁寧な施術。最高級ヘアケア製品を使用',
  priceRange: '10,000円以上',
  reservationUrl: 'https://example.com/reservation',
}

/**
 * AI自動応答
 */
async function handleAutoReply(userId: string, userMessage: string) {
  try {
    console.log(`🤖 AI処理開始: "${userMessage}"`)

    // OpenAI APIで回答生成
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは「${STORE_INFO.name}」のLINE公式アカウントのAIアシスタントです。

【店舗情報】
- 店舗名: ${STORE_INFO.name}
- 業種: ${STORE_INFO.type}
- 営業時間: ${STORE_INFO.hours}
- 電話: ${STORE_INFO.phone}
- 住所: ${STORE_INFO.address}
- 特徴: ${STORE_INFO.features}
- 価格帯: ${STORE_INFO.priceRange}
- 予約URL: ${STORE_INFO.reservationUrl}

【対応ルール】
1. 親しみやすく丁寧な言葉遣いで回答
2. 質問に対して店舗情報をもとに的確に答える
3. 予約に関する質問には、電話番号とURLを案内
4. 営業時間外の問い合わせには、営業時間を案内
5. 回答は簡潔に（100文字以内推奨）
6. 絵文字を適度に使用して親しみやすく
7. 分からないことは正直に「詳しくはお電話でお問い合わせください」と案内`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const aiResponse = completion.choices[0]?.message?.content || '申し訳ございません。お答えできませんでした。'

    console.log(`✅ AI応答生成完了: "${aiResponse}"`)

    // LINEで返信
    await lineClient.replyMessage({
      replyToken: userId, // 注意: replyTokenが必要
      messages: [
        {
          type: 'text',
          text: aiResponse,
        },
      ],
    })

    console.log('📤 LINE返信完了')
  } catch (error) {
    console.error('❌ AI自動応答エラー:', error)

    // エラー時はデフォルトメッセージ
    try {
      await lineClient.pushMessage({
        to: userId,
        messages: [
          {
            type: 'text',
            text: `申し訳ございません。現在、自動応答システムに問題が発生しております。\n\nお急ぎの場合は、お電話（${STORE_INFO.phone}）でお問い合わせください😊`,
          },
        ],
      })
    } catch (fallbackError) {
      console.error('❌ フォールバック送信も失敗:', fallbackError)
    }
  }
}

/**
 * ウェルカムメッセージ送信
 */
async function sendWelcomeMessage(userId: string) {
  try {
    await lineClient.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: `ご登録ありがとうございます！🎉\n\n${STORE_INFO.name}の公式LINEアカウントです。\n\n営業時間や予約など、お気軽にメッセージでお問い合わせください😊\n\n営業時間: ${STORE_INFO.hours}\n電話: ${STORE_INFO.phone}`,
        },
      ],
    })
    console.log('✅ ウェルカムメッセージ送信完了')
  } catch (error) {
    console.error('❌ ウェルカムメッセージ送信エラー:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify signature (TEMPORARY: Disabled for localtunnel testing)
    // TODO: Re-enable signature validation before production deployment
    // if (!line.validateSignature(body, config.channelSecret, signature)) {
    //   return NextResponse.json(
    //     { error: 'Invalid signature' },
    //     { status: 401 }
    //   )
    // }
    console.log('⚠️ WARNING: Signature validation is disabled for testing!')

    const events: line.WebhookEvent[] = JSON.parse(body).events

    console.log('📦 Received events count:', events.length)
    console.log('📦 Full webhook body:', JSON.stringify(JSON.parse(body), null, 2))

    // Process webhook events
    for (const event of events) {
      console.log('============================================')
      console.log('📨 LINE Webhook Event:', event.type)
      console.log('📨 Full event:', JSON.stringify(event, null, 2))
      console.log('============================================')

      // Handle different event types
      if (event.type === 'message' && event.message.type === 'text') {
        console.log('📱 Received text message:', event.message.text)
        console.log('👤 From User ID:', event.source.userId)

        // AI自動応答（replyTokenを使用）
        await handleAutoReplyWithReplyToken(event.replyToken, event.message.text)

      } else if (event.type === 'follow') {
        console.log('✅ New follower:', event.source.userId)

        // ウェルカムメッセージを送信
        await sendWelcomeMessage(event.source.userId)

      } else if (event.type === 'unfollow') {
        console.log('❌ User unfollowed:', event.source.userId)
        // TODO: Update database
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * AI自動応答（replyToken使用版）
 */
async function handleAutoReplyWithReplyToken(replyToken: string, userMessage: string) {
  try {
    console.log(`🤖 AI処理開始: "${userMessage}"`)

    // OpenAI APIで回答生成
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは「${STORE_INFO.name}」のLINE公式アカウントのAIアシスタントです。

【店舗情報】
- 店舗名: ${STORE_INFO.name}
- 業種: ${STORE_INFO.type}
- 営業時間: ${STORE_INFO.hours}
- 電話: ${STORE_INFO.phone}
- 住所: ${STORE_INFO.address}
- 特徴: ${STORE_INFO.features}
- 価格帯: ${STORE_INFO.priceRange}
- 予約URL: ${STORE_INFO.reservationUrl}

【対応ルール】
1. 親しみやすく丁寧な言葉遣いで回答
2. 質問に対して店舗情報をもとに的確に答える
3. 予約に関する質問には、電話番号とURLを案内
4. 営業時間外の問い合わせには、営業時間を案内
5. 回答は簡潔に（100文字以内推奨）
6. 絵文字を適度に使用して親しみやすく
7. 分からないことは正直に「詳しくはお電話でお問い合わせください」と案内`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const aiResponse = completion.choices[0]?.message?.content || '申し訳ございません。お答えできませんでした。'

    console.log(`✅ AI応答生成完了: "${aiResponse}"`)

    // LINEで返信
    await lineClient.replyMessage({
      replyToken: replyToken,
      messages: [
        {
          type: 'text',
          text: aiResponse,
        },
      ],
    })

    console.log('📤 LINE返信完了')
  } catch (error) {
    console.error('❌ AI自動応答エラー:', error)
  }
}

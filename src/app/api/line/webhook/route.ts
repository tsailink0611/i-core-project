import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || ''
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''

// Signature検証
function validateSignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) return false
  const hash = crypto
    .createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64')
  return hash === signature
}

// LINEメッセージ送信
async function sendLineMessage(replyToken: string, message: string) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LINE API Error: ${error}`)
  }

  return response.json()
}

// Push送信（スケジュール配信用）
export async function sendPushMessage(to: string, message: string) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to,
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LINE API Error: ${error}`)
  }

  return response.json()
}

// Broadcast送信（全友だち配信用）
export async function sendBroadcastMessage(message: string) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LINE API Error: ${error}`)
  }

  return response.json()
}

// Webhook受信
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature') || ''

    // 署名検証
    if (!validateSignature(body, signature)) {
      console.error('Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const events = data.events || []

    // イベント処理
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text
        const replyToken = event.replyToken

        // 簡単な応答例
        let replyMessage = 'メッセージを受け取りました！'

        if (userMessage.includes('予約') || userMessage.includes('予約したい')) {
          replyMessage = '予約を承りました。詳細はスタッフよりご連絡いたします。'
        } else if (userMessage.includes('営業時間')) {
          replyMessage = '営業時間は10:00〜19:00です（日曜定休）'
        } else if (userMessage.includes('ありがとう')) {
          replyMessage = 'こちらこそありがとうございます！またのご利用をお待ちしております。'
        }

        // 返信
        await sendLineMessage(replyToken, replyMessage)
      }

      // フォローイベント
      if (event.type === 'follow') {
        const replyToken = event.replyToken
        await sendLineMessage(
          replyToken,
          'お友だち追加ありがとうございます！\nこちらのアカウントから最新情報をお届けします。'
        )
      }

      // アンフォローイベント
      if (event.type === 'unfollow') {
        const userId = event.source.userId
        console.log(`User unfollowed: ${userId}`)
        // ここでデータベースから友だち情報を削除する処理を追加可能
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Webhook検証用
export async function GET() {
  return NextResponse.json({
    status: 'LINE Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}

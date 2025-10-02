import { NextRequest, NextResponse } from 'next/server'

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''

// メッセージ送信API
export async function POST(request: NextRequest) {
  try {
    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { type, to, message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let endpoint = ''
    let requestBody: any = {
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    }

    // 送信タイプによって処理を分岐
    switch (type) {
      case 'push':
        // 個別送信
        if (!to) {
          return NextResponse.json(
            { error: 'Recipient (to) is required for push messages' },
            { status: 400 }
          )
        }
        endpoint = 'https://api.line.me/v2/bot/message/push'
        requestBody.to = to
        break

      case 'broadcast':
        // 全員配信
        endpoint = 'https://api.line.me/v2/bot/message/broadcast'
        break

      case 'multicast':
        // 複数人配信
        if (!to || !Array.isArray(to)) {
          return NextResponse.json(
            { error: 'Recipients array (to) is required for multicast messages' },
            { status: 400 }
          )
        }
        endpoint = 'https://api.line.me/v2/bot/message/multicast'
        requestBody.to = to
        break

      default:
        return NextResponse.json(
          { error: 'Invalid message type. Use: push, broadcast, or multicast' },
          { status: 400 }
        )
    }

    // LINE API呼び出し
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('LINE API Error:', error)
      return NextResponse.json(
        { error: 'Failed to send LINE message', details: error },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      type,
      sentAt: new Date().toISOString(),
      result,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

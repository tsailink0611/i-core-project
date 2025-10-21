import { NextRequest, NextResponse } from 'next/server'
import { sendLineMessage, broadcastLineMessage } from '@/lib/line/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message, broadcast } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // ブロードキャスト送信
    if (broadcast) {
      await broadcastLineMessage(message)
      return NextResponse.json({
        success: true,
        type: 'broadcast',
        message: 'Message broadcasted successfully',
      })
    }

    // 個別送信
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for individual messages' },
        { status: 400 }
      )
    }

    await sendLineMessage(userId, message)
    return NextResponse.json({
      success: true,
      type: 'push',
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('LINE send message error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send LINE message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

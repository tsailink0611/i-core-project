import * as line from '@line/bot-sdk'

const config: line.ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

export const lineClient = new line.messagingApi.MessagingApiClient(config)

export interface LineMessage {
  type: 'text'
  text: string
}

/**
 * LINEメッセージを送信
 * @param userId LINE User ID
 * @param message 送信するメッセージ
 */
export async function sendLineMessage(userId: string, message: string) {
  try {
    await lineClient.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    })
    return { success: true }
  } catch (error) {
    console.error('LINE message send error:', error)
    throw error
  }
}

/**
 * LINE Broadcast メッセージを送信（全員に送信）
 * @param message 送信するメッセージ
 */
export async function broadcastLineMessage(message: string) {
  try {
    await lineClient.broadcast({
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    })
    return { success: true }
  } catch (error) {
    console.error('LINE broadcast error:', error)
    throw error
  }
}

import { NextRequest, NextResponse } from 'next/server'

// GPT-3.5-turboを使用したメッセージ生成（モック実装）
export async function POST(request: NextRequest) {
  try {
    const { businessTemplate, count = 3, selectedPromotion } = await request.json()

    // OpenAI APIキーが設定されている場合は実際のGPT-5-miniを使用
    if (process.env.OPENAI_API_KEY) {
      try {
        const { generateMultipleMessages } = await import('@/lib/openai/client')
        const messages = await generateMultipleMessages(businessTemplate, count, selectedPromotion)
        return NextResponse.json({ messages })
      } catch (error) {
        console.error('OpenAI API Error:', error)
        // APIエラーの場合はモックにフォールバック
      }
    }

    // APIキーがない場合またはエラーの場合はモックレスポンス
    const mockMessages = generateMockMessages(businessTemplate, count)
    return NextResponse.json({ messages: mockMessages })
  } catch (error) {
    console.error('Generate message error:', error)
    return NextResponse.json(
      { error: 'メッセージの生成に失敗しました' },
      { status: 500 }
    )
  }
}

// モックメッセージ生成関数
function generateMockMessages(businessTemplate: any, count: number): string[] {
  const { storeName, features, atmosphere, targetCustomers, messageStyle } = businessTemplate

  // ビジネスタイプに応じたモックメッセージを生成
  const baseMessages = {
    promotion: [
      `【本日のおすすめ】${storeName || 'お店'}より特別なご案内です！${features?.slice(0, 20) || '素敵な商品'}をご用意しております。ぜひお立ち寄りください✨`,
      `${storeName || '当店'}の週末限定キャンペーン開催中🎉 ${atmosphere === '高級' ? '上質な' : '楽しい'}時間をお過ごしください。詳細はプロフィールのリンクから！`,
      `おはようございます☀️ ${storeName || ''}です。本日も${targetCustomers?.includes('ファミリー') ? 'ご家族で' : ''}お待ちしております！`
    ],
    seasonal: [
      `🌸春の新メニューが登場！${storeName || 'お店'}で季節を感じる${atmosphere || '素敵な'}ひとときを。期間限定なのでお早めに！`,
      `夏季限定🌻 ${features?.slice(0, 30) || '特別なサービス'}をご提供中。暑い日にぴったりです！`,
      `秋の訪れとともに🍁 ${storeName || ''}では新しいサービスを開始しました。詳しくは店頭で！`
    ],
    greeting: [
      `はじめまして！${storeName || 'こちら'}のLINE公式アカウントです😊 ${features?.slice(0, 40) || '素敵なサービス'}でお客様をお待ちしています。`,
      `ご登録ありがとうございます🙏 ${storeName || '私たち'}は${messageStyle === '親しみやすい' ? 'アットホームな' : '丁寧な'}サービスでお迎えします。`,
      `友だち追加ありがとうございます！${storeName || ''}から最新情報やお得な特典をお届けします📱`
    ]
  }

  const messageTypes = ['promotion', 'seasonal', 'greeting'] as const
  const messages: string[] = []

  for (let i = 0; i < Math.min(count, 3); i++) {
    const type = messageTypes[i]
    const typeMessages = baseMessages[type]
    const message = typeMessages[Math.floor(Math.random() * typeMessages.length)]

    // ビジネス情報でカスタマイズ
    const customizedMessage = message
      .replace('お店', storeName || 'お店')
      .replace('当店', storeName || '当店')

    messages.push(customizedMessage)
  }

  // GPT-3.5風のフォーマットに調整
  return messages.map(msg => {
    // メッセージスタイルに応じて語尾を調整
    if (messageStyle === '丁寧') {
      return msg.replace(/！/g, '。').replace(/✨/g, '').replace(/🎉/g, '')
    } else if (messageStyle === 'カジュアル') {
      return msg.replace(/ください/g, 'くださーい').replace(/です/g, 'でーす')
    }
    return msg
  })
}
import { NextRequest, NextResponse } from 'next/server'
import type { BusinessTemplate, MessageSchedule } from '@/types/business'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { personaPrompt, businessTemplate } = await request.json()

    // OpenAI APIキーが設定されている場合は実際のGPT-5-miniを使用
    if (process.env.OPENAI_API_KEY) {
      try {
        const { generateMessage } = await import('@/lib/openai/client')

        // スケジュール&メッセージ生成プロンプト
        const schedulePrompt = `${personaPrompt}

【重要】以下の形式で、配信スケジュールと具体的なメッセージを5つ提案してください：

---
タイトル: 【具体的な企画名】
配信タイミング: 毎週○曜日 ○○時 / 毎月○日 / ○○の日
配信頻度: 週1回 / 月1回 / 不定期 等
目的: この配信の狙いと期待効果
メッセージ:
実際にLINE公式アカウントで送信する完成したメッセージ（100-150文字、絵文字1-2個含む）
---

条件：
- ${businessTemplate.category}の${businessTemplate.subCategory}に最適化
- 実際に配信可能な具体的なタイミング指定
- コピー&ペーストですぐ使えるメッセージ
- ターゲット層（${businessTemplate.targetCustomers.join('、')}）に響く内容
- 営業時間（${businessTemplate.businessHours}）を考慮
- ${businessTemplate.messageStyle}なトーン

例：
タイトル: 【週末予約受付中】
配信タイミング: 毎週木曜日 15:00
配信頻度: 週1回
目的: 週末の予約獲得と売上確保
メッセージ:
🎉週末のご予約受付中です！土日は人気の時間帯のため、お早めのご予約がおすすめです♪ 詳細はお電話または店頭でお気軽にどうぞ✨`

        const response = await generateMessage(
          {
            ...businessTemplate,
            aiPrompt: schedulePrompt
          },
          'promotion'
        )

        // レスポンスを解析してスケジュール形式に変換
        const schedules = parseScheduleResponse(response)
        return NextResponse.json({ schedules })

      } catch (error) {
        console.error('OpenAI API Error:', error)
        // APIエラーの場合はモックにフォールバック
      }
    }

    // APIキーがない場合またはエラーの場合はモックスケジュール
    const mockSchedules = generateMockSchedules(businessTemplate)
    return NextResponse.json({ schedules: mockSchedules })

  } catch (error) {
    console.error('Schedule generation error:', error)
    return NextResponse.json(
      { error: 'スケジュールの生成に失敗しました' },
      { status: 500 }
    )
  }
}

// AIレスポンスを解析してスケジュール形式に変換
function parseScheduleResponse(response: string): MessageSchedule[] {
  const schedules: MessageSchedule[] = []
  const sections = response.split('---').filter(section => section.trim())

  sections.forEach(section => {
    const lines = section.trim().split('\n')
    const schedule: Partial<MessageSchedule> = {}

    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('タイトル:')) {
        schedule.title = trimmedLine.replace('タイトル:', '').trim()
      } else if (trimmedLine.startsWith('配信タイミング:')) {
        schedule.timing = trimmedLine.replace('配信タイミング:', '').trim()
      } else if (trimmedLine.startsWith('配信頻度:')) {
        schedule.frequency = trimmedLine.replace('配信頻度:', '').trim()
      } else if (trimmedLine.startsWith('目的:')) {
        schedule.purpose = trimmedLine.replace('目的:', '').trim()
      } else if (trimmedLine.startsWith('メッセージ:')) {
        // メッセージ部分を取得（複数行の場合を考慮）
        const messageIndex = lines.indexOf(line)
        const messageLines = lines.slice(messageIndex + 1).join('\n').trim()
        schedule.message = messageLines
      }
    })

    if (schedule.title && schedule.timing && schedule.message) {
      schedules.push(schedule as MessageSchedule)
    }
  })

  return schedules.length > 0 ? schedules : generateMockSchedules({ category: '汎用', subCategory: '一般' })
}

// 業種別モックスケジュール
function generateMockSchedules(businessTemplate: BusinessTemplate): MessageSchedule[] {
  const { category, subCategory, name } = businessTemplate

  if (category === '飲食業') {
    if (subCategory === '居酒屋') {
      return [
        {
          title: '【週始めハッピーアワー告知】',
          timing: '毎週月曜日 15:00',
          frequency: '週1回',
          purpose: '平日早い時間帯の集客向上',
          message: '🍻今週もハッピーアワー開催中！平日17-19時はドリンク全品半額です♪ お仕事帰りにぜひお立ち寄りください！'
        },
        {
          title: '【週末おすすめ料理】',
          timing: '毎週金曜日 12:00',
          frequency: '週1回',
          purpose: '週末来店促進と特別メニュー訴求',
          message: '🐟週末は新鮮な海鮮料理をご用意してお待ちしております！土日は19時以降のご予約がおすすめです✨'
        },
        {
          title: '【雨の日特典告知】',
          timing: '雨予報の日 10:00',
          frequency: '天候次第',
          purpose: '悪天候時の売上確保',
          message: '☔本日雨予報のため、お会計10%OFFサービス実施中！温かいお料理でお客様をお迎えします♪'
        }
      ]
    } else if (subCategory === 'カフェ・バー') {
      return [
        {
          title: '【モーニングタイム案内】',
          timing: '毎日 8:00',
          frequency: '毎日',
          purpose: '朝の時間帯売上向上',
          message: '☀️おはようございます！本日もモーニングセットをご用意してお待ちしております♪ 9時までの特別価格です！'
        },
        {
          title: '【新作ドリンク紹介】',
          timing: '毎月第1月曜日 14:00',
          frequency: '月1回',
          purpose: '新メニュー認知向上と話題性創出',
          message: '🎉今月の新作ドリンクが登場しました！季節限定の特別な味をぜひお試しください✨ 数量限定です！'
        }
      ]
    }
  } else if (category === 'サロン・美容') {
    if (subCategory === '美容院・ヘアサロン') {
      return [
        {
          title: '【メンテナンスカットのご案内】',
          timing: '毎月15日 10:00',
          frequency: '月1回',
          purpose: '定期来店促進',
          message: '✂️前回のカットから3-4週間が経ちました！メンテナンスカットで美しいスタイルをキープしませんか？ お早めのご予約をお待ちしております♪'
        },
        {
          title: '【季節のヘアケア情報】',
          timing: '毎週火曜日 15:00',
          frequency: '週1回',
          purpose: '専門性アピールと顧客満足度向上',
          message: '💄今週のヘアケアTips！湿気の多い季節は洗い流さないトリートメントがおすすめです✨ 詳しくはスタッフまでお気軽にどうぞ！'
        }
      ]
    }
  } else if (category === 'クリニック・治療') {
    if (subCategory === '医科クリニック') {
      return [
        {
          title: '【健診時期のご案内】',
          timing: '毎月1日 9:00',
          frequency: '月1回',
          purpose: '定期健診率向上',
          message: '🏥今月は健康診断月間です。定期的な健診で健康管理を始めませんか？ ご予約はお電話またはWEBで承っております。'
        },
        {
          title: '【季節の健康情報】',
          timing: '毎週水曜日 8:00',
          frequency: '週1回',
          purpose: '予防医学啓発と信頼関係構築',
          message: '🌡️季節の変わり目は体調を崩しやすい時期です。手洗い・うがいと十分な睡眠で健康管理を心がけましょう💪'
        }
      ]
    }
  }

  // 汎用スケジュール
  return [
    {
      title: '【定期サービス案内】',
      timing: '毎週金曜日 14:00',
      frequency: '週1回',
      purpose: 'サービス認知向上',
      message: '✨いつもありがとうございます！今週もお客様に最高のサービスをご提供いたします♪ ご予約お待ちしております！'
    },
    {
      title: '【お得情報配信】',
      timing: '毎月第2火曜日 10:00',
      frequency: '月1回',
      purpose: '特典周知と来店促進',
      message: '🎁今月のお得な情報をお届け！特別サービスをご用意してお待ちしております✨ 詳細はお気軽にお問い合わせください！'
    }
  ]
}
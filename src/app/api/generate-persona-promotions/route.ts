import { NextRequest, NextResponse } from 'next/server'
import type { BusinessTemplate } from '@/types/business'
import { LCoreErrorHandler, ErrorType } from '@/lib/errors/errorHandler'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { personaPrompt, businessTemplate } = await request.json()

    // OpenAI APIキーが設定されている場合は実際のGPT-5-miniを使用
    if (process.env.OPENAI_API_KEY) {
      try {
        const { generateMessage } = await import('@/lib/openai/client')

        // ペルソナAIによるプロモーション提案プロンプト
        const promotionPrompt = `${personaPrompt}

【重要指示】必ず以下の形式で、この業種に最適なプロモーション企画を5つ提案してください。他の形式は一切禁止です：

1. 【企画名】: 具体的な企画名
   内容: 企画の詳細説明
   実施時期: いつ実施するか
   期待効果: どんな効果を狙うか

2. 【企画名】: 2つ目の具体的な企画名
   内容: 企画の詳細説明
   実施時期: いつ実施するか
   期待効果: どんな効果を狙うか

3. 【企画名】: 3つ目の具体的な企画名
   内容: 企画の詳細説明
   実施時期: いつ実施するか
   期待効果: どんな効果を狙うか

4. 【企画名】: 4つ目の具体的な企画名
   内容: 企画の詳細説明
   実施時期: いつ実施するか
   期待効果: どんな効果を狙うか

5. 【企画名】: 5つ目の具体的な企画名
   内容: 企画の詳細説明
   実施時期: いつ実施するか
   期待効果: どんな効果を狙うか

各企画は以下の観点で考えてください：
- ${businessTemplate.category}の${businessTemplate.subCategory}の特性に合った自然な企画
- 実施しやすい現実的な内容
- ターゲット層に響く魅力的な提案
- 季節性や時期を考慮した提案
- SNSやLINEと相性の良い企画

決して一般的すぎず、${businessTemplate.category}の${businessTemplate.subCategory}という業種の特徴を活かした具体的で実用的な提案をお願いします。`

        const response = await generateMessage(
          {
            ...businessTemplate,
            aiPrompt: promotionPrompt
          },
          'promotion'
        )

        console.log('OpenAI Response:', response)

        // レスポンスを個別の提案に分割
        let suggestions: string[] = []

        // 企画形式のレスポンスを試行
        if (response.includes('【') && response.includes('企画名')) {
          suggestions = response.split(/\d+\.\s*【/).slice(1).map((item, index) => {
            return `${index + 1}. 【${item.trim()}`
          })
        }
        // 箇条書き形式を試行
        else if (response.includes('1.') && response.includes('内容:') && response.includes('期待効果:')) {
          const lines = response.split(/\n/).filter(line =>
            line.trim().match(/^(\d+\.|・|-)/) && line.trim().length > 10
          )
          suggestions = lines.map((line, index) => `${index + 1}. ${line.trim().replace(/^(\d+\.|・|-)\s*/, '')}`)
        }
        else {
          // 期待する形式でない場合はモックにフォールバック
          console.log('AI response not in expected format, falling back to mock')
          suggestions = []
        }

        console.log('Parsed suggestions:', suggestions)

        // 適切な企画が生成されなかった場合はモックにフォールバック
        if (suggestions.length === 0) {
          const mockSuggestions = generateMockPromotions(businessTemplate)
          return NextResponse.json({ suggestions: mockSuggestions })
        }

        return NextResponse.json({ suggestions })

      } catch (error) {
        const lCoreError = LCoreErrorHandler.handleError(error, 'generate-persona-promotions')
        console.error('OpenAI API Error:', lCoreError)
        // APIエラーの場合はモックにフォールバック
      }
    }

    // APIキーがない場合またはエラーの場合はモック提案
    const mockSuggestions = generateMockPromotions(businessTemplate)
    return NextResponse.json({ suggestions: mockSuggestions })

  } catch (error) {
    const lCoreError = LCoreErrorHandler.handleError(error, 'generate-persona-promotions')
    console.error('Persona promotion generation error:', lCoreError)
    return NextResponse.json(
      {
        error: LCoreErrorHandler.getUserMessage(lCoreError),
        code: lCoreError.code,
        retryable: lCoreError.retryable
      },
      { status: 500 }
    )
  }
}

// 業種別モックプロモーション提案
function generateMockPromotions(businessTemplate: BusinessTemplate): string[] {
  const { category, subCategory, storeName } = businessTemplate

  if (category === '飲食業') {
    if (subCategory === '居酒屋') {
      return [
        '1. 【平日ハッピーアワー】: 17:00-19:00限定でドリンク半額。会社帰りの客層を狙い、平日の集客を向上させる。',
        '2. 【常連様感謝祭】: 月1回、常連客限定の特別メニューやサービス。リピーター満足度向上と口コミ促進。',
        '3. 【季節の特別コース】: 春は花見、冬は忘年会など季節に合わせた限定コース。グループ客の獲得と客単価向上。',
        '4. 【雨の日特典】: 雨の日来店でお会計10%OFF。悪天候時の売上確保と話題性創出。',
        '5. 【SNS投稿キャンペーン】: 料理写真をSNSに投稿で次回使える割引券プレゼント。若年層獲得とWEB集客強化。'
      ]
    } else if (subCategory === 'カフェ・バー') {
      return [
        '1. 【モーニングタイム限定】: 開店-10:00までのコーヒー＋軽食セット特価。朝の時間帯の売上向上。',
        '2. 【読書割引】: 本を持参で10%OFF。長時間滞在客の獲得と差別化。',
        '3. 【季節限定ドリンク】: 春は桜ラテ、夏は氷コーヒーなど。インスタ映えと話題性で新規客獲得。',
        '4. 【勉強応援キャンペーン】: 学生証提示で延長料金無料。学生客の獲得と平日昼間の売上向上。',
        '5. 【コーヒー豆販売】: 店で使用している豆の販売とテイクアウト促進。売上の多角化と顧客囲い込み。'
      ]
    }
  } else if (category === 'サロン・美容') {
    if (subCategory === '美容院・ヘアサロン') {
      return [
        '1. 【紹介割引制度】: お客様紹介で双方に特典。新規客獲得とリピーター満足度向上。',
        '2. 【メンテナンスカット】: 前回から4週間以内の来店で割引。定期来店の促進とスケジュール管理。',
        '3. 【季節のヘアケア】: 梅雨時期の湿気対策、夏の紫外線ケアなど。季節の悩み解決とメニュー訴求。',
        '4. 【SNSモデル募集】: カット＆スタイリング無料でSNS掲載許可をもらう。技術力アピールと集客。',
        '5. 【ホームケアアドバイス】: LINE限定でヘアケア方法を動画配信。専門性アピールと顧客満足度向上。'
      ]
    } else if (subCategory === 'ネイル・まつげ') {
      return [
        '1. 【定期メンテナンス】: 3-4週間での定期来店で割引特典。安定した売上確保と顧客管理。',
        '2. 【デザイン持ち込み】: Instagram等の画像持参で割引。トレンド対応力アピールと満足度向上。',
        '3. 【イベント前特別プラン】: 結婚式、入学式等の前に特別価格。特別な日の需要獲得。',
        '4. 【ケア用品販売】: ネイルオイルやまつげ美容液の販売。売上向上と自宅ケア提案。',
        '5. 【友達割引】: 友人同士の来店で双方割引。新規客獲得と楽しい雰囲気作り。'
      ]
    }
  } else if (category === 'クリニック・治療') {
    if (subCategory === '医科クリニック') {
      return [
        '1. 【定期健診促進】: 健診時期のリマインダーと予約の取りやすさ向上。継続受診率向上。',
        '2. 【予防医学情報】: 季節の健康情報や病気予防の情報発信。専門性アピールと信頼関係構築。',
        '3. 【待ち時間短縮】: 混雑状況のリアルタイム配信。患者満足度向上と効率的な運営。',
        '4. 【家族健康相談】: LINE経由での軽微な健康相談対応。アクセス向上と患者サービス。',
        '5. 【薬の飲み忘れ防止】: 服薬リマインダー機能。治療効果向上と患者ケア充実。'
      ]
    } else if (subCategory === '整骨・治療院') {
      return [
        '1. 【メンテナンス通院】: 定期的な身体のメンテナンス来院促進。予防的アプローチと安定収入。',
        '2. 【運動指導】: 自宅でできるストレッチや運動の動画配信。専門性活用と差別化。',
        '3. 【スポーツ応援】: 地元スポーツチームやマラソン大会のサポート。地域密着と認知度向上。',
        '4. 【姿勢改善プログラム】: デスクワーカー向けの姿勢改善指導。現代人の悩み解決とニーズ対応。',
        '5. 【交通事故対応】: 交通事故治療の迅速対応と保険対応。専門分野アピールと緊急時対応。'
      ]
    }
  }

  // 汎用的なモック提案
  return [
    '1. 【季節限定サービス】: 季節に合わせた特別メニューやサービスの提供。時期限定感で来店促進。',
    '2. 【リピーター特典】: 定期来店のお客様への特別割引や特典。顧客満足度とリピート率向上。',
    '3. 【紹介キャンペーン】: お客様からの紹介で双方に特典。新規客獲得と既存客満足度向上。',
    '4. 【SNS連動企画】: 写真投稿や口コミ投稿での特典付与。WEB集客と口コミ促進。',
    '5. 【記念日サービス】: 開店記念日や特別な日のイベント企画。話題性創出と地域密着感向上。'
  ]
}
// 業種別プロモーション企画テンプレート

export interface PromotionTemplate {
  category: string // 企画カテゴリー
  title: string // 企画タイトル
  description: string // 詳細説明
  trigger: string // 実施条件・トリガー
  target: string[] // ターゲット層
  frequency: string // 実施頻度
  expectedEffect: string // 期待効果
  messageExample: string // メッセージ例文
}

export interface BusinessPromotions {
  regular: PromotionTemplate[] // 定期的なプロモーション
  seasonal: PromotionTemplate[] // 季節・イベント系
  weather: PromotionTemplate[] // 天候連動系
  special: PromotionTemplate[] // 特別企画系
}

// 業種別プロモーションテンプレート
export const promotionTemplates: Record<string, Record<string, Record<string, BusinessPromotions>>> = {
  '飲食業': {
    '居酒屋': {
      '個人経営': {
        regular: [
          {
            category: '定期',
            title: 'ハッピーアワー',
            description: '平日17:00-19:00限定でドリンク全品半額',
            trigger: '平日17:00-19:00',
            target: ['会社帰りのサラリーマン', 'OL'],
            frequency: '毎日',
            expectedEffect: '平日の早い時間帯の集客向上',
            messageExample: '🍻平日ハッピーアワー開催中！17-19時はドリンク全品半額です♪ お仕事帰りにぜひどうぞ！'
          },
          {
            category: '定期',
            title: '誕生日特典',
            description: '誕生月のお客様に乾杯ドリンク1杯サービス',
            trigger: 'お客様の誕生月',
            target: ['リピーター客', '常連客'],
            frequency: '随時',
            expectedEffect: 'リピート率向上、顧客ロイヤリティ強化',
            messageExample: '🎂お誕生日おめでとうございます！今月はお祝いドリンクを1杯サービスさせていただきます🥂'
          }
        ],
        seasonal: [
          {
            category: '季節',
            title: '忘年会・新年会プラン',
            description: '12月-2月限定の宴会コース特別価格',
            trigger: '12月-2月期間',
            target: ['会社の飲み会幹事', 'グループ客'],
            frequency: '年1回',
            expectedEffect: '大人数グループ客の獲得',
            messageExample: '🍻忘年会シーズン到来！特別コース4000円でご提供中。ご予約はお早めに！'
          },
          {
            category: '季節',
            title: '花見メニュー',
            description: '3月-4月限定の春の旬食材を使った特別メニュー',
            trigger: '3月-4月期間',
            target: ['季節を楽しむ客層', 'グルメ志向客'],
            frequency: '年1回',
            expectedEffect: '季節感のあるメニューで差別化',
            messageExample: '🌸春の味覚フェア開催中！桜鯛や筍など旬の食材をお楽しみください♪'
          }
        ],
        weather: [
          {
            category: '天候',
            title: '雨の日割引',
            description: '雨の日はお会計から10%OFF',
            trigger: '降水確率70%以上の日',
            target: ['近隣住民', '悪天候でも来店する客'],
            frequency: '天候次第',
            expectedEffect: '悪天候時の売上補完',
            messageExample: '☔雨の日特典！本日雨予報につき、お会計10%OFFです。温かいお料理でお待ちしております！'
          }
        ],
        special: [
          {
            category: '特別',
            title: '常連様感謝デー',
            description: '月1回、常連客限定の特別イベント',
            trigger: '毎月最終金曜日',
            target: ['常連客', 'VIP客'],
            frequency: '月1回',
            expectedEffect: '顧客満足度向上、口コミ促進',
            messageExample: '🙏いつもありがとうございます！明日は常連様感謝デー。特別メニューをご用意してお待ちしております！'
          }
        ]
      },
      'チェーン店': {
        regular: [
          {
            category: '定期',
            title: 'ポイント2倍デー',
            description: '毎週火曜日はポイント2倍付与',
            trigger: '毎週火曜日',
            target: ['ポイント会員', 'リピーター'],
            frequency: '週1回',
            expectedEffect: '火曜日の集客向上、会員数増加',
            messageExample: '✨明日は火曜ポイント2倍デー！お得にポイントを貯めるチャンスです♪'
          }
        ],
        seasonal: [
          {
            category: '季節',
            title: 'クリスマス限定メニュー',
            description: '12月限定のクリスマス特別コース',
            trigger: '12月1日-25日',
            target: ['カップル', 'ファミリー'],
            frequency: '年1回',
            expectedEffect: '特別感のある体験提供',
            messageExample: '🎄クリスマス限定コース登場！大切な人との特別な時間をお過ごしください✨'
          }
        ],
        weather: [
          {
            category: '天候',
            title: '暑い日キャンペーン',
            description: '気温30度以上の日は冷たいドリンク半額',
            trigger: '最高気温30度以上',
            target: ['暑さを避けたい客', '冷房目当て客'],
            frequency: '夏季',
            expectedEffect: '猛暑日の集客確保',
            messageExample: '🌞本日30度超え！冷たいドリンク半額で涼しくお過ごしください♪'
          }
        ],
        special: [
          {
            category: '特別',
            title: '新メニュー試食会',
            description: '新メニューのモニター試食会',
            trigger: '新メニュー開発時',
            target: ['グルメ志向客', 'SNS発信力のある客'],
            frequency: '不定期',
            expectedEffect: '新メニューの評価収集、話題性創出',
            messageExample: '🆕新メニュー試食会開催！ご意見をお聞かせください。参加者には特典もご用意♪'
          }
        ]
      }
    },
    'カフェ': {
      'コーヒー専門': {
        regular: [
          {
            category: '定期',
            title: 'モーニングセット',
            description: '朝9時までの来店でドリンク+軽食セット特価',
            trigger: '営業開始-9:00',
            target: ['通勤前の会社員', '朝活している人'],
            frequency: '毎日',
            expectedEffect: '朝の時間帯売上向上',
            messageExample: '☀️おはようございます！9時までのモーニングセット、本日もご用意しております♪'
          }
        ],
        seasonal: [
          {
            category: '季節',
            title: 'アイスコーヒーフェア',
            description: '夏季限定のアイスコーヒー各種',
            trigger: '6月-8月',
            target: ['コーヒー愛好家', '暑さ対策客'],
            frequency: '年1回',
            expectedEffect: '夏季の売上確保',
            messageExample: '☕夏のアイスコーヒーフェア開催中！ひんやり美味しい特別ブレンドをどうぞ🧊'
          }
        ],
        weather: [
          {
            category: '天候',
            title: '雨カフェ',
            description: '雨の日は読書スペース無料開放+ホットドリンク割引',
            trigger: '降雨時',
            target: ['読書好き', '雨宿り客'],
            frequency: '雨天時',
            expectedEffect: '雨天時の売上補完、滞在時間延長',
            messageExample: '☔雨の日は当店で読書タイム♪ホットドリンク割引中です📚'
          }
        ],
        special: [
          {
            category: '特別',
            title: 'コーヒー教室',
            description: '月1回開催のコーヒー淹れ方教室',
            trigger: '毎月第3土曜日',
            target: ['コーヒー愛好家', '学習意欲の高い客'],
            frequency: '月1回',
            expectedEffect: '顧客エンゲージメント向上、専門性アピール',
            messageExample: '☕今月のコーヒー教室は今度の土曜日！美味しい淹れ方をお教えします♪'
          }
        ]
      }
    }
  },
  '小売業': {
    'アパレル': {
      'レディース': {
        regular: [
          {
            category: '定期',
            title: 'メンバーズデー',
            description: '毎月10日はメンバー限定20%OFF',
            trigger: '毎月10日',
            target: ['会員客', 'リピーター'],
            frequency: '月1回',
            expectedEffect: '会員獲得、リピート促進',
            messageExample: '💝明日はメンバーズデー！会員様限定20%OFFです。新作もお得にゲットできます♪'
          }
        ],
        seasonal: [
          {
            category: '季節',
            title: 'スプリングコレクション',
            description: '春の新作一斉入荷フェア',
            trigger: '3月-4月',
            target: ['ファッション感度の高い女性', '新生活準備者'],
            frequency: '年1回',
            expectedEffect: '春物の売上最大化',
            messageExample: '🌸春の新作が続々入荷中！新生活に向けて新しいスタイルを見つけませんか？✨'
          }
        ],
        weather: [
          {
            category: '天候',
            title: '急な寒さ対策',
            description: '気温急降下日はアウター特別価格',
            trigger: '前日比5度以上気温低下',
            target: ['防寒対策が必要な女性'],
            frequency: '気温変動時',
            expectedEffect: '季節変わり目の売上確保',
            messageExample: '🧥急に寒くなりましたね！本日アウター特別価格でご提供中です♪'
          }
        ],
        special: [
          {
            category: '特別',
            title: 'スタイリング相談会',
            description: 'プロスタイリストによる無料相談',
            trigger: '月末土曜日',
            target: ['ファッションに悩む女性', 'イメチェン希望者'],
            frequency: '月1回',
            expectedEffect: '顧客満足度向上、高額商品販売',
            messageExample: '💄今月のスタイリング相談会は今度の土曜日！あなたに似合うスタイルを見つけましょう✨'
          }
        ]
      }
    }
  },
  'サービス業': {
    '美容': {
      '美容院': {
        regular: [
          {
            category: '定期',
            title: 'リピート割引',
            description: '前回から4週間以内の再来店で10%OFF',
            trigger: '前回来店から4週間以内',
            target: ['既存客', 'リピーター'],
            frequency: '来店タイミング',
            expectedEffect: '定期来店の促進',
            messageExample: '✂️前回から4週間が経ちました！今なら10%OFFでお手入れできます♪'
          }
        ],
        seasonal: [
          {
            category: '季節',
            title: '成人式ヘアセット',
            description: '1月成人式向け特別ヘアセット',
            trigger: '12月-1月',
            target: ['新成人', 'その家族'],
            frequency: '年1回',
            expectedEffect: '特別なイベント需要の取り込み',
            messageExample: '🎊成人式のヘアセット承ります！一生に一度の特別な日を美しく彩りましょう✨'
          }
        ],
        weather: [
          {
            category: '天候',
            title: '湿気対策トリートメント',
            description: '梅雨時期の湿気対策メニュー',
            trigger: '湿度70%以上の日',
            target: ['髪のうねりに悩む客'],
            frequency: '梅雨時期',
            expectedEffect: '季節特有の悩み解決',
            messageExample: '☔湿気で髪が大変な季節ですね。湿気対策トリートメントはいかがですか？'
          }
        ],
        special: [
          {
            category: '特別',
            title: 'ヘアケア講座',
            description: '自宅でのヘアケア方法レクチャー',
            trigger: '月1回',
            target: ['美髪を目指す客', 'ヘアケア初心者'],
            frequency: '月1回',
            expectedEffect: '専門性アピール、顧客教育',
            messageExample: '💇‍♀️今月のヘアケア講座開催！美髪を保つ秘訣をお教えします♪'
          }
        ]
      }
    }
  }
}

// 業種に応じたプロモーションテンプレート取得
export function getPromotionTemplates(
  category: string,
  subCategory: string,
  businessType: string
): BusinessPromotions | null {
  return promotionTemplates[category]?.[subCategory]?.[businessType] || null
}

// 現在の季節に適したプロモーション取得
export function getSeasonalPromotions(
  category: string,
  subCategory: string,
  businessType: string
): PromotionTemplate[] {
  const templates = getPromotionTemplates(category, subCategory, businessType)
  if (!templates) return []

  const currentMonth = new Date().getMonth() + 1

  return templates.seasonal.filter(promo => {
    // 簡単な季節判定（実際にはより詳細な条件分岐が必要）
    if (promo.trigger.includes('12月-2月') && (currentMonth === 12 || currentMonth === 1 || currentMonth === 2)) return true
    if (promo.trigger.includes('3月-4月') && (currentMonth === 3 || currentMonth === 4)) return true
    if (promo.trigger.includes('6月-8月') && (currentMonth >= 6 && currentMonth <= 8)) return true
    return false
  })
}

// 天候に応じたプロモーション取得（実装例）
export function getWeatherPromotions(
  category: string,
  subCategory: string,
  businessType: string,
  weatherCondition: 'rainy' | 'hot' | 'cold' | 'normal'
): PromotionTemplate[] {
  const templates = getPromotionTemplates(category, subCategory, businessType)
  if (!templates) return []

  return templates.weather.filter(promo => {
    if (weatherCondition === 'rainy' && promo.trigger.includes('降雨')) return true
    if (weatherCondition === 'hot' && promo.trigger.includes('30度以上')) return true
    if (weatherCondition === 'cold' && promo.trigger.includes('気温急降下')) return true
    return false
  })
}
// 現在日時・季節認識ユーティリティ

export interface CurrentContext {
  currentDate: Date
  year: number
  month: number
  day: number
  dayOfWeek: string
  season: string
  seasonContext: string
  businessContext: string[]
}

// 現在のコンテキストを取得
export function getCurrentContext(): CurrentContext {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-based to 1-based
  const day = now.getDate()

  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  const dayOfWeek = dayNames[now.getDay()]

  const season = getSeason(month)
  const seasonContext = getSeasonContext(month, day)
  const businessContext = getBusinessContext(month, day, dayOfWeek)

  return {
    currentDate: now,
    year,
    month,
    day,
    dayOfWeek,
    season,
    seasonContext,
    businessContext
  }
}

// 季節判定
function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return '春'
  if (month >= 6 && month <= 8) return '夏'
  if (month >= 9 && month <= 11) return '秋'
  return '冬'
}

// 季節的コンテキスト
function getSeasonContext(month: number, day: number): string {
  // 9月の場合
  if (month === 9) {
    if (day <= 10) return '夏の終わり、秋の始まり'
    if (day <= 20) return '秋の気配、涼しくなる時期'
    return '本格的な秋、過ごしやすい季節'
  }

  // 10月の場合
  if (month === 10) {
    if (day <= 15) return '秋本番、紅葉の季節'
    return '晩秋、年末に向けた準備期間'
  }

  // 11月の場合
  if (month === 11) {
    if (day <= 15) return '晩秋、寒さが増す時期'
    return '初冬、年末商戦の開始'
  }

  // 12月の場合
  if (month === 12) {
    if (day <= 15) return '年末商戦、忘年会シーズン'
    if (day <= 25) return 'クリスマスシーズン'
    return '年末、大掃除・正月準備'
  }

  // 1月の場合
  if (month === 1) {
    if (day <= 7) return '正月、新年の挨拶'
    if (day <= 15) return '成人の日、新年会シーズン'
    return '寒さ本番、節分に向けて'
  }

  // 2月の場合
  if (month === 2) {
    if (day <= 14) return 'バレンタインシーズン'
    return '春の気配、卒業・送別会準備'
  }

  // 3月の場合
  if (month === 3) {
    if (day <= 15) return '卒業・送別会シーズン'
    return '春の訪れ、新生活準備'
  }

  // 4月の場合
  if (month === 4) {
    if (day <= 15) return '新生活スタート、歓迎会シーズン'
    return '花見シーズン、春本番'
  }

  // 5月の場合
  if (month === 5) {
    if (day <= 7) return 'ゴールデンウィーク'
    return '新緑の季節、母の日'
  }

  // 6月の場合
  if (month === 6) {
    if (day <= 15) return '梅雨入り、ジューンブライド'
    return '梅雨本番、夏至に向けて'
  }

  // 7月の場合
  if (month === 7) {
    if (day <= 15) return '梅雨明け、夏本番開始'
    return '夏休み、お中元シーズン'
  }

  // 8月の場合
  if (month === 8) {
    if (day <= 15) return 'お盆休み、夏休み本番'
    return '残暑、夏の終わりに向けて'
  }

  return `${getSeason(month)}の時期`
}

// ビジネス的コンテキスト
function getBusinessContext(month: number, day: number, dayOfWeek: string): string[] {
  const context: string[] = []

  // 曜日による
  if (dayOfWeek === '月') context.push('週始め、仕事モード')
  if (dayOfWeek === '金') context.push('週末前、お疲れ様の時期')
  if (dayOfWeek === '土' || dayOfWeek === '日') context.push('週末、リラックスタイム')

  // 月・時期による
  if (month === 9) {
    context.push('秋の新メニュー検討時期')
    context.push('夏疲れのケア需要')
    if (day >= 20) context.push('運動会・秋祭りシーズン')
  }

  if (month === 10) {
    context.push('紅葉狩り、秋の行楽')
    context.push('ハロウィンイベント検討')
    context.push('年末忘年会の予約受付開始')
    context.push('冬支度、温かいメニュー需要')
  }

  if (month === 11) {
    context.push('忘年会シーズン本格化')
    context.push('クリスマスメニュー検討')
    context.push('冬の乾燥対策（美容系）')
    context.push('インフルエンザ予防（医療系）')
  }

  if (month === 12) {
    context.push('忘年会ピーク')
    context.push('クリスマス商戦')
    context.push('年末大掃除')
    context.push('正月準備')
  }

  if (month === 1) {
    context.push('新年会シーズン')
    context.push('新年の目標・習慣づくり')
    context.push('成人式（美容系需要）')
  }

  if (month === 2) {
    context.push('バレンタイン商戦')
    context.push('花粉症対策開始')
    context.push('送別会準備')
  }

  if (month === 3) {
    context.push('卒業・送別会シーズン')
    context.push('花粉症ピーク')
    context.push('新生活準備')
    context.push('春の新メニュー')
  }

  if (month === 4) {
    context.push('新生活スタート')
    context.push('歓迎会シーズン')
    context.push('花見需要')
    context.push('新規客獲得チャンス')
  }

  if (month === 5) {
    context.push('ゴールデンウィーク')
    context.push('母の日ギフト')
    context.push('新緑の季節')
    context.push('外出増加傾向')
  }

  if (month === 6) {
    context.push('梅雨対策')
    context.push('ジューンブライド')
    context.push('夏に向けた準備')
    context.push('湿気対策（美容系）')
  }

  if (month === 7) {
    context.push('夏休み開始')
    context.push('お中元')
    context.push('暑さ対策')
    context.push('夏の肌ケア（美容系）')
  }

  if (month === 8) {
    context.push('お盆休み')
    context.push('夏休み本番')
    context.push('暑さピーク')
    context.push('夏バテ対策')
  }

  return context
}

// 業種別の季節提案
export function getSeasonalSuggestions(
  category: string,
  subCategory: string,
  context: CurrentContext
): string[] {
  const suggestions: string[] = []

  if (category === '飲食業') {
    if (context.month === 9) {
      suggestions.push('秋の味覚メニュー（栗、さつまいも、新米）')
      suggestions.push('温かいメニューの訴求開始')
      suggestions.push('忘年会予約の早期受付開始')
    }
    if (context.month === 10) {
      suggestions.push('忘年会プラン本格展開')
      suggestions.push('ハロウィンイベント')
      suggestions.push('秋の日本酒・ワインフェア')
    }
  }

  if (category === 'サロン・美容') {
    if (context.month === 9) {
      suggestions.push('夏のダメージケア（髪・肌）')
      suggestions.push('秋のヘアカラー提案')
      suggestions.push('乾燥対策の提案開始')
    }
    if (context.month === 10) {
      suggestions.push('冬に向けた保湿ケア強化')
      suggestions.push('成人式前撮り・準備（1月に向けて）')
      suggestions.push('秋のブライダル需要')
    }
  }

  if (category === 'クリニック・治療') {
    if (context.month === 9) {
      suggestions.push('秋の健康診断キャンペーン')
      suggestions.push('インフルエンザ予防接種案内')
      suggestions.push('季節の変わり目体調管理')
    }
    if (context.month === 10) {
      suggestions.push('インフルエンザ予防接種本格化')
      suggestions.push('乾燥による肌トラブル対策')
      suggestions.push('冬の感染症予防情報')
    }
  }

  return suggestions
}

// プロモーション用の現在コンテキスト文字列生成
export function generateContextPrompt(): string {
  const context = getCurrentContext()

  return `【現在の日時・季節情報】
日付: ${context.year}年${context.month}月${context.day}日（${context.dayOfWeek}曜日）
季節: ${context.season}（${context.seasonContext}）
ビジネス的背景: ${context.businessContext.join('、')}

この時期の特徴を踏まえた、タイムリーで効果的なプロモーション企画を提案してください。`
}
// ビジネスタイプごとのデフォルトテンプレートデータ

export type BusinessTemplate = {
  storeName: string
  priceRange: string
  atmosphere: string
  targetCustomers: string[]
  businessHours: string
  features: string
  goals: string
  messageStyle: string
  sampleMessages?: string[]
  aiPrompt?: string
}

export const businessTemplates: Record<string, Record<string, Record<string, BusinessTemplate>>> = {
  '飲食業': {
    '居酒屋': {
      '個人経営': {
        storeName: '居酒屋 〇〇',
        priceRange: '3000-5000',
        atmosphere: 'カジュアル',
        targetCustomers: ['30代男性', '30代女性', '40代男性', 'ビジネス利用'],
        businessHours: '17:00-24:00（月曜定休）',
        features: '新鮮な海鮮料理が自慢。地元の日本酒を豊富に取り揃え、アットホームな雰囲気で常連さんに愛される店',
        goals: 'リピーター率を上げる、口コミで新規客を増やす、季節メニューの訴求',
        messageStyle: '親しみやすい',
        sampleMessages: [
          '本日のおすすめは、朝獲れの鮮魚刺身盛り合わせです🐟 数量限定なのでお早めに！',
          '金曜日は週末限定の地酒飲み比べセットをご用意しています🍶 お仕事帰りにぜひ！'
        ],
        aiPrompt: '個人経営の居酒屋として、アットホームで親しみやすい雰囲気を大切にしながら、料理や季節のメニューを紹介してください。'
      },
      'チェーン店': {
        storeName: '〇〇居酒屋 △△店',
        priceRange: '1000-3000',
        atmosphere: '活気のある',
        targetCustomers: ['20代男性', '20代女性', '30代男性', '30代女性'],
        businessHours: '16:00-25:00（年中無休）',
        features: 'リーズナブルな価格で豊富なメニュー。飲み放題コースが人気。学生割引あり',
        goals: '新規客獲得、団体予約の増加、アプリ会員の拡大',
        messageStyle: 'カジュアル',
        sampleMessages: [
          '【期間限定】飲み放題付きコース2,980円〜！忘年会のご予約受付中です🍺',
          '学生証提示で10%OFF！お得な学割キャンペーン実施中📱'
        ],
        aiPrompt: 'チェーン居酒屋として、お得なキャンペーンやコース情報を明るく元気に発信してください。'
      }
    },
    'カフェ': {
      'コーヒー専門': {
        storeName: 'Coffee Shop 〇〇',
        priceRange: '1000-3000',
        atmosphere: '落ち着いた',
        targetCustomers: ['30代女性', '40代女性', '50代以上', 'ビジネス利用'],
        businessHours: '7:00-20:00（日曜定休）',
        features: '自家焙煎のスペシャルティコーヒー。バリスタが一杯ずつ丁寧に淹れる本格コーヒー',
        goals: 'コーヒーの魅力を伝える、常連客との関係構築、モーニングタイムの集客',
        messageStyle: '丁寧',
        sampleMessages: [
          '本日の焙煎豆は、エチオピア イルガチェフェ。フルーティーな酸味が特徴です☕',
          'モーニングセット（7:00-10:00）コーヒー＋クロワッサンで650円。朝の一杯をぜひ。'
        ],
        aiPrompt: 'コーヒー専門店として、豆の特徴や淹れ方のこだわりを丁寧に説明し、コーヒーの魅力を伝えてください。'
      }
    }
  },
  '小売業': {
    'アパレル': {
      'レディース': {
        storeName: 'レディースブティック 〇〇',
        priceRange: '3000-10000',
        atmosphere: 'モダン',
        targetCustomers: ['20代女性', '30代女性', '40代女性'],
        businessHours: '10:00-20:00',
        features: 'トレンドを押さえた幅広い年齢層向けのファッション。コーディネート提案が得意',
        goals: '新作情報の発信、コーディネート提案で購買促進、会員限定セールの告知',
        messageStyle: '親しみやすい',
        sampleMessages: [
          '新作ワンピース入荷しました👗 春らしい花柄デザインで、オフィスでもカジュアルでも使えます！',
          '本日限定！会員様は全品10%OFF✨ お気に入りのアイテムをお得にゲットしてください！'
        ],
        aiPrompt: 'レディースファッション店として、トレンドやコーディネート提案を親しみやすく発信してください。'
      }
    },
    '食品': {
      '生鮮食品': {
        storeName: '〇〇青果店',
        priceRange: '1000未満',
        atmosphere: '地域密着',
        targetCustomers: ['30代女性', '40代女性', '50代以上', 'ファミリー'],
        businessHours: '8:00-19:00（水曜定休）',
        features: '地元農家から直接仕入れる新鮮野菜。旬の野菜の調理法もアドバイス',
        goals: '旬の野菜の魅力発信、地産地消の推進、常連客との関係強化',
        messageStyle: '地域密着',
        sampleMessages: [
          '本日入荷！地元〇〇農園さんの朝採れトマト🍅 甘みが強くてサラダに最適です！',
          '今が旬の春キャベツ、柔らかくて甘みがあります。簡単レシピもお渡ししています📝'
        ],
        aiPrompt: '地域の青果店として、新鮮な野菜の情報や調理法を温かく親しみやすく発信してください。'
      }
    }
  },
  'サービス業': {
    '美容': {
      '美容院': {
        storeName: 'Hair Salon 〇〇',
        priceRange: '3000-10000',
        atmosphere: 'モダン',
        targetCustomers: ['20代女性', '30代女性', '40代女性', 'カップル'],
        businessHours: '10:00-20:00（月曜定休）',
        features: 'トレンドを取り入れたカット技術。カラーリングの種類が豊富。完全個室のプライベート空間',
        goals: '予約率向上、新メニューの周知、季節のヘアスタイル提案',
        messageStyle: '丁寧',
        sampleMessages: [
          '春の新生活に向けて、イメージチェンジはいかがですか？トレンドのボブスタイル特集中です💇‍♀️',
          '【平日限定】カット＋カラー＋トリートメントのセットが20%OFF！ご予約はお早めに📱'
        ],
        aiPrompt: '美容院として、ヘアスタイルのトレンドや季節に合わせた提案を丁寧に発信してください。'
      },
      'エステ': {
        storeName: 'エステサロン 〇〇',
        priceRange: '5000-10000',
        atmosphere: '高級',
        targetCustomers: ['30代女性', '40代女性', '50代以上'],
        businessHours: '10:00-21:00',
        features: '完全個室でリラックス。最新機器によるフェイシャル・ボディケア。経験豊富なエステティシャン',
        goals: '高級感のあるブランディング、リピート率向上、会員制度の充実',
        messageStyle: '高級感',
        sampleMessages: [
          '初夏に向けてのボディケアキャンペーン。痩身コース3回セットを特別価格でご提供しております✨',
          '月替わりの限定アロマオイルは「ローズ」。優雅な香りに包まれる至福の時間をお過ごしください🌹'
        ],
        aiPrompt: 'エステサロンとして、上品で高級感のある雰囲気を保ちながら、美容情報を発信してください。'
      }
    },
    '教育': {
      '学習塾': {
        storeName: '〇〇進学塾',
        priceRange: '10000以上',
        atmosphere: '落ち着いた',
        targetCustomers: ['ファミリー', '20代女性', '30代女性', '30代男性'],
        businessHours: '14:00-22:00（日曜定休）',
        features: '少人数制の個別指導。経験豊富な講師陣。定期テスト対策から受験対策まで幅広く対応',
        goals: '生徒募集、学習成果の共有、保護者との信頼関係構築',
        messageStyle: '丁寧',
        sampleMessages: [
          '定期テスト対策講座開講！2週間前から集中的に対策を行います。無料体験受付中です📚',
          '春期講習の受付を開始しました。新学年の準備を万全にして、良いスタートを切りましょう！'
        ],
        aiPrompt: '学習塾として、教育的な内容を保護者向けに信頼感のある丁寧な言葉で発信してください。'
      }
    }
  },
  '製造業': {
    '食品製造': {
      'パン製造': {
        storeName: 'ベーカリー 〇〇',
        priceRange: '1000未満',
        atmosphere: '温かい',
        targetCustomers: ['30代女性', '40代女性', 'ファミリー', '50代以上'],
        businessHours: '7:00-19:00（月曜定休）',
        features: '毎朝焼きたてのパン。国産小麦100%使用。季節限定パンが人気',
        goals: '焼きたて時間の告知、新商品の紹介、常連客への感謝',
        messageStyle: '地域密着',
        sampleMessages: [
          '本日の焼きたて情報🥖 クロワッサン8:00、食パン9:00、メロンパン10:00です！',
          '春限定！桜あんぱん登場🌸 ほんのり桜の香りが春を感じさせます。数量限定です！'
        ],
        aiPrompt: 'パン屋として、焼きたての時間や季節商品を温かく親しみやすい言葉で発信してください。'
      }
    }
  }
}

// ビジネスタイプから適切なテンプレートを取得する関数
export function getBusinessTemplate(
  category: string,
  subCategory: string,
  businessType: string
): BusinessTemplate | null {
  return businessTemplates[category]?.[subCategory]?.[businessType] || null
}

// デフォルトの空テンプレート
export const emptyTemplate: BusinessTemplate = {
  storeName: '',
  priceRange: '',
  atmosphere: '',
  targetCustomers: [],
  businessHours: '',
  features: '',
  goals: '',
  messageStyle: '',
  sampleMessages: [],
  aiPrompt: ''
}
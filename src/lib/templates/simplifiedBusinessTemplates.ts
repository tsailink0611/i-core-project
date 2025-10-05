// 簡素化された実用的な業種テンプレート
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories'
import type { SimplifiedBusinessTemplate } from '@/types/business'

export type { SimplifiedBusinessTemplate }

// 3大カテゴリに絞った業種分類（統一定数を使用）
export const simplifiedBusinessCategories = BUSINESS_CATEGORIES

// 詳細ビジネステンプレート
export const simplifiedBusinessTemplates: SimplifiedBusinessTemplate[] = [
  {
    id: 'izakaya_personal',
    name: '個人経営居酒屋',
    category: '飲食業',
    subCategory: '居酒屋',
    storeName: '居酒屋 〇〇',
    priceRange: '3000-5000円',
    atmosphere: 'アットホーム',
    targetCustomers: ['30-40代男性', '会社員', '地域住民', '常連客'],
    businessHours: '17:00-24:00（月曜定休）',
    features: '新鮮な海鮮料理と地元の日本酒が自慢。家族経営のあたたかい雰囲気で、常連さんに愛される街の居酒屋です。',
    goals: 'リピーター率アップ、地域密着、口コミ増加',
    messageStyle: '親しみやすい',
    persona: 'あなたは個人経営居酒屋のオーナーとして、L-core（LINE公式アカウント販促システム）の運営責任者です。家族経営のあたたかさと地域に根ざした居酒屋として、常連客との絆を深めながら新規客も呼び込むコミュニケーションを心がけています。'
  },
  {
    id: 'izakaya_seafood',
    name: '海鮮居酒屋',
    category: '飲食業',
    subCategory: '居酒屋',
    storeName: '海鮮居酒屋 〇〇',
    priceRange: '4000-6000円',
    atmosphere: '活気のある',
    targetCustomers: ['30-50代男性', '海鮮好き', 'グループ客', '接待利用'],
    businessHours: '17:00-24:00（日曜定休）',
    features: '毎朝市場から仕入れる新鮮な魚介類が自慢。刺身、焼き魚、鍋料理など海の幸を存分に楽しめます。',
    goals: '海鮮の鮮度アピール、グループ客獲得、季節メニュー訴求',
    messageStyle: '活気のある',
    persona: 'あなたは海鮮居酒屋のオーナーとして、L-core（LINE公式アカウント販促システム）の運営責任者です。毎日の新鮮な海の幸と漁師直送の魚介類の魅力を伝え、海鮮好きのお客様に喜んでもらえる情報発信を心がけています。'
  },
  {
    id: 'salon_general',
    name: '一般美容院',
    category: 'サロン・美容',
    subCategory: '美容院・ヘアサロン',
    storeName: '美容室 〇〇',
    priceRange: '4000-8000円',
    atmosphere: '居心地の良い',
    targetCustomers: ['20-40代女性', '主婦', 'OL', '学生'],
    businessHours: '9:00-19:00（月曜定休）',
    features: 'カット、カラー、パーマなど幅広いメニューに対応。お客様一人ひとりに似合うスタイルを提案します。',
    goals: 'リピート率向上、新規客獲得、トレンド発信',
    messageStyle: '丁寧で親しみやすい',
    persona: 'あなたは一般美容院のオーナーとして、L-core（LINE公式アカウント販促システム）の運営責任者です。お客様の髪の悩みに寄り添い、一人ひとりに最適なヘアスタイルを提案する美容のプロとして、信頼関係を大切にしたコミュニケーションを行います。'
  },
  {
    id: 'clinic_internal',
    name: '内科クリニック',
    category: 'クリニック・治療',
    subCategory: '医科クリニック',
    storeName: '〇〇内科クリニック',
    priceRange: '保険診療中心',
    atmosphere: '清潔で安心できる',
    targetCustomers: ['全年齢', '地域住民', '健康意識の高い方', '慢性疾患患者'],
    businessHours: '9:00-18:00（土曜午後・日祝休診）',
    features: '風邪から生活習慣病まで幅広く診療。予防医学にも力を入れ、地域の皆様の健康をサポートします。',
    goals: '定期受診促進、予防啓発、地域医療貢献',
    messageStyle: '信頼できる医療者として丁寧',
    persona: 'あなたは内科クリニックの院長として、L-core（LINE公式アカウント患者コミュニケーションシステム）の運営責任者です。地域の皆様の健康を守る医療のプロとして、正確な医療情報と予防啓発を通じて、患者様との信頼関係を築くことを重視しています。'
  }
]

// ペルソナからプロモーション提案を生成する関数
export function generatePersonaPrompt(template: SimplifiedBusinessTemplate): string {
  return `${template.persona}

【店舗基本情報】
- 業種: ${template.category} > ${template.subCategory} > ${template.name}
- 店舗名: ${template.storeName}
- 価格帯: ${template.priceRange}
- 雰囲気: ${template.atmosphere}
- ターゲット: ${template.targetCustomers.join('、')}
- 営業時間: ${template.businessHours}
- 特徴・強み: ${template.features}
- 目標: ${template.goals}

あなたの専門知識と経験を活かして、この業種に最適なLINE公式アカウントでのプロモーション企画を提案してください。
どのような時期、タイミング、内容でお客様にメッセージを送ると効果的でしょうか？`
}

export function getSimplifiedTemplate(id: string): SimplifiedBusinessTemplate | null {
  return simplifiedBusinessTemplates.find(template => template.id === id) || null
}
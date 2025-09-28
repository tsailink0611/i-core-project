// L-Core 統一型定義システム

// 基本ビジネステンプレート型（統一仕様）
export interface BusinessTemplate {
  id?: string
  storeName: string
  category: string
  subCategory: string
  businessType?: string
  priceRange: string
  atmosphere: string
  targetCustomers: string[]
  businessHours: string
  features: string
  goals: string
  messageStyle: string
  persona?: string // AI用ペルソナ設定
  sampleMessages?: string[] // サンプルメッセージ
  aiPrompt?: string // AI生成用プロンプト
}

// 簡素化ビジネステンプレート型
export interface SimplifiedBusinessTemplate extends BusinessTemplate {
  id: string
  name: string
  persona: string // 必須
}

// プロモーションテンプレート型
export interface PromotionTemplate {
  id: string
  title: string
  description: string
  targetSeason: string[]
  targetCustomers: string[]
  businessTypes: string[]
  urgency: 'low' | 'medium' | 'high'
  category: string
}

// メッセージスケジュール型
export interface MessageSchedule {
  id?: string
  title: string
  timing: string
  frequency: string
  purpose: string
  message: string
  businessTemplate?: BusinessTemplate
}

// API レスポンス型
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  suggestions?: string[]
  schedules?: MessageSchedule[]
}

// フォーム状態管理型
export interface FormState {
  isLoading: boolean
  isSubmitted: boolean
  errors: Record<string, string>
}

// コンポーネントProps型
export interface BusinessFormProps {
  template?: BusinessTemplate
  onSubmit: (template: BusinessTemplate) => void
  onCancel?: () => void
  isLoading?: boolean
}

export interface PromotionFormProps {
  businessTemplate: BusinessTemplate
  onGenerate: (promotions: string[]) => void
  isLoading?: boolean
}

export interface ScheduleFormProps {
  businessTemplate: BusinessTemplate
  onGenerate: (schedules: MessageSchedule[]) => void
  isLoading?: boolean
}

// 業種分類型
export interface BusinessCategory {
  [key: string]: {
    [key: string]: string[]
  }
}
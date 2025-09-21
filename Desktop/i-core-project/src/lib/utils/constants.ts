// l-core システム定数定義

import type { PricingPlan } from '@/lib/types';

// システム定数
export const SYSTEM_CONSTANTS = {
  APP_NAME: 'l-core',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'AI駆動LINEマーケティング自動化プラットフォーム',

  // 制限値
  LIMITS: {
    MAX_ORGS_PER_USER: 5,
    MAX_STORES_PER_ORG: 50,
    MAX_USERS_PER_ORG: 1000,
    MAX_MESSAGE_LENGTH: 5000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_UPLOAD_FILES: 10,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24時間
  },

  // デフォルト値
  DEFAULTS: {
    TIMEZONE: 'Asia/Tokyo',
    LOCALE: 'ja-JP',
    CURRENCY: 'JPY',
    PAGE_SIZE: 20,
    THEME: 'light' as const,
  },

  // 正規表現パターン
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    SLUG: /^[a-z0-9-]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  },

  // Firebase Collection名
  COLLECTIONS: {
    ORGANIZATIONS: 'l-core-organizations',
    STORES: 'l-core-stores',
    USERS: 'l-core-users',
    MESSAGES: 'l-core-messages',
    CAMPAIGNS: 'l-core-campaigns',
    ANALYTICS: 'l-core-analytics',
    LLM_MODELS: 'l-core-llm-models',
    SYSTEM_CONFIG: 'l-core-system-config',
    AUDIT_LOGS: 'l-core-audit-logs',
    NOTIFICATIONS: 'l-core-notifications',
  }
} as const;

// 料金プラン定義
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'starter',
    displayName: 'スタータープラン',
    type: 'individual',
    pricing: {
      monthly: 9800,
      annual: 98000,
      setup: 120000,
    },
    limits: {
      stores: 1,
      users: 3,
      monthlyMessages: 1000,
      storage: 1, // GB
      apiCalls: 10000,
    },
    features: {
      aiGeneration: true,
      advancedAnalytics: false,
      customIntegrations: false,
      prioritySupport: false,
      whiteLabel: false,
      sla: false,
      existingIntegration: true,
    },
    metadata: {
      popular: false,
      description: '個人店舗・小規模事業者向け（既存Firebase/LINE活用）',
      highlights: [
        '基本的なメッセージ配信',
        'AI自動生成機能',
        '既存システム統合',
        'ベーシック分析'
      ],
    },
  },
  {
    id: 'business',
    name: 'business',
    displayName: 'ビジネスプラン',
    type: 'multi-store',
    pricing: {
      monthly: 29800,
      annual: 298000,
      setup: 300000,
    },
    limits: {
      stores: 5,
      users: 15,
      monthlyMessages: 10000,
      storage: 10, // GB
      apiCalls: 100000,
    },
    features: {
      aiGeneration: true,
      advancedAnalytics: true,
      customIntegrations: false,
      prioritySupport: false,
      whiteLabel: false,
      sla: false,
      existingIntegration: true,
    },
    metadata: {
      popular: true,
      description: '複数店舗・中小企業向け',
      highlights: [
        'スケジュール配信',
        '高度な分析機能',
        'セグメント管理',
        'A/Bテスト機能',
        '複数店舗管理'
      ],
    },
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'エンタープライズプラン',
    type: 'enterprise',
    pricing: {
      monthly: 98000,
      annual: 980000,
      setup: 500000,
    },
    limits: {
      stores: 50,
      users: 100,
      monthlyMessages: 100000,
      storage: 100, // GB
      apiCalls: 1000000,
    },
    features: {
      aiGeneration: true,
      advancedAnalytics: true,
      customIntegrations: true,
      prioritySupport: true,
      whiteLabel: false,
      sla: true,
      existingIntegration: true,
    },
    metadata: {
      popular: false,
      description: '大企業・エンタープライズ向け',
      highlights: [
        'API統合',
        '優先サポート',
        'SLA保証',
        'カスタム機能',
        '無制限ユーザー'
      ],
    },
  },
  {
    id: 'custom',
    name: 'custom',
    displayName: 'カスタムプラン',
    type: 'enterprise',
    pricing: {
      monthly: 0, // 要相談
      annual: 0,  // 要相談
      setup: 0,   // 要相談
    },
    limits: {
      stores: -1, // 無制限
      users: -1,  // 無制限
      monthlyMessages: -1, // 無制限
      storage: -1, // 無制限
      apiCalls: -1, // 無制限
    },
    features: {
      aiGeneration: true,
      advancedAnalytics: true,
      customIntegrations: true,
      prioritySupport: true,
      whiteLabel: true,
      sla: true,
      existingIntegration: true,
    },
    metadata: {
      popular: false,
      description: '特別要件・大規模組織向け',
      highlights: [
        'ホワイトラベル',
        'カスタム開発',
        '専任サポート',
        'オンプレミス対応',
        '無制限すべて'
      ],
    },
  },
];

// ユーザー権限定義
export const USER_PERMISSIONS = {
  OWNER: {
    name: 'オーナー',
    description: '全ての機能とデータへのアクセス',
    level: 100,
    permissions: ['*'],
  },
  ADMIN: {
    name: '管理者',
    description: 'ユーザー管理と設定の変更が可能',
    level: 80,
    permissions: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'stores.create', 'stores.read', 'stores.update', 'stores.delete',
      'messages.create', 'messages.read', 'messages.update', 'messages.delete',
      'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
      'analytics.read',
      'settings.read', 'settings.update',
    ],
  },
  MANAGER: {
    name: 'マネージャー',
    description: 'メッセージとキャンペーンの管理が可能',
    level: 60,
    permissions: [
      'users.read',
      'stores.read',
      'messages.create', 'messages.read', 'messages.update', 'messages.delete',
      'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
      'analytics.read',
      'settings.read',
    ],
  },
  STAFF: {
    name: 'スタッフ',
    description: 'メッセージの作成と送信が可能',
    level: 40,
    permissions: [
      'users.read',
      'stores.read',
      'messages.create', 'messages.read', 'messages.update',
      'campaigns.read',
      'analytics.read',
    ],
  },
  VIEWER: {
    name: '閲覧者',
    description: 'データの閲覧のみ可能',
    level: 20,
    permissions: [
      'users.read',
      'stores.read',
      'messages.read',
      'campaigns.read',
      'analytics.read',
    ],
  },
} as const;

// LINE API定数
export const LINE_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_QUICK_REPLY: 13,
  MAX_FLEX_CONTENTS: 12,
  MAX_CAROUSEL_COLUMNS: 10,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 200 * 1024 * 1024, // 200MB
  MAX_AUDIO_SIZE: 200 * 1024 * 1024, // 200MB

  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    FILE: 'file',
    LOCATION: 'location',
    STICKER: 'sticker',
    TEMPLATE: 'template',
    FLEX: 'flex',
    IMAGEMAP: 'imagemap',
  },

  EVENT_TYPES: {
    MESSAGE: 'message',
    FOLLOW: 'follow',
    UNFOLLOW: 'unfollow',
    JOIN: 'join',
    LEAVE: 'leave',
    MEMBER_JOINED: 'memberJoined',
    MEMBER_LEFT: 'memberLeft',
    POSTBACK: 'postback',
    BEACON: 'beacon',
    ACCOUNT_LINK: 'accountLink',
    THINGS: 'things',
  },
} as const;

// LLM関連定数
export const LLM_CONSTANTS = {
  PROVIDERS: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    GOOGLE: 'google',
    CUSTOM: 'custom',
  },

  MODEL_STATUS: {
    ACTIVE: 'active',
    BETA: 'beta',
    TESTING: 'testing',
    DEPRECATED: 'deprecated',
  },

  DEFAULT_SETTINGS: {
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1000,
    TOP_P: 1.0,
    FREQUENCY_PENALTY: 0.0,
    PRESENCE_PENALTY: 0.0,
  },

  CAPABILITIES: {
    CHAT: 'chat',
    COMPLETION: 'completion',
    ANALYSIS: 'analysis',
    CODE: 'code',
    IMAGE: 'image',
    AUDIO: 'audio',
  },
} as const;

// 分析・レポート定数
export const ANALYTICS_CONSTANTS = {
  METRICS: {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    CLICKED: 'clicked',
    REPLIED: 'replied',
    BLOCKED: 'blocked',
    FAILED: 'failed',
  },

  TIME_RANGES: {
    LAST_HOUR: 'last_hour',
    LAST_24_HOURS: 'last_24_hours',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
    LAST_90_DAYS: 'last_90_days',
    LAST_YEAR: 'last_year',
    CUSTOM: 'custom',
  },

  CHART_TYPES: {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    AREA: 'area',
    DONUT: 'donut',
  },
} as const;

// エラーコード
export const ERROR_CODES = {
  // 認証エラー
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // バリデーションエラー
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',

  // リソースエラー
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',

  // 外部APIエラー
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  EXTERNAL_API_RATE_LIMITED: 'EXTERNAL_API_RATE_LIMITED',
  EXTERNAL_API_QUOTA_EXCEEDED: 'EXTERNAL_API_QUOTA_EXCEEDED',

  // システムエラー
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// 通知テンプレート
export const NOTIFICATION_TEMPLATES = {
  WELCOME: {
    title: 'l-coreへようこそ！',
    body: 'アカウントの設定を完了し、AIマーケティングを始めましょう。',
    type: 'info',
  },

  PLAN_UPGRADED: {
    title: 'プランがアップグレードされました',
    body: '新しい機能をお楽しみください。',
    type: 'success',
  },

  QUOTA_WARNING: {
    title: '使用量制限に近づいています',
    body: 'プランのアップグレードをご検討ください。',
    type: 'warning',
  },

  SYSTEM_MAINTENANCE: {
    title: 'システムメンテナンス予定',
    body: 'サービス一時停止の可能性があります。',
    type: 'warning',
  },
} as const;
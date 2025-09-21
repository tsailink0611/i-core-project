// l-core マルチテナント・アカウント型定義

// アカウント種別
export type AccountType = 'individual' | 'multi-store' | 'enterprise' | 'department';

// ユーザー権限
export type UserRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';

// ユーザー状態
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// サブスクリプション状態
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

// 組織構造
export interface Organization {
  id: string;
  name: string;
  type: AccountType;
  parentOrgId?: string;          // 部署管理用
  slug: string;                  // URL用識別子
  description?: string;
  industry?: string;             // 業種
  settings: OrganizationSettings;
  billing: BillingInfo;
  integrations: IntegrationSettings;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
  };
}

// 組織設定
export interface OrganizationSettings {
  maxStores: number;
  maxUsers: number;
  allowedFeatures: string[];
  customDomain?: string;
  timezone: string;
  locale: string;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    customCss?: string;
  };
  security: {
    mfaRequired: boolean;
    sessionTimeout: number;
    ipWhitelist?: string[];
  };
}

// 請求情報
export interface BillingInfo {
  planId: string;
  monthlyPrice: number;
  yearlyPrice: number;
  billingCycle: 'monthly' | 'annual';
  subscriptionStatus: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  paymentMethod: PaymentMethod;
  billingAddress: Address;
  usageMetrics: UsageMetrics;
}

// 支払い方法
export interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'invoice';
  lastFour?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// 住所
export interface Address {
  country: string;
  postalCode: string;
  state?: string;
  city: string;
  line1: string;
  line2?: string;
}

// 使用量メトリクス
export interface UsageMetrics {
  messagesSent: number;
  aiGenerations: number;
  apiCalls: number;
  storageUsed: number; // bytes
  bandwidth: number;   // bytes
  resetDate: Date;
}

// 統合設定
export interface IntegrationSettings {
  firebase: {
    useExistingProject: boolean;
    projectId: string;
    customConfig?: Record<string, any>;
  };
  line: {
    useExistingChannel: boolean;
    channelId: string;
    customWebhook?: string;
  };
  llm: {
    preferredModels: string[];
    budgetLimit: number;
    customEndpoints?: Record<string, string>;
  };
}

// 店舗情報
export interface Store {
  id: string;
  name: string;
  orgId: string;
  slug: string;
  description?: string;
  industry?: string;
  location: {
    address: Address;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  settings: StoreSettings;
  lineConfig: StoreLineConfig;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isActive: boolean;
  };
}

// 店舗設定
export interface StoreSettings {
  timezone: string;
  businessHours: {
    [key: string]: { // 'monday', 'tuesday', etc.
      open: string;  // '09:00'
      close: string; // '18:00'
      closed: boolean;
    };
  };
  features: {
    autoResponse: boolean;
    aiGeneration: boolean;
    scheduledMessages: boolean;
    analytics: boolean;
  };
  customizations: {
    welcomeMessage?: string;
    autoResponseMessage?: string;
    theme?: string;
    customFields?: Record<string, any>;
  };
}

// 店舗LINE設定
export interface StoreLineConfig {
  useOrgDefault: boolean;
  channelId?: string;
  channelSecret?: string;
  channelAccessToken?: string;
  webhookUrl?: string;
  liffId?: string;
  features: {
    richMenu: boolean;
    flexMessage: boolean;
    liffApp: boolean;
  };
}

// ユーザー情報
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  orgId: string;
  storeIds: string[];            // アクセス可能店舗
  permissions: Permission[];
  profile: UserProfile;
  preferences: UserPreferences;
  lastLogin?: Date;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    invitedBy?: string;
  };
}

// ユーザープロフィール
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

// ユーザー設定
export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    categories: {
      system: boolean;
      marketing: boolean;
      billing: boolean;
      security: boolean;
    };
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    density: 'compact' | 'normal' | 'comfortable';
    sidebarCollapsed: boolean;
  };
}

// 権限
export interface Permission {
  resource: string;              // 'messages', 'analytics', 'settings'
  actions: string[];             // ['create', 'read', 'update', 'delete']
  conditions?: Record<string, any>; // 条件付きアクセス
}

// 料金プラン
export interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  type: AccountType;
  pricing: {
    monthly: number;
    annual: number;
    setup: number;
  };
  limits: {
    stores: number;
    users: number;
    monthlyMessages: number;
    storage: number;             // GB
    apiCalls: number;
  };
  features: {
    aiGeneration: boolean;
    advancedAnalytics: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
    whiteLabel: boolean;
    sla: boolean;
    existingIntegration: boolean;
  };
  metadata: {
    popular: boolean;
    description: string;
    highlights: string[];
  };
}

// システム設定
export interface SystemConfig {
  id: string;
  type: 'global' | 'org' | 'store';
  targetId?: string;             // orgId or storeId
  config: {
    features: {
      maintenanceMode: boolean;
      signupEnabled: boolean;
      trialEnabled: boolean;
      betaFeatures: string[];
    };
    limits: {
      maxOrgsPerUser: number;
      maxStoresPerOrg: number;
      maxUsersPerOrg: number;
      rateLimits: Record<string, number>;
    };
    security: {
      passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireNumbers: boolean;
        requireSymbols: boolean;
      };
      sessionSettings: {
        maxDuration: number;
        idleTimeout: number;
        multipleSessionsAllowed: boolean;
      };
    };
    integrations: {
      allowedProviders: string[];
      defaultSettings: Record<string, any>;
    };
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

// API応答形式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    };
  };
}

// ページネーション
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

// 監査ログ
export interface AuditLog {
  id: string;
  userId: string;
  orgId: string;
  storeId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  result: 'success' | 'failure' | 'error';
}

// エラー型
export interface LCoreError {
  code: string;
  message: string;
  type: 'validation' | 'permission' | 'not_found' | 'conflict' | 'internal' | 'external';
  details?: Record<string, any>;
  timestamp: Date;
}
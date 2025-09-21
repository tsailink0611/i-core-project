// 動的LLMモデル管理システム（最重要・将来拡張完全対応）

export interface LLMModel {
  id: string;                    // 内部識別子
  displayName: string;           // 表示名（自由設定）
  provider: 'openai' | 'anthropic' | 'google' | 'custom'; // プロバイダー
  apiEndpoint: string;           // APIエンドポイント
  modelName: string;             // 実際のモデル名
  apiKeyEnvVar: string;          // 環境変数名
  costPerToken: number;          // トークン単価
  maxTokens: number;             // 最大トークン数
  capabilities: string[];        // 対応機能
  status: 'active' | 'beta' | 'testing' | 'deprecated';
  addedDate: string;             // 追加日
  isDefault?: boolean;           // デフォルトモデル
  customConfig?: Record<string, any>; // カスタム設定
}

// 現在利用可能なモデル設定
export const LLM_MODELS: Record<string, LLMModel> = {
  'chatgpt-4-turbo': {
    id: 'chatgpt-4-turbo',
    displayName: 'ChatGPT-4 Turbo',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    modelName: 'gpt-4-turbo-preview',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    costPerToken: 0.00003,
    maxTokens: 4096,
    capabilities: ['chat', 'completion', 'analysis', 'code'],
    status: 'active',
    addedDate: '2025-09-21',
    isDefault: true
  },
  'chatgpt-3.5-turbo': {
    id: 'chatgpt-3.5-turbo',
    displayName: 'ChatGPT-3.5 Turbo',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    modelName: 'gpt-3.5-turbo',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    costPerToken: 0.000001,
    maxTokens: 4096,
    capabilities: ['chat', 'completion'],
    status: 'active',
    addedDate: '2025-09-21'
  }
  // 将来のモデルはここに動的追加
};

// モデル管理クラス
export class LLMModelManager {
  private models: Map<string, LLMModel> = new Map();

  constructor() {
    // 初期モデル読み込み
    Object.values(LLM_MODELS).forEach(model => {
      this.models.set(model.id, model);
    });
  }

  // モデル追加（動的）
  addModel(model: LLMModel): void {
    this.models.set(model.id, model);
  }

  // モデル取得
  getModel(id: string): LLMModel | undefined {
    return this.models.get(id);
  }

  // 全モデル取得
  getAllModels(): LLMModel[] {
    return Array.from(this.models.values());
  }

  // アクティブモデル取得
  getActiveModels(): LLMModel[] {
    return this.getAllModels().filter(model => model.status === 'active');
  }

  // デフォルトモデル取得
  getDefaultModel(): LLMModel | undefined {
    return this.getAllModels().find(model => model.isDefault);
  }

  // プロバイダー別モデル取得
  getModelsByProvider(provider: LLMModel['provider']): LLMModel[] {
    return this.getAllModels().filter(model => model.provider === provider);
  }

  // モデル削除
  removeModel(id: string): boolean {
    return this.models.delete(id);
  }

  // モデル更新
  updateModel(id: string, updates: Partial<LLMModel>): boolean {
    const model = this.models.get(id);
    if (!model) return false;

    const updatedModel = { ...model, ...updates };
    this.models.set(id, updatedModel);
    return true;
  }

  // API Key検証
  validateApiKey(model: LLMModel): boolean {
    const apiKey = process.env[model.apiKeyEnvVar];
    return Boolean(apiKey && apiKey.length > 10);
  }

  // 利用可能モデル取得（API Key有り）
  getAvailableModels(): LLMModel[] {
    return this.getActiveModels().filter(model => this.validateApiKey(model));
  }
}

// シングルトンインスタンス
export const llmModelManager = new LLMModelManager();

// LLM リクエスト設定
export interface LLMRequest {
  modelId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  options?: Record<string, any>;
}

// LLM レスポンス
export interface LLMResponse {
  modelId: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  metadata: {
    requestId: string;
    timestamp: Date;
    model: string;
    provider: string;
  };
}

// コスト計算機能
export const calculateCost = (tokens: number, model: LLMModel): number => {
  return tokens * model.costPerToken;
};

// モデル選択ヘルパー
export const selectBestModel = (
  requirements: {
    capabilities?: string[];
    maxCost?: number;
    provider?: string;
  }
): LLMModel | null => {
  const availableModels = llmModelManager.getAvailableModels();

  let candidates = availableModels;

  // 機能フィルター
  if (requirements.capabilities) {
    candidates = candidates.filter(model =>
      requirements.capabilities!.every(cap => model.capabilities.includes(cap))
    );
  }

  // プロバイダーフィルター
  if (requirements.provider) {
    candidates = candidates.filter(model => model.provider === requirements.provider);
  }

  // コストフィルター
  if (requirements.maxCost) {
    candidates = candidates.filter(model => model.costPerToken <= requirements.maxCost!);
  }

  // 最もコストパフォーマンスの良いモデルを選択
  if (candidates.length === 0) return null;

  return candidates.reduce((best, current) =>
    current.costPerToken < best.costPerToken ? current : best
  );
};
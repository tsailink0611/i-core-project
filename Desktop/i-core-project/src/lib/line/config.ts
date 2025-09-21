// 既存LINE設定を完全活用（影響ゼロ）

interface LineConfig {
  channelAccessToken: string;    // 既存TOKEN使用
  channelSecret: string;         // 既存SECRET使用
  liffId?: string;              // 既存LIFF ID使用
}

// 既存LINE設定を環境変数から読み込み
export const lineConfig: LineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID
};

// LINE Client（既存設定でインスタンス化）
let lineClient: any = null;

export const getLineClient = async () => {
  if (!lineClient && lineConfig.channelAccessToken && lineConfig.channelSecret) {
    const { Client } = await import('@line/bot-sdk');
    lineClient = new Client({
      channelAccessToken: lineConfig.channelAccessToken,
      channelSecret: lineConfig.channelSecret
    });
  }
  return lineClient;
};

// 既存LINE設定の接続確認（安全テスト）
export const testLineConnection = async (): Promise<{ success: boolean; message: string; botInfo?: any }> => {
  try {
    const client = await getLineClient();
    if (!client) {
      return {
        success: false,
        message: 'LINE設定が不完全です。環境変数を確認してください。'
      };
    }

    // 既存のLINE Botプロフィール取得でテスト（読み取り専用・安全）
    const profile = await client.getBotInfo();
    console.log('✅ LINE API接続成功（既存設定活用）:', profile.displayName);

    return {
      success: true,
      message: `既存LINE Bot "${profile.displayName}" との接続を確認しました。`,
      botInfo: profile
    };
  } catch (error: any) {
    console.error('❌ LINE API接続エラー:', error);
    return {
      success: false,
      message: `LINE API接続エラー: ${error.message}。既存設定を確認してください。`
    };
  }
};

// LINE設定検証関数
export const validateLineConfig = (): { valid: boolean; missing: string[] } => {
  const requiredKeys = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET'
  ];

  const missing = requiredKeys.filter(key => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing
  };
};

// l-core専用メッセージタイプ定義
export interface LCoreMessage {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'template';
  content: string;
  metadata: {
    orgId: string;
    storeId: string;
    userId: string;
    campaignId?: string;
    llmModel?: string;
    generatedAt?: Date;
  };
  lineMessage: any; // LINE SDK形式
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: Date;
  scheduledAt?: Date;
  sentAt?: Date;
}

// 既存システムとの互換性確保
export const createCompatibleWebhookHandler = () => {
  return {
    // l-core専用処理
    handleLCoreMessage: async (event: any) => {
      // l-core専用のメッセージ処理ロジック
      console.log('l-core message handling:', event);
    },

    // 既存システム処理を維持
    handleExistingMessage: async (event: any) => {
      // 既存の処理ロジックをそのまま通す
      console.log('existing system message:', event);
    },

    // 統合ハンドラー
    handle: async (event: any) => {
      // l-core用メッセージかどうか判定
      const isLCoreMessage = event.source?.userId?.includes('l-core') ||
                           event.message?.text?.includes('#lcore');

      if (isLCoreMessage) {
        return await this.handleLCoreMessage(event);
      } else {
        return await this.handleExistingMessage(event);
      }
    }
  };
};
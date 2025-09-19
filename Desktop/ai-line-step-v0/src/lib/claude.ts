import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse, ShopConfig } from '@/types';

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function generateProposals(
  request: string,
  shop: { industry: string },
  config: ShopConfig
): Promise<ClaudeResponse> {
  const prompt = `
あなたは${shop.industry}専門のLINE配信アドバイザーです。

役割：
- 店舗の要望を聞いて、3つの配信案を提案
- 各案は異なるアプローチ（王道/挑戦/限定感）
- 簡潔で実践的な内容

制約：
- 各提案は200文字以内
- 絵文字は適度に使用
- ${config.ngWords.join(', ')}は絶対に使用禁止
- 配信時間は営業時間（${config.businessHours}）を考慮
- ターゲット：${config.targetAudience}

要望：${request}

出力形式：
必ず以下のJSON形式で返答
{
  "proposals": [
    {
      "type": "王道",
      "title": "タイトル",
      "content": "本文",
      "timing": "推奨配信時間",
      "reason": "効果的な理由"
    },
    {
      "type": "挑戦",
      "title": "タイトル",
      "content": "本文",
      "timing": "推奨配信時間",
      "reason": "効果的な理由"
    },
    {
      "type": "限定感",
      "title": "タイトル",
      "content": "本文",
      "timing": "推奨配信時間",
      "reason": "効果的な理由"
    }
  ]
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Claude API Error:', error);
    // フォールバック応答
    return {
      proposals: [
        {
          type: '王道',
          title: 'お得なキャンペーン',
          content: 'いつもご利用ありがとうございます！期間限定のお得なキャンペーンをご用意いたしました。',
          timing: '18:00頃',
          reason: '帰宅時間に合わせた配信'
        },
        {
          type: '挑戦',
          title: '新商品のご紹介',
          content: '新しい商品が入荷しました！ぜひお試しください。',
          timing: '12:00頃',
          reason: 'ランチタイムの需要喚起'
        },
        {
          type: '限定感',
          title: '本日限定特典',
          content: '本日のみの特別サービスをご用意しております。お見逃しなく！',
          timing: '10:00頃',
          reason: '早めの告知で来店促進'
        }
      ]
    };
  }
}
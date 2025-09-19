import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getClientIP, sanitizeLogData } from '@/lib/security';
import { validateLineMessage } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // 署名検証
    if (!signature) {
      console.warn('LINE webhook: Missing signature', { ip: clientIP });
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // LINEシグネチャ検証
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    if (!channelSecret) {
      console.error('LINE webhook: Missing channel secret');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const hash = crypto
      .createHmac('sha256', channelSecret)
      .update(body)
      .digest('base64');

    if (signature !== hash) {
      console.warn('LINE webhook: Invalid signature', {
        ip: clientIP,
        receivedSignature: signature.substring(0, 10) + '...'
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // イベント処理
    const webhookData = JSON.parse(body);
    const events = webhookData.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const messageText = event.message.text;
        const userId = event.source.userId;

        // メッセージの検証
        const validation = validateLineMessage(messageText);
        if (!validation.isValid) {
          console.warn('LINE webhook: Invalid message', {
            userId: userId ? userId.substring(0, 8) + '...' : 'unknown',
            errors: validation.errors
          });
          continue;
        }

        // ログ記録（機密情報を除外）
        console.log('LINE message received:', {
          userId: userId ? userId.substring(0, 8) + '...' : 'unknown',
          messageLength: messageText.length,
          timestamp: new Date().toISOString()
        });

        // 自動返信やトリガー処理をここで実装
        // 例: 特定のキーワードで自動応答
        if (messageText.includes('問い合わせ')) {
          // カスタマーサポートに通知
          console.log('Customer support notification triggered');
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log('LINE webhook processed:', {
      eventsCount: events.length,
      duration: `${duration}ms`,
      ip: clientIP
    });

    return NextResponse.json({ status: 'ok' }, {
      headers: {
        'X-Response-Time': `${duration}ms`
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('LINE webhook error:', {
      error: sanitizeLogData(error),
      ip: clientIP,
      duration: `${duration}ms`
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
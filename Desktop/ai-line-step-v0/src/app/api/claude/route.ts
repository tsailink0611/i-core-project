import { NextRequest, NextResponse } from 'next/server';
import { generateProposals } from '@/lib/claude';
import { validateLineMessage, sanitizeInput } from '@/lib/validation';
import { getClientIP, sanitizeLogData } from '@/lib/security';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    // リクエストボディの解析
    const body = await request.json();
    const { request: userRequest, shop, config } = body;

    // 入力検証
    if (!userRequest || !shop || !config) {
      console.warn('Claude API: Missing parameters', {
        ip: clientIP,
        hasRequest: !!userRequest,
        hasShop: !!shop,
        hasConfig: !!config
      });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // リクエスト内容のサニタイズ
    const sanitizedRequest = sanitizeInput(userRequest);

    // Claude API呼び出し
    const response = await generateProposals(sanitizedRequest, shop, config);

    // レスポンス時間ログ
    const duration = Date.now() - startTime;
    console.log('Claude API success:', {
      ip: clientIP,
      duration: `${duration}ms`,
      proposalsCount: response.proposals?.length || 0
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Response-Time': `${duration}ms`
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Claude API route error:', {
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
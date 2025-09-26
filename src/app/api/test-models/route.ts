import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    })

    // 利用可能なモデルを取得
    const models = await openai.models.list()

    // GPT関連のモデルのみフィルタ
    const gptModels = models.data
      .filter(model => model.id.includes('gpt'))
      .map(model => ({
        id: model.id,
        created: model.created,
        owned_by: model.owned_by
      }))
      .sort((a, b) => a.id.localeCompare(b.id))

    return NextResponse.json({
      availableGptModels: gptModels,
      total: gptModels.length
    })
  } catch (error) {
    console.error('Model list error:', error)
    return NextResponse.json(
      { error: 'モデルリストの取得に失敗しました', details: error },
      { status: 500 }
    )
  }
}
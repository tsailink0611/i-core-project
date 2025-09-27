// ModelRouter: gpt-5-mini エイリアスシステム
// gpt-5-mini を直接使用（2025年9月時点で安定モデル）

import OpenAI from 'openai'

export const PINNED_MODEL = 'gpt-5-mini'
const FALLBACKS = ['gpt-4o-mini', 'gpt-4o-mini-2024-07-18', 'gpt-4o', 'gpt-4-turbo'] as const

let cached: string | null = null

export async function resolveModel(openai: OpenAI): Promise<string> {
  if (cached) {
    console.log(`Requested model: ${PINNED_MODEL}`)
    console.log(`Resolved: ${cached}`)
    return cached
  }

  try {
    console.log(`Probing model: ${PINNED_MODEL}`)
    // 実在チェック（軽量プローブ）
    await openai.chat.completions.create({
      model: PINNED_MODEL,
      messages: [{ role: 'user', content: 'ping' }],
      max_completion_tokens: 10,
    })

    cached = PINNED_MODEL
    console.log(`✅ Model ${PINNED_MODEL} is available`)
    return cached

  } catch (error) {
    console.warn(`❌ Model ${PINNED_MODEL} not available:`, error)

    // 非実在時はフォールバック採用
    for (const model of FALLBACKS) {
      try {
        console.log(`Probing fallback model: ${model}`)
        await openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          max_completion_tokens: 10,
        })

        cached = model
        console.log(`✅ Fallback model ${model} is available`)
        console.log(`Requested model: ${PINNED_MODEL}`)
        console.log(`Resolved: ${cached}`)
        return cached

      } catch {
        console.warn(`❌ Fallback model ${model} not available`)
        continue
      }
    }

    throw new Error(`No available model for alias ${PINNED_MODEL}`)
  }
}

export function getDisplayModel(): string {
  return 'gpt-5-mini'
}
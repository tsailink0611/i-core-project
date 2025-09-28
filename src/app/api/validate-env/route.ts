import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY

  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyType: typeof apiKey,
    keyLength: apiKey?.length || 0,
    keyPrefix: apiKey?.substring(0, 7) || 'N/A',
    isValidFormat: apiKey?.startsWith('sk-') || false,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('API')),
    timestamp: new Date().toISOString()
  })
}
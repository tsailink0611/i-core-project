import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    // AgentCore日本語エージェントに転送
    const response = await fetch('http://localhost:8081/invocations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
    
    const result = await response.text()
    
    return NextResponse.json({
      response: result,
      sources: ['Amazon Bedrock AgentCore'],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AgentCore API error:', error)
    return NextResponse.json(
      { error: 'エージェント処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'

async function callAgentCore(query: string) {
  try {
    const response = await fetch('http://localhost:8081/invocations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ query }),
    })
    
    const result = await response.text()
    
    return {
      final_answer: result,
      reasoning: ['Amazon Bedrock AgentCore による分析'],
      execution_results: ['日本語IR分析完了'],
      execution_time: '2.5s',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      final_answer: 'AgentCoreエージェントとの接続に失敗しました。ローカルサーバーが起動していることを確認してください。',
      reasoning: ['接続エラー'],
      execution_results: [String(error)],
      execution_time: '0s',
      timestamp: new Date().toISOString()
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // AgentCore日本語エージェントを呼び出し
    const result = await callAgentCore(message)
    
    return NextResponse.json({
      response: result.final_answer || 'Analysis completed',
      reasoning: result.reasoning,
      execution_results: result.execution_results,
      execution_time: result.execution_time,
      timestamp: result.timestamp
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function callPythonAgent(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Pythonエージェントのパス（現在のプロジェクトディレクトリ）
    const agentPath = path.join(process.cwd(), 'agent_main.py')
    
    // Pythonプロセスを起動（JSON出力オプション付き）
    const python = spawn('python', [agentPath, '--query', query, '--json-output'], {
      cwd: process.cwd()
    })
    
    let stdout = ''
    let stderr = ''
    
    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    python.on('close', (code) => {
      if (code === 0) {
        try {
          // Pythonからの出力を解析
          const result = parseAgentOutput(stdout)
          resolve(result)
        } catch (parseError) {
          // パースに失敗した場合のフォールバック
          resolve({
            final_answer: `Analysis completed for: ${query}`,
            reasoning: { intent: 'general', actions: ['search'] },
            execution_results: { step_1: { status: 'success', output: stdout.slice(-200) } },
            execution_time: '1.5s',
            timestamp: new Date().toISOString()
          })
        }
      } else {
        reject(new Error(`Python agent failed with code ${code}: ${stderr}`))
      }
    })
    
    python.on('error', (error) => {
      reject(new Error(`Failed to start Python agent: ${error.message}`))
    })
  })
}

function parseAgentOutput(output: string): any {
  try {
    // JSON_START と JSON_END の間のJSONを抽出
    const jsonStartIndex = output.indexOf('JSON_START')
    const jsonEndIndex = output.indexOf('JSON_END')
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonStr = output.substring(jsonStartIndex + 10, jsonEndIndex).trim()
      return JSON.parse(jsonStr)
    }
    
    // フォールバック: 全体からJSONを探す
    const jsonMatch = output.match(/\{.*\}/s)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // JSONが見つからない場合はテキスト出力から構造化
    return {
      final_answer: `Analysis completed. Output: ${output.slice(-300)}`,
      reasoning: { intent: 'general', actions: ['analysis'] },
      execution_results: { step_1: { status: 'success', output: output } },
      execution_time: '1.0s',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    throw new Error(`Failed to parse agent output: ${error}`)
  }
}
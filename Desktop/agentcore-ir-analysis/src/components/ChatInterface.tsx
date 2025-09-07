'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, UserIcon, CpuChipIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  thinking?: string[]
  sources?: string[]
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'こんにちは！IR分析エージェントです。企業の財務情報や業績について何でもお聞きください。例えば「トヨタの売上について分析してください」のような質問ができます。',
      role: 'assistant',
      timestamp: new Date(),
      sources: ['システム初期化']
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // エージェント分析をシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `「${userMessage.content}」について分析しました。\n\n**分析結果:**\n- 意図分析: financial_analysis\n- 検索実行: Vector検索で関連文書を発見\n- コード実行: 財務計算を実行\n- 結論: 詳細な分析結果をお示しします\n\n実際のAgentCoreエージェントと連携すると、より詳細な分析が可能になります。`,
        role: 'assistant',
        timestamp: new Date(),
        thinking: [
          '1. 質問を解析中...',
          '2. Vector検索実行中...',
          '3. 財務データ計算中...',
          '4. 結果統合中...'
        ],
        sources: ['トヨタIR資料.pdf', 'Vector検索結果', 'AgentCore計算']
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('分析エラー:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: '申し訳ございません。分析中にエラーが発生しました。もう一度お試しください。',
        role: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestedQuestions = [
    'トヨタの売上について分析してください',
    '三菱UFJの財務状況を調べてください',
    '武田薬品の研究開発費の推移を分析してください',
    '企業間の業績を比較してください'
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-700 text-white'
                }`}>
                  {message.role === 'user' ? (
                    <UserIcon className="w-5 h-5" />
                  ) : (
                    <CpuChipIcon className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {/* Thinking Process */}
                  {message.thinking && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-xs text-gray-600 mb-2">思考プロセス:</div>
                      <div className="space-y-1">
                        {message.thinking.map((thought, index) => (
                          <div key={index} className="text-xs text-gray-500 flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            {thought}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {message.sources && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-xs text-gray-600 mb-2">参照元:</div>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString('ja-JP')}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">分析中...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 mb-3">質問例:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-full hover:bg-primary-50 hover:border-primary-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="IR分析について質問してください..."
              disabled={isLoading}
              rows={1}
              className="block w-full resize-none border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
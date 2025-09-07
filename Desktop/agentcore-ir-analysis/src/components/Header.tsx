'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
      >
        <span className="sr-only">メニューを開く</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      
      <div className="flex-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 ml-4 md:ml-0">
          Agentic Document Analysis
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Powered by Amazon Bedrock AgentCore
          </div>
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
        </div>
      </div>
    </header>
  )
}
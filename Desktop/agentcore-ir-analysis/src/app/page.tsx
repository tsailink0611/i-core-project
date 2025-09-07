'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Chat Interface */}
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>
    </div>
  )
}
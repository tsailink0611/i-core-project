'use client'

import { Suspense, ReactNode } from 'react'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export default function LazyWrapper({ children, fallback, className }: LazyWrapperProps) {
  const defaultFallback = (
    <div className={`animate-pulse bg-gray-200 rounded ${className || 'h-32'}`}>
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}
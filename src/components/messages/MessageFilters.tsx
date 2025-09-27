'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface FilterTab {
  key: string
  label: string
  count?: number
}

interface MessageFiltersProps {
  tabs: FilterTab[]
  selectedTab: string
  searchTerm: string
  onTabChange: (tab: string) => void
  onSearchChange: (term: string) => void
  onFilterClick?: () => void
  showCount?: boolean
}

const defaultTabs: FilterTab[] = [
  { key: 'all', label: '全て' },
  { key: 'sent', label: '送信済み' },
  { key: 'scheduled', label: 'スケジュール' },
  { key: 'draft', label: '下書き' }
]

export function MessageFilters({
  tabs = defaultTabs,
  selectedTab,
  searchTerm,
  onTabChange,
  onSearchChange,
  onFilterClick,
  showCount = false
}: MessageFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* タブ */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  selectedTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
                {showCount && tab.count !== undefined && (
                  <span className="ml-2 text-xs opacity-75">
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 検索・フィルター */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="メッセージを検索..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {onFilterClick && (
              <Button
                variant="outline"
                onClick={onFilterClick}
              >
                フィルター
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
'use client'

import { memo } from 'react'
import Link from 'next/link'

interface TemplateHeaderProps {
  selectedCategory: string
  selectedSubCategory: string
  selectedBusinessType: string
  onResetSelection: () => void
  onCategoryReset: () => void
  onSubCategoryReset: () => void
}

const TemplateHeader = memo(function TemplateHeader({
  selectedCategory,
  selectedSubCategory,
  selectedBusinessType,
  onResetSelection,
  onCategoryReset,
  onSubCategoryReset
}: TemplateHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              l-core
            </Link>
            <nav className="ml-8 flex space-x-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                概要
              </Link>
              <Link href="/dashboard/messages" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                メッセージ
              </Link>
              <Link href="/dashboard/templates" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                テンプレート
              </Link>
              <Link href="/dashboard/analytics" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                分析
              </Link>
              <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                設定
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={onResetSelection}
            className="hover:text-blue-600"
          >
            業種選択
          </button>
          {selectedCategory && (
            <>
              <span>{'>'}</span>
              <button
                onClick={onCategoryReset}
                className="hover:text-blue-600"
              >
                {selectedCategory}
              </button>
            </>
          )}
          {selectedSubCategory && (
            <>
              <span>{'>'}</span>
              <button
                onClick={onSubCategoryReset}
                className="hover:text-blue-600"
              >
                {selectedSubCategory}
              </button>
            </>
          )}
          {selectedBusinessType && (
            <>
              <span>{'>'}</span>
              <span className="text-blue-600 font-medium">{selectedBusinessType}</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
})

export default TemplateHeader
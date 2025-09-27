'use client'

import { memo } from 'react'
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories'

interface CategorySelectorProps {
  onCategorySelect: (category: string) => void
}

const CategorySelector = memo(function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(BUSINESS_CATEGORIES).map(([category, subcategories]) => (
        <button
          key={category}
          onClick={() => onCategorySelect(category)}
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
        >
          <div className="text-lg font-semibold text-gray-900 mb-2">{category}</div>
          <div className="text-sm text-gray-600">
            {Object.keys(subcategories).length}種類の業態
          </div>
        </button>
      ))}
    </div>
  )
})

export default CategorySelector
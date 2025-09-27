'use client'

import { memo } from 'react'
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories'

interface SubCategorySelectorProps {
  selectedCategory: string
  onSubCategorySelect: (subCategory: string) => void
}

const SubCategorySelector = memo(function SubCategorySelector({
  selectedCategory,
  onSubCategorySelect
}: SubCategorySelectorProps) {
  const subcategories = BUSINESS_CATEGORIES[selectedCategory]

  if (!subcategories) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(subcategories).map(([subCategory, businessTypes]) => (
        <button
          key={subCategory}
          onClick={() => onSubCategorySelect(subCategory)}
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
        >
          <div className="text-lg font-semibold text-gray-900 mb-2">{subCategory}</div>
          <div className="text-sm text-gray-600">
            {businessTypes.length}つのタイプから選択
          </div>
        </button>
      ))}
    </div>
  )
})

export default SubCategorySelector
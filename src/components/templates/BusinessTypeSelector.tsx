'use client'

import { memo } from 'react'
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories'

interface BusinessTypeSelectorProps {
  selectedCategory: string
  selectedSubCategory: string
  onBusinessTypeSelect: (businessType: string) => void
}

const BusinessTypeSelector = memo(function BusinessTypeSelector({
  selectedCategory,
  selectedSubCategory,
  onBusinessTypeSelect
}: BusinessTypeSelectorProps) {
  const businessTypes = BUSINESS_CATEGORIES[selectedCategory]?.[selectedSubCategory]

  if (!businessTypes) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {businessTypes.map((businessType: string) => (
        <button
          key={businessType}
          onClick={() => onBusinessTypeSelect(businessType)}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
        >
          <div className="text-base font-medium text-gray-900">{businessType}</div>
        </button>
      ))}
    </div>
  )
})

export default BusinessTypeSelector
'use client'

import { memo, useMemo } from 'react'
import type { BusinessPromotions, PromotionTemplate } from '@/lib/templates/promotionTemplates'

interface PromotionSelectorProps {
  availablePromotions: BusinessPromotions
  selectedPromotion: PromotionTemplate | null
  onPromotionSelect: (promotion: PromotionTemplate) => void
}

const PromotionSelector = memo(function PromotionSelector({
  availablePromotions,
  selectedPromotion,
  onPromotionSelect
}: PromotionSelectorProps) {
  const combinedPromotions = useMemo(() => [
    ...availablePromotions.weather,
    ...availablePromotions.special
  ], [availablePromotions.weather, availablePromotions.special])

  const isSelected = (promo: PromotionTemplate) => selectedPromotion?.title === promo.title

  const buttonClass = (promo: PromotionTemplate) =>
    `p-3 text-left rounded-lg border ${
      isSelected(promo)
        ? 'border-blue-500 bg-blue-100'
        : 'border-gray-200 bg-white hover:border-blue-300'
    }`

  return (
    <div className="mt-6 p-6 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📢 プロモーション企画選択 (半自動テンプレート)
      </h3>
      <div className="space-y-4">
        {/* Regular Promotions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            定期プロモーション
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePromotions.regular.map((promo, index) => (
              <button
                key={`regular-${index}`}
                onClick={() => onPromotionSelect(promo)}
                className={buttonClass(promo)}
              >
                <div className="font-medium text-gray-900">{promo.title}</div>
                <div className="text-sm text-gray-600 mt-1">{promo.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ターゲット: {promo.target.join('、')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seasonal Promotions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            季節・イベント企画
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePromotions.seasonal.map((promo, index) => (
              <button
                key={`seasonal-${index}`}
                onClick={() => onPromotionSelect(promo)}
                className={buttonClass(promo)}
              >
                <div className="font-medium text-gray-900">{promo.title}</div>
                <div className="text-sm text-gray-600 mt-1">{promo.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  期待効果: {promo.expectedEffect}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Weather & Special Promotions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            天候連動・特別企画
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {combinedPromotions.map((promo, index) => (
              <button
                key={`combined-${index}`}
                onClick={() => onPromotionSelect(promo)}
                className={buttonClass(promo)}
              >
                <div className="font-medium text-gray-900">{promo.title}</div>
                <div className="text-sm text-gray-600 mt-1">{promo.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  実施条件: {promo.trigger}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Promotion Details */}
        {selectedPromotion && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">選択中の企画</h4>
            <div className="text-sm space-y-1">
              <div><strong>企画名:</strong> {selectedPromotion.title}</div>
              <div><strong>内容:</strong> {selectedPromotion.description}</div>
              <div><strong>ターゲット:</strong> {selectedPromotion.target.join('、')}</div>
              <div><strong>期待効果:</strong> {selectedPromotion.expectedEffect}</div>
              <div className="mt-2">
                <strong>参考メッセージ例:</strong>
                <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                  {selectedPromotion.messageExample}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          💡 企画を選択するとAIがその内容に基づいてメッセージを生成します。選択しない場合は一般的なプロモーションメッセージを生成します。
        </div>
      </div>
    </div>
  )
})

export default PromotionSelector
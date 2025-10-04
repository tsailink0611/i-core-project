'use client'

import { useState } from 'react'
import Link from 'next/link'

// LINE Official Account Pricing Plans
const PRICING_PLANS = {
  free: {
    name: 'フリープラン',
    monthlyFee: 0,
    messageLimit: 200,
    extraMessageCost: null,
    features: ['月200通まで無料', '基本機能利用可能', '個人・小規模店舗向け']
  },
  light: {
    name: 'ライトプラン',
    monthlyFee: 5000,
    messageLimit: 5000,
    extraMessageCost: null,
    features: ['月5,000通まで', '追加費用なし', '中規模店舗向け', 'セグメント配信']
  },
  standard: {
    name: 'スタンダードプラン',
    monthlyFee: 15000,
    messageLimit: 30000,
    extraMessageCost: 3,
    features: ['月30,000通まで', '超過分は3円/通', '大規模店舗向け', '詳細分析機能']
  }
}

// Mock usage data
const mockUsageData = {
  currentPlan: 'light',
  currentMonth: {
    year: 2025,
    month: 10,
    messagesSent: 3245,
    messagesRemaining: 1755,
    estimatedCost: 5000,
    daysInMonth: 31,
    currentDay: 4
  },
  dailyUsage: [
    { date: '10/01', count: 120 },
    { date: '10/02', count: 180 },
    { date: '10/03', count: 95 },
    { date: '10/04', count: 150 }
  ],
  projectedUsage: {
    estimatedTotal: 4800,
    willExceedLimit: false,
    projectedCost: 5000
  }
}

const PlanCard = ({
  planKey,
  plan,
  isCurrent
}: {
  planKey: string
  plan: {
    name: string
    monthlyFee: number
    messageLimit: number
    extraMessageCost: number | null
    features: string[]
  }
  isCurrent: boolean
}) => {
  return (
    <div className={`relative p-6 rounded-lg border-2 ${
      isCurrent
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 bg-white'
    }`}>
      {isCurrent && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg rounded-tr-lg">
          現在のプラン
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">
          ¥{plan.monthlyFee.toLocaleString()}
          <span className="text-lg font-normal text-gray-600">/月</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          月{plan.messageLimit.toLocaleString()}通まで
        </div>
        {plan.extraMessageCost && (
          <div className="text-xs text-gray-500 mt-1">
            超過分: ¥{plan.extraMessageCost}/通
          </div>
        )}
      </div>

      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-700">
            <span className="mr-2">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {!isCurrent && (
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
          プラン変更
        </button>
      )}
    </div>
  )
}

const UsageProgressBar = ({
  used,
  total,
  showPercentage = true
}: {
  used: number
  total: number
  showPercentage?: boolean
}) => {
  const percentage = (used / total) * 100
  const isWarning = percentage >= 80
  const isDanger = percentage >= 90

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">使用状況</span>
        {showPercentage && (
          <span className={`font-medium ${
            isDanger ? 'text-red-600' :
            isWarning ? 'text-yellow-600' :
            'text-gray-900'
          }`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`h-4 rounded-full transition-all ${
            isDanger ? 'bg-red-600' :
            isWarning ? 'bg-yellow-500' :
            'bg-green-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{used.toLocaleString()}通 送信済み</span>
        <span>残り {(total - used).toLocaleString()}通</span>
      </div>
    </div>
  )
}

export default function CostManagementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const currentPlanData = PRICING_PLANS[mockUsageData.currentPlan as keyof typeof PRICING_PLANS]
  const usagePercentage = (mockUsageData.currentMonth.messagesSent / currentPlanData.messageLimit) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <Link href="/dashboard/templates" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  テンプレート
                </Link>
                <Link href="/dashboard/analytics" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  分析
                </Link>
                <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  コスト管理
                </span>
                <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  設定
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="current">今月</option>
                <option value="last">先月</option>
                <option value="3months">過去3ヶ月</option>
              </select>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">コスト管理</h1>
          <p className="text-gray-600 mt-1">LINE公式アカウントの料金プランと使用状況を管理</p>
        </div>

        {/* Current Usage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Month Usage */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">今月の使用状況</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {mockUsageData.currentMonth.year}年{mockUsageData.currentMonth.month}月
                  （{mockUsageData.currentMonth.currentDay}日 / {mockUsageData.currentMonth.daysInMonth}日経過）
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {mockUsageData.currentMonth.messagesSent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">送信済み</div>
              </div>
            </div>

            <UsageProgressBar
              used={mockUsageData.currentMonth.messagesSent}
              total={currentPlanData.messageLimit}
            />

            {/* Daily Average */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">1日平均</div>
                <div className="text-xl font-bold text-gray-900">
                  {Math.round(mockUsageData.currentMonth.messagesSent / mockUsageData.currentMonth.currentDay).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">通/日</div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">残り</div>
                <div className="text-xl font-bold text-gray-900">
                  {mockUsageData.currentMonth.messagesRemaining.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">通</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">月末予測</div>
                <div className="text-xl font-bold text-gray-900">
                  {mockUsageData.projectedUsage.estimatedTotal.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">通（予測）</div>
              </div>
            </div>

            {/* Warning if usage is high */}
            {usagePercentage >= 80 && (
              <div className={`mt-4 p-4 rounded-lg ${
                usagePercentage >= 90
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start">
                  <span className="text-xl mr-2">{usagePercentage >= 90 ? '⚠️' : '📊'}</span>
                  <div>
                    <h4 className={`font-medium ${
                      usagePercentage >= 90 ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {usagePercentage >= 90 ? '使用量超過の可能性' : '使用量が80%を超えました'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      usagePercentage >= 90 ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {usagePercentage >= 90
                        ? 'このペースで送信を続けると、月末までに使用量上限に達する可能性があります。上位プランへのアップグレードをご検討ください。'
                        : '現在のペースで送信を続けると、月末までに使用量が上限に近づく可能性があります。'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Cost */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">今月の料金</h2>

            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ¥{mockUsageData.currentMonth.estimatedCost.toLocaleString()}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {currentPlanData.name}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">プラン基本料金</span>
                <span className="font-medium">¥{currentPlanData.monthlyFee.toLocaleString()}</span>
              </div>

              {mockUsageData.currentMonth.messagesSent > currentPlanData.messageLimit && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">超過分</span>
                    <span className="font-medium text-red-600">
                      ¥{((mockUsageData.currentMonth.messagesSent - currentPlanData.messageLimit) * (currentPlanData.extraMessageCost || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {(mockUsageData.currentMonth.messagesSent - currentPlanData.messageLimit).toLocaleString()}通 × ¥{currentPlanData.extraMessageCost}
                  </div>
                </>
              )}

              <div className="flex justify-between text-sm pt-3 border-t">
                <span className="text-gray-600">配信単価</span>
                <span className="font-medium">
                  ¥{(mockUsageData.currentMonth.estimatedCost / mockUsageData.currentMonth.messagesSent).toFixed(2)}
                </span>
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
              詳細レポートを見る
            </button>
          </div>
        </div>

        {/* Usage History Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">日別使用量推移</h2>
          <div className="space-y-2">
            {mockUsageData.dailyUsage.map((day, index) => {
              const maxCount = Math.max(...mockUsageData.dailyUsage.map(d => d.count))
              const percentage = (day.count / maxCount) * 100

              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {day.count}通
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            ※ 過去4日間の配信実績
          </div>
        </div>

        {/* Pricing Plans Comparison */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">料金プラン比較</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PRICING_PLANS).map(([key, plan]) => (
              <PlanCard
                key={key}
                planKey={key}
                plan={plan}
                isCurrent={key === mockUsageData.currentPlan}
              />
            ))}
          </div>
        </div>

        {/* Cost Optimization Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            コスト最適化のヒント
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">配信タイミングを最適化</h3>
              <p className="text-sm text-gray-600">
                開封率の高い時間帯（午前10-11時、午後3-5時）に配信することで、効果的なメッセージ配信が可能です。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">セグメント配信を活用</h3>
              <p className="text-sm text-gray-600">
                全体配信ではなく、ターゲットを絞ったセグメント配信により、メッセージ数を削減しつつ効果を最大化できます。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">リッチメニューを活用</h3>
              <p className="text-sm text-gray-600">
                メッセージ送信の代わりにリッチメニューで情報提供することで、コストをかけずに顧客とのタッチポイントを維持できます。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">プラン見直しのタイミング</h3>
              <p className="text-sm text-gray-600">
                3ヶ月連続で使用量が80%を超える、または50%を下回る場合は、プラン変更を検討する良いタイミングです。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

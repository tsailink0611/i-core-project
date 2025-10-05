'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SimpleChartProps } from '@/types/analytics'

// ダミーデータ
const mockAnalytics = {
  overview: {
    totalSent: 25600,
    totalDelivered: 24800,
    totalOpened: 19200,
    totalReplied: 4600,
    deliveryRate: 96.9,
    openRate: 77.4,
    responseRate: 18.5,
    averageCost: 0.2
  },
  timeSeriesData: [
    { date: '09/15', sent: 1200, opened: 950, replied: 180 },
    { date: '09/16', sent: 1500, opened: 1200, replied: 220 },
    { date: '09/17', sent: 800, opened: 650, replied: 120 },
    { date: '09/18', sent: 2000, opened: 1600, replied: 350 },
    { date: '09/19', sent: 1800, opened: 1400, replied: 280 },
    { date: '09/20', sent: 1600, opened: 1300, replied: 240 },
    { date: '09/21', sent: 900, opened: 700, replied: 130 }
  ],
  topMessages: [
    { id: 1, title: '秋の新商品キャンペーン', sent: 2000, opened: 1850, replied: 420, rate: 22.7 },
    { id: 2, title: '会員限定セール', sent: 1500, opened: 1200, replied: 280, rate: 18.7 },
    { id: 3, title: 'アンケート調査', sent: 800, opened: 650, replied: 156, rate: 19.5 },
    { id: 4, title: '新サービス案内', sent: 1200, opened: 980, replied: 180, rate: 15.0 }
  ],
  userSegments: [
    { name: '新規ユーザー', count: 450, responseRate: 25.2, avgSpend: 3200 },
    { name: 'リピーター', count: 680, responseRate: 15.8, avgSpend: 8500 },
    { name: 'VIPユーザー', count: 104, responseRate: 32.1, avgSpend: 25000 }
  ]
}

const MetricCard = ({ title, value, subtitle, trend, color = 'blue' }: {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; isPositive: boolean }
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200'
  }

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className={`mr-1 ${trend.isPositive ? '↗' : '↘'}`}>
              {trend.isPositive ? '↗' : '↘'}
            </span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}

const SimpleChart = ({ data, title }: SimpleChartProps) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.sent || 0, d.opened || 0, d.replied || 0)))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-12 text-sm text-gray-600">{item.date}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${((item.sent || 0) / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12">{item.sent || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${((item.opened || 0) / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12">{item.opened || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${((item.replied || 0) / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12">{item.replied || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
          送信数
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
          開封数
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
          応答数
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7days')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
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
                <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  分析
                </span>
                <Link href="/dashboard/cost" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  コスト管理
                </Link>
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
                <option value="7days">過去7日間</option>
                <option value="30days">過去30日間</option>
                <option value="90days">過去90日間</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                レポート出力
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">分析ダッシュボード</h1>
          <p className="text-gray-600 mt-1">メッセージの効果測定と詳細分析</p>
        </div>

        {/* 主要メトリクス */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="総送信数"
            value={mockAnalytics.overview.totalSent.toLocaleString()}
            subtitle="累計メッセージ"
            trend={{ value: 12.5, isPositive: true }}
            color="blue"
          />
          <MetricCard
            title="配信率"
            value={`${mockAnalytics.overview.deliveryRate}%`}
            subtitle={`${mockAnalytics.overview.totalDelivered.toLocaleString()}件配信`}
            trend={{ value: 2.1, isPositive: true }}
            color="green"
          />
          <MetricCard
            title="開封率"
            value={`${mockAnalytics.overview.openRate}%`}
            subtitle={`${mockAnalytics.overview.totalOpened.toLocaleString()}件開封`}
            trend={{ value: 5.3, isPositive: true }}
            color="yellow"
          />
          <MetricCard
            title="応答率"
            value={`${mockAnalytics.overview.responseRate}%`}
            subtitle={`${mockAnalytics.overview.totalReplied.toLocaleString()}件応答`}
            trend={{ value: 1.8, isPositive: false }}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 時系列グラフ */}
          <SimpleChart
            data={mockAnalytics.timeSeriesData}
            title="日別パフォーマンス推移"
          />

          {/* セグメント分析 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ユーザーセグメント分析</h3>
            <div className="space-y-4">
              {mockAnalytics.userSegments.map((segment, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{segment.name}</h4>
                    <span className="text-sm text-gray-500">{segment.count}名</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">応答率</span>
                      <div className="font-medium text-blue-600">{segment.responseRate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">平均購入額</span>
                      <div className="font-medium text-green-600">¥{segment.avgSpend.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* パフォーマンス上位メッセージ */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">高パフォーマンスメッセージ</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メッセージ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    送信数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    開封数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    応答数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    応答率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockAnalytics.topMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{message.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.opened.toLocaleString()}
                      <div className="text-xs text-gray-500">
                        {((message.opened / message.sent) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.replied.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          message.rate >= 20 ? 'text-green-600' :
                          message.rate >= 15 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {message.rate}%
                        </span>
                        <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              message.rate >= 20 ? 'bg-green-600' :
                              message.rate >= 15 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${(message.rate / 30) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">詳細</button>
                      <button className="text-green-600 hover:text-green-900">複製</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 追加インサイト */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">💡 改善提案</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 火曜日の配信で最も高い開封率を記録</li>
              <li>• 画像付きメッセージの応答率が25%向上</li>
              <li>• 午前中配信で応答率が平均より15%高い</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📊 コスト分析</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">月間コスト</span>
                <span className="text-sm font-medium">¥5,120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">配信単価</span>
                <span className="text-sm font-medium">¥0.20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">応答単価</span>
                <span className="text-sm font-medium">¥1.11</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 目標達成状況</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">月間送信目標</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">応答率目標</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
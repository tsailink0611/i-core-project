// Analytics 関連の型定義

export interface ChartDataPoint {
  name: string
  value: number
  date?: string
  category?: string
}

export interface SimpleChartProps {
  data: ChartDataPoint[]
  title: string
  color?: string
  type?: 'line' | 'bar' | 'pie'
}

export interface AnalyticsMetrics {
  totalMessages: number
  successRate: number
  responseRate: number
  reachRate: number
  clickRate: number
  conversionRate: number
  period: {
    start: Date
    end: Date
  }
}

export interface PerformanceData {
  messagesSent: ChartDataPoint[]
  deliveryRates: ChartDataPoint[]
  engagementRates: ChartDataPoint[]
  conversionMetrics: ChartDataPoint[]
}

export interface BusinessInsight {
  metric: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  description: string
}
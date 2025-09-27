'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { cn, formatNumber } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({
  title,
  value,
  subtitle,
  color = 'blue',
  icon,
  trend
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    red: 'bg-red-50 border-red-200 text-red-800'
  }

  const displayValue = typeof value === 'number' ? formatNumber(value) : value

  return (
    <Card className={cn('border-2', colorClasses[color])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              {icon && <div className="mr-3 text-xl">{icon}</div>}
              <h3 className="text-sm font-medium opacity-75">{title}</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{displayValue}</p>
            {subtitle && (
              <p className="text-sm opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center text-sm font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className="mr-1">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
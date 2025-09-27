'use client'

import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '@/lib/api'
import { AnalyticsRequest, AnalyticsResponse } from '@/lib/api/types'

interface UseAnalyticsState {
  data: AnalyticsResponse | null
  dashboardStats: any | null
  loading: boolean
  error: string | null
}

export function useAnalytics(request?: AnalyticsRequest) {
  const [state, setState] = useState<UseAnalyticsState>({
    data: null,
    dashboardStats: null,
    loading: false,
    error: null
  })

  const fetchAnalytics = useCallback(async (currentRequest?: AnalyticsRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const [analyticsData, dashboardData] = await Promise.all([
        analyticsService.getAnalytics(currentRequest || request),
        analyticsService.getDashboardStats()
      ])

      setState({
        data: analyticsData,
        dashboardStats: dashboardData,
        loading: false,
        error: null
      })

      return { analytics: analyticsData, dashboard: dashboardData }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [request])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const getMessagePerformance = useCallback(async (
    dateRange: { start: string; end: string },
    groupBy: 'day' | 'week' | 'month' = 'day'
  ) => {
    try {
      return await analyticsService.getMessagePerformance(dateRange, groupBy)
    } catch (error) {
      throw error
    }
  }, [])

  const getCampaignAnalytics = useCallback(async (campaignId?: number) => {
    try {
      return await analyticsService.getCampaignAnalytics(campaignId)
    } catch (error) {
      throw error
    }
  }, [])

  const getAudienceInsights = useCallback(async () => {
    try {
      return await analyticsService.getAudienceInsights()
    } catch (error) {
      throw error
    }
  }, [])

  const exportAnalytics = useCallback(async (
    format: 'csv' | 'xlsx' | 'pdf',
    exportRequest?: AnalyticsRequest
  ) => {
    try {
      return await analyticsService.exportAnalytics(format, exportRequest)
    } catch (error) {
      throw error
    }
  }, [])

  const refresh = useCallback(() => {
    return fetchAnalytics()
  }, [fetchAnalytics])

  return {
    ...state,
    actions: {
      refresh,
      fetchAnalytics,
      getMessagePerformance,
      getCampaignAnalytics,
      getAudienceInsights,
      exportAnalytics
    }
  }
}

// Specialized hook for dashboard stats only
export function useDashboardStats() {
  const [state, setState] = useState<{
    stats: any | null
    loading: boolean
    error: string | null
  }>({
    stats: null,
    loading: false,
    error: null
  })

  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const stats = await analyticsService.getDashboardStats()
      setState({
        stats,
        loading: false,
        error: null
      })
      return stats
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    ...state,
    refresh: fetchStats
  }
}
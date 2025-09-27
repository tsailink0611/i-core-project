import { useState, useEffect, useCallback } from 'react'
import { useApiCache } from './useApiCache'

interface UseAsyncDataOptions {
  cacheTime?: number
  staleTime?: number
  enabled?: boolean
  retryCount?: number
  retryDelay?: number
}

export function useAsyncData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000,
    staleTime = 60 * 1000,
    enabled = true,
    retryCount = 1,
    retryDelay = 1000
  } = options

  const { fetchWithCache, isLoading, error } = useApiCache<T>({ cacheTime, staleTime })
  const [data, setData] = useState<T | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const execute = useCallback(async (forceRefresh = false) => {
    if (!enabled) return

    let attempts = 0
    const maxAttempts = retryCount + 1

    while (attempts < maxAttempts) {
      try {
        setIsValidating(true)
        const result = await fetchWithCache(key, fetcher, forceRefresh)
        setData(result)
        break
      } catch (err) {
        attempts++
        if (attempts >= maxAttempts) {
          console.error(`Failed to fetch data for key "${key}" after ${maxAttempts} attempts:`, err)
          break
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      } finally {
        setIsValidating(false)
      }
    }
  }, [key, fetcher, fetchWithCache, enabled, retryCount, retryDelay])

  const refresh = useCallback(() => execute(true), [execute])

  useEffect(() => {
    if (enabled) {
      execute()
    }
  }, [execute, enabled])

  return {
    data,
    isLoading: isLoading || isValidating,
    error,
    refresh,
    execute
  }
}
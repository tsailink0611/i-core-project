import { useState, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

interface UseApiCacheOptions {
  cacheTime?: number // Cache duration in milliseconds (default: 5 minutes)
  staleTime?: number // Time until data is considered stale (default: 1 minute)
}

export function useApiCache<T>(options: UseApiCacheOptions = {}) {
  const { cacheTime = 5 * 60 * 1000, staleTime = 60 * 1000 } = options
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
      cache.current.delete(key)
      return null
    }

    return entry.data
  }, [])

  const set = useCallback((key: string, data: T) => {
    const now = Date.now()
    cache.current.set(key, {
      data,
      timestamp: now,
      expiry: now + cacheTime
    })
  }, [cacheTime])

  const isStale = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    if (!entry) return true

    return Date.now() > entry.timestamp + staleTime
  }, [staleTime])

  const fetchWithCache = useCallback(async <TResult = T>(
    key: string,
    fetcher: () => Promise<TResult>,
    forceRefresh: boolean = false
  ): Promise<TResult> => {
    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = get(key) as TResult | null
      if (cached && !isStale(key)) {
        return cached
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetcher()
      set(key, data as T)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [get, set, isStale])

  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key)
    } else {
      cache.current.clear()
    }
  }, [])

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    return entry !== undefined && Date.now() <= entry.expiry
  }, [])

  return {
    get,
    set,
    fetchWithCache,
    clear,
    has,
    isStale,
    isLoading,
    error
  }
}
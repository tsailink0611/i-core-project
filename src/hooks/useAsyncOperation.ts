// Standardized async operation hook with error handling and retry logic
import { useState, useCallback, useRef } from 'react'
import { LCoreErrorHandler, type LCoreError } from '@/lib/errors/errorHandler'

interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: LCoreError | null
  retryCount: number
}

interface AsyncOperationOptions {
  maxRetries?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: LCoreError) => void
  autoRetry?: boolean
}

const DEFAULT_OPTIONS: Required<AsyncOperationOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  onSuccess: () => {},
  onError: () => {},
  autoRetry: false
}

export function useAsyncOperation<T>(
  operation: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Cancel previous operation if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      const result = await operation(...args)

      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null
      }

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        retryCount: 0
      }))

      mergedOptions.onSuccess(result)
      return result

    } catch (error) {
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null
      }

      const lCoreError = LCoreErrorHandler.handleError(error, 'AsyncOperation')

      setState(prev => ({
        ...prev,
        loading: false,
        error: lCoreError,
        retryCount: prev.retryCount + 1
      }))

      mergedOptions.onError(lCoreError)

      // Auto retry if enabled and error is retryable
      if (
        mergedOptions.autoRetry &&
        LCoreErrorHandler.isRetryable(lCoreError) &&
        state.retryCount < mergedOptions.maxRetries
      ) {
        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            execute(...args)
          }
        }, mergedOptions.retryDelay * Math.pow(2, state.retryCount)) // Exponential backoff
      }

      throw lCoreError
    }
  }, [operation, mergedOptions, state.retryCount])

  const retry = useCallback((...args: any[]) => {
    if (state.retryCount < mergedOptions.maxRetries) {
      execute(...args)
    }
  }, [execute, state.retryCount, mergedOptions.maxRetries])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    })
  }, [])

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setState(prev => ({
      ...prev,
      loading: false
    }))
  }, [])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    ...state,
    execute,
    retry,
    reset,
    abort,
    cleanup,
    canRetry: state.error ? LCoreErrorHandler.isRetryable(state.error) && state.retryCount < mergedOptions.maxRetries : false,
    isRetryable: state.error ? LCoreErrorHandler.isRetryable(state.error) : false,
    userMessage: state.error ? LCoreErrorHandler.getUserMessage(state.error) : null
  }
}

// Convenience hook for API calls
export function useApiCall<T>(
  url: string | (() => string),
  options: AsyncOperationOptions & {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    body?: any
  } = {}
) {
  const { method = 'GET', headers = {}, body, ...asyncOptions } = options

  const apiOperation = useCallback(async (): Promise<T> => {
    const actualUrl = typeof url === 'function' ? url() : url

    const response = await fetch(actualUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }, [url, method, headers, body])

  return useAsyncOperation<T>(apiOperation, {
    ...asyncOptions,
    autoRetry: true // API calls are usually safe to auto-retry
  })
}

// Hook for OpenAI API calls with specific error handling
export function useOpenAICall<T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  return useAsyncOperation<T>(operation, {
    maxRetries: 2, // OpenAI calls are expensive, limit retries
    retryDelay: 2000, // Longer delay for OpenAI
    autoRetry: true,
    ...options
  })
}
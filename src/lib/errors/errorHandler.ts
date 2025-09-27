// Standardized error handling system for L-Core

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  OPENAI = 'OPENAI',
  CACHE = 'CACHE',
  UNKNOWN = 'UNKNOWN'
}

export interface LCoreError {
  type: ErrorType
  message: string
  code: string
  details?: Record<string, any>
  timestamp: number
  stack?: string
  retryable: boolean
}

export class LCoreErrorHandler {
  private static errorCounts: Map<string, number> = new Map()
  private static lastErrors: Map<string, number> = new Map()

  static createError(
    type: ErrorType,
    message: string,
    code: string,
    details?: Record<string, any>,
    retryable: boolean = false
  ): LCoreError {
    return {
      type,
      message,
      code,
      details,
      timestamp: Date.now(),
      retryable
    }
  }

  static handleError(error: unknown, context?: string): LCoreError {
    let lCoreError: LCoreError

    if (error instanceof Error) {
      // Determine error type based on error patterns
      if (error.message.includes('fetch') || error.message.includes('network')) {
        lCoreError = this.createError(
          ErrorType.NETWORK,
          'ネットワークエラーが発生しました',
          'NETWORK_ERROR',
          { originalMessage: error.message, context },
          true
        )
      } else if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
        lCoreError = this.createError(
          ErrorType.API,
          'APIエラーが発生しました',
          'API_ERROR',
          { originalMessage: error.message, context },
          true
        )
      } else if (error.message.includes('OpenAI') || error.message.includes('GPT')) {
        lCoreError = this.createError(
          ErrorType.OPENAI,
          'AI処理でエラーが発生しました',
          'OPENAI_ERROR',
          { originalMessage: error.message, context },
          true
        )
      } else if (error.message.includes('validation') || error.message.includes('required')) {
        lCoreError = this.createError(
          ErrorType.VALIDATION,
          '入力データに問題があります',
          'VALIDATION_ERROR',
          { originalMessage: error.message, context },
          false
        )
      } else {
        lCoreError = this.createError(
          ErrorType.UNKNOWN,
          error.message || '不明なエラーが発生しました',
          'UNKNOWN_ERROR',
          { originalMessage: error.message, context, stack: error.stack },
          false
        )
      }
    } else {
      lCoreError = this.createError(
        ErrorType.UNKNOWN,
        '予期しないエラーが発生しました',
        'UNEXPECTED_ERROR',
        { error: String(error), context },
        false
      )
    }

    this.logError(lCoreError)
    return lCoreError
  }

  static isRetryable(error: LCoreError): boolean {
    return error.retryable && this.getErrorCount(error.code) < 3
  }

  static shouldShowToUser(error: LCoreError): boolean {
    // Don't show sensitive errors to users
    return ![ErrorType.AUTH, ErrorType.UNKNOWN].includes(error.type)
  }

  static getUserMessage(error: LCoreError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'インターネット接続を確認してください'
      case ErrorType.API:
        return 'サービスに一時的な問題が発生しています。しばらく待ってから再度お試しください'
      case ErrorType.OPENAI:
        return 'AI処理でエラーが発生しました。しばらく待ってから再度お試しください'
      case ErrorType.VALIDATION:
        return error.message
      case ErrorType.CACHE:
        return 'データの読み込みでエラーが発生しました。ページを更新してください'
      default:
        return '予期しないエラーが発生しました。問題が続く場合はサポートにお問い合わせください'
    }
  }

  private static logError(error: LCoreError): void {
    // Count errors for monitoring
    const currentCount = this.errorCounts.get(error.code) || 0
    this.errorCounts.set(error.code, currentCount + 1)
    this.lastErrors.set(error.code, Date.now())

    // Log based on error type
    if (error.type === ErrorType.UNKNOWN || !error.retryable) {
      console.error('[L-Core Error]', error)
    } else {
      console.warn('[L-Core Error]', error)
    }

    // Alert on critical errors
    if (this.getErrorCount(error.code) >= 5) {
      console.error('[L-Core Critical]', `Error ${error.code} occurred ${this.getErrorCount(error.code)} times`)
    }
  }

  private static getErrorCount(code: string): number {
    const lastError = this.lastErrors.get(code) || 0
    const now = Date.now()

    // Reset count if last error was more than 5 minutes ago
    if (now - lastError > 5 * 60 * 1000) {
      this.errorCounts.set(code, 0)
      return 0
    }

    return this.errorCounts.get(code) || 0
  }

  static getErrorStats(): { code: string; count: number; lastOccurred: number }[] {
    const stats: { code: string; count: number; lastOccurred: number }[] = []

    for (const [code, count] of this.errorCounts.entries()) {
      const lastOccurred = this.lastErrors.get(code) || 0
      stats.push({ code, count, lastOccurred })
    }

    return stats.sort((a, b) => b.count - a.count)
  }

  static clearErrorStats(): void {
    this.errorCounts.clear()
    this.lastErrors.clear()
  }
}

// Hook for React components
export function useErrorHandler() {
  return {
    handleError: LCoreErrorHandler.handleError,
    createError: LCoreErrorHandler.createError,
    getUserMessage: LCoreErrorHandler.getUserMessage,
    isRetryable: LCoreErrorHandler.isRetryable,
    shouldShowToUser: LCoreErrorHandler.shouldShowToUser,
    getErrorStats: LCoreErrorHandler.getErrorStats
  }
}

// Error boundary component types
export interface ErrorBoundaryState {
  hasError: boolean
  error: LCoreError | null
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: LCoreError) => React.ReactNode
  onError?: (error: LCoreError) => void
}
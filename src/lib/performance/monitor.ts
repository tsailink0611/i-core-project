// Performance monitoring utilities for L-Core project

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  type: 'render' | 'api' | 'user-interaction'
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private timers: Map<string, number> = new Map()

  startTimer(name: string, type: PerformanceMetric['type'] = 'render', metadata?: Record<string, any>) {
    this.timers.set(name, performance.now())
  }

  endTimer(name: string, type: PerformanceMetric['type'] = 'render', metadata?: Record<string, any>) {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`)
      return
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      type,
      metadata
    }

    this.metrics.push(metric)

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata)
    }
  }

  measureComponent<T extends (...args: any[]) => any>(
    componentName: string,
    fn: T,
    metadata?: Record<string, any>
  ): T {
    return ((...args: any[]) => {
      this.startTimer(componentName, 'render', metadata)
      try {
        const result = fn(...args)
        if (result && typeof result.then === 'function') {
          // Handle async functions
          return result.finally(() => {
            this.endTimer(componentName, 'render', metadata)
          })
        }
        this.endTimer(componentName, 'render', metadata)
        return result
      } catch (error) {
        this.endTimer(componentName, 'render', { ...metadata, error: true })
        throw error
      }
    }) as T
  }

  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, 'api', metadata)
    try {
      const result = await apiCall()
      this.endTimer(name, 'api', { ...metadata, success: true })
      return result
    } catch (error) {
      this.endTimer(name, 'api', { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }

  measureUserInteraction(actionName: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name: actionName,
      duration: 0,
      timestamp: Date.now(),
      type: 'user-interaction',
      metadata
    }
    this.metrics.push(metric)
  }

  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
  }

  getMetrics(type?: PerformanceMetric['type'], limit: number = 50): PerformanceMetric[] {
    let filtered = this.metrics
    if (type) {
      filtered = this.metrics.filter(m => m.type === type)
    }
    return filtered.slice(-limit)
  }

  getSlowOperations(threshold: number = 100): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold)
  }

  getAverageTime(name: string): number {
    const relatedMetrics = this.metrics.filter(m => m.name === name)
    if (relatedMetrics.length === 0) return 0

    const totalTime = relatedMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    return totalTime / relatedMetrics.length
  }

  clear() {
    this.metrics = []
    this.timers.clear()
  }

  generateReport(): string {
    const slowOps = this.getSlowOperations()
    const renderMetrics = this.getMetrics('render')
    const apiMetrics = this.getMetrics('api')

    let report = '=== Performance Report ===\n\n'

    if (slowOps.length > 0) {
      report += `Slow Operations (>100ms):\n`
      slowOps.forEach(op => {
        report += `  - ${op.name}: ${op.duration.toFixed(2)}ms\n`
      })
      report += '\n'
    }

    if (renderMetrics.length > 0) {
      const avgRenderTime = renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length
      report += `Render Performance:\n`
      report += `  - Average render time: ${avgRenderTime.toFixed(2)}ms\n`
      report += `  - Total renders: ${renderMetrics.length}\n\n`
    }

    if (apiMetrics.length > 0) {
      const avgApiTime = apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
      const successfulCalls = apiMetrics.filter(m => m.metadata?.success).length
      const successRate = (successfulCalls / apiMetrics.length) * 100

      report += `API Performance:\n`
      report += `  - Average API time: ${avgApiTime.toFixed(2)}ms\n`
      report += `  - Total API calls: ${apiMetrics.length}\n`
      report += `  - Success rate: ${successRate.toFixed(1)}%\n`
    }

    return report
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    startTimer: performanceMonitor.startTimer.bind(performanceMonitor),
    endTimer: performanceMonitor.endTimer.bind(performanceMonitor),
    measureComponent: performanceMonitor.measureComponent.bind(performanceMonitor),
    measureApiCall: performanceMonitor.measureApiCall.bind(performanceMonitor),
    measureUserInteraction: performanceMonitor.measureUserInteraction.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getSlowOperations: performanceMonitor.getSlowOperations.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  }
}

// Web Vitals monitoring
export function measureWebVitals() {
  if (typeof window === 'undefined') return

  // Measure Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        performanceMonitor.addMetric({
          name: 'LCP',
          duration: entry.startTime,
          timestamp: Date.now(),
          type: 'render',
          metadata: { element: (entry as any).element?.tagName }
        })
      }
    }
  })

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    // Fallback for browsers that don't support LCP
    console.log('LCP monitoring not supported')
  }

  // Measure First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      performanceMonitor.addMetric({
        name: 'FID',
        duration: (entry as any).processingStart - entry.startTime,
        timestamp: Date.now(),
        type: 'user-interaction',
        metadata: { eventType: (entry as any).name }
      })
    }
  })

  try {
    fidObserver.observe({ entryTypes: ['first-input'] })
  } catch (e) {
    console.log('FID monitoring not supported')
  }
}
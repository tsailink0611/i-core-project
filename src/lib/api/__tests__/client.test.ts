import { ApiClient, ApiError } from '../client'
import { mockFetch, mockFetchError, mockApiResponse } from '@/lib/test-utils'

describe('ApiClient', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('/api')
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const responseData = mockApiResponse({ id: 1, name: 'Test' })
      mockFetch(responseData)

      const result = await client.get('/test')

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      })
      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('includes query parameters', async () => {
      const responseData = mockApiResponse({ results: [] })
      mockFetch(responseData)

      await client.get('/test', { page: 1, limit: 10 })

      expect(fetch).toHaveBeenCalledWith('/api/test?page=1&limit=10', expect.any(Object))
    })
  })

  describe('POST requests', () => {
    it('makes successful POST request with data', async () => {
      const responseData = mockApiResponse({ id: 1, created: true })
      mockFetch(responseData)

      const postData = { name: 'New Item' }
      const result = await client.post('/test', postData)

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        signal: expect.any(AbortSignal),
      })
      expect(result).toEqual({ id: 1, created: true })
    })

    it('makes POST request without data', async () => {
      const responseData = mockApiResponse({ success: true })
      mockFetch(responseData)

      await client.post('/test')

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
        signal: expect.any(AbortSignal),
      })
    })
  })

  describe('Error handling', () => {
    it('throws ApiError for HTTP errors', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: { field: 'name' }
        }
      }
      mockFetch(errorResponse, false)

      await expect(client.get('/test')).rejects.toThrow(ApiError)
      await expect(client.get('/test')).rejects.toThrow('Invalid input')
    })

    it('throws ApiError for API errors', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        }
      }
      mockFetch(errorResponse)

      await expect(client.get('/test')).rejects.toThrow(ApiError)
    })

    it('throws ApiError for network errors', async () => {
      mockFetchError('Failed to fetch')

      await expect(client.get('/test')).rejects.toThrow(ApiError)
      await expect(client.get('/test')).rejects.toThrow('Failed to fetch')
    })

    it('handles timeout', async () => {
      // Mock a request that never resolves
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const client = new ApiClient('/api')
      await expect(
        client.get('/test', {}, { timeout: 100 })
      ).rejects.toThrow('Request timeout')
    }, 1000)
  })

  describe('Authentication', () => {
    it('sets auth token', () => {
      client.setAuthToken('test-token')

      const responseData = mockApiResponse({})
      mockFetch(responseData)

      client.get('/test')

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        signal: expect.any(AbortSignal),
      })
    })

    it('clears auth token', () => {
      client.setAuthToken('test-token')
      client.clearAuthToken()

      const responseData = mockApiResponse({})
      mockFetch(responseData)

      client.get('/test')

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      })
    })
  })

  describe('File upload', () => {
    it('uploads file correctly', async () => {
      const responseData = mockApiResponse({ url: 'http://example.com/file.jpg' })
      mockFetch(responseData)

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await client.upload('/upload', file)

      expect(fetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        body: expect.any(FormData),
        headers: {},
        signal: expect.any(AbortSignal),
      })
      expect(result).toEqual({ url: 'http://example.com/file.jpg' })
    })
  })
})
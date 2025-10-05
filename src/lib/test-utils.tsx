import React, { ReactElement } from 'react'
import { render, RenderOptions, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* Add global providers here like Theme, Auth, etc. */}
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data generators
export const createMockMessage = (overrides = {}) => ({
  id: 1,
  title: 'Test Message',
  content: 'Test content',
  status: 'draft' as const,
  type: 'text' as const,
  recipients: 100,
  responses: 10,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockTemplate = (overrides = {}) => ({
  id: 1,
  name: 'Test Template',
  content: 'Hello {name}!',
  category: 'greeting',
  businessType: 'retail',
  variables: { name: 'string' },
  usage: 5,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockAnalytics = (overrides = {}) => ({
  overview: {
    totalMessages: 1000,
    totalResponses: 200,
    responseRate: 20,
    activeUsers: 500,
  },
  trends: [
    {
      date: '2024-01-01',
      messages: 50,
      responses: 10,
      responseRate: 20,
    },
  ],
  breakdown: {
    byType: { text: 500, image: 300, template: 200 },
    byStatus: { sent: 800, scheduled: 100, draft: 100 },
    byCategory: { marketing: 600, support: 400 },
  },
  ...overrides,
})

// API mock helpers
export const mockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : { code: 'ERROR', message: 'Test error' },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'test-request-id',
  },
})

export const mockFetch = (responseData: any, ok = true) => {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
    json: async () => responseData,
  })
}

export const mockFetchError = (error = 'Network error') => {
  ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error(error))
}

// User event helpers
export const user = userEvent.setup()

// Common test utilities
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

export const expectNotToBeInDocument = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument()
}

export const findByTestId = (testId: string) => screen.findByTestId(testId)
export const getByTestId = (testId: string) => screen.getByTestId(testId)
export const queryByTestId = (testId: string) => screen.queryByTestId(testId)

export const findByText = (text: string | RegExp) => screen.findByText(text)
export const getByText = (text: string | RegExp) => screen.getByText(text)
export const queryByText = (text: string | RegExp) => screen.queryByText(text)

export const findByRole = (role: string, options?: any) => screen.findByRole(role, options)
export const getByRole = (role: string, options?: any) => screen.getByRole(role, options)
export const queryByRole = (role: string, options?: any) => screen.queryByRole(role, options)

// Async utilities
export const waitForElementToDisappear = async (element: HTMLElement) => {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument()
  })
}

export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

// Form testing helpers
export const fillInput = async (input: HTMLElement, value: string) => {
  await user.clear(input)
  await user.type(input, value)
}

export const selectOption = async (select: HTMLElement, optionText: string) => {
  await user.selectOptions(select, optionText)
}

export const clickButton = async (button: HTMLElement) => {
  await user.click(button)
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override render export
export { customRender as render }
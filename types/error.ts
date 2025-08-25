export class ApiTestError extends Error {
  constructor(
    message: string,
    public readonly apiName: string,
    public readonly testName: string,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'ApiTestError'
  }
}

export interface ErrorDetails {
  message: string
  stack?: string
  apiName: string
  testName: string
  timestamp: Date
}

export type ErrorHandler = (error: ApiTestError) => void
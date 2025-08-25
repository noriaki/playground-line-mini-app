export interface TestResult {
  apiName: string
  testName: string
  status: 'success' | 'error' | 'not-supported'
  result?: any
  error?: string
  timestamp: Date
  executionTime: number
}

export interface TestCase {
  name: string
  description: string
  execute: () => Promise<any>
  expectedBehavior: string
}

export interface ApiTestConfig {
  id: string
  name: string
  description: string
  category: string
  tests: TestCase[]
  documentation?: string
}

export interface ApiCategory {
  id: string
  name: string
  description: string
  icon?: string
  apiTests: ApiTestConfig[]
}

export type ApiStatus = 'supported' | 'not-supported' | 'partial' | 'unknown'

export interface ApiCompatibility {
  apiName: string
  status: ApiStatus
  notes?: string
  testedVersion?: string
}
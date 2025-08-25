'use client'

import { useState } from 'react'
import { TestCase, TestResult } from '@/types'
import Button from './Button'
import TestResultDisplay from './TestResult'

interface ApiTestCardProps {
  test: TestCase
  apiName: string
}

export default function ApiTestCard({ test, apiName }: ApiTestCardProps) {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    const startTime = Date.now()

    try {
      const testResult = await test.execute()
      const executionTime = Date.now() - startTime

      setResult({
        apiName,
        testName: test.name,
        status: 'success',
        result: testResult,
        timestamp: new Date(),
        executionTime,
      })
    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      setResult({
        apiName,
        testName: test.name,
        status: errorMessage.includes('not supported') ? 'not-supported' : 'error',
        error: errorMessage,
        timestamp: new Date(),
        executionTime,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-medium">Expected behavior:</span> {test.expectedBehavior}
        </p>
      </div>

      <Button
        onClick={runTest}
        loading={loading}
        disabled={loading}
        variant="primary"
        size="sm"
      >
        Run Test
      </Button>

      {result && <TestResultDisplay result={result} />}
    </div>
  )
}
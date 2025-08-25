import { TestResult } from '@/types'
import JsonFormatter from './JsonFormatter'

interface TestResultDisplayProps {
  result: TestResult
}

export default function TestResultDisplay({ result }: TestResultDisplayProps) {
  const statusColors = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    'not-supported': 'bg-yellow-50 border-yellow-200 text-yellow-900',
  }

  const statusIcons = {
    success: '✓',
    error: '✗',
    'not-supported': '⚠',
  }

  const statusLabels = {
    success: 'Success',
    error: 'Error',
    'not-supported': 'Not Supported',
  }

  return (
    <div className={`rounded-lg border p-4 ${statusColors[result.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{statusIcons[result.status]}</span>
          <span className="font-semibold">{statusLabels[result.status]}</span>
        </div>
        <span className="text-xs opacity-75">
          {result.executionTime}ms
        </span>
      </div>

      {result.error && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Error Message:</p>
          <p className="text-sm font-mono bg-white bg-opacity-50 rounded p-2">
            {result.error}
          </p>
        </div>
      )}

      {result.result !== undefined && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Result:</p>
          {typeof result.result === 'object' ? (
            <JsonFormatter data={result.result} />
          ) : (
            <p className="text-sm font-mono bg-white bg-opacity-50 rounded p-2">
              {String(result.result)}
            </p>
          )}
        </div>
      )}

      <div className="mt-2 text-xs opacity-75">
        Tested at: {result.timestamp.toLocaleTimeString()}
      </div>
    </div>
  )
}
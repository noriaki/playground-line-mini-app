'use client'

import { useState } from 'react'

interface JsonFormatterProps {
  data: any
  maxDepth?: number
}

export default function JsonFormatter({ data, maxDepth = 3 }: JsonFormatterProps) {
  const [expanded, setExpanded] = useState(true)

  const formatValue = (value: any, depth: number = 0): React.ReactNode => {
    if (depth > maxDepth) {
      return <span className="text-gray-500">...</span>
    }

    if (value === null) {
      return <span className="text-gray-500">null</span>
    }

    if (value === undefined) {
      return <span className="text-gray-500">undefined</span>
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600">{String(value)}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-purple-600">{value}</span>
    }

    if (typeof value === 'string') {
      return <span className="text-green-600">&quot;{value}&quot;</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span>[]</span>
      }

      return (
        <span>
          [
          {expanded && (
            <div className="ml-4">
              {value.map((item, index) => (
                <div key={index}>
                  {formatValue(item, depth + 1)}
                  {index < value.length - 1 && ','}
                </div>
              ))}
            </div>
          )}
          ]
        </span>
      )
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value)
      if (entries.length === 0) {
        return <span>{'{}'}</span>
      }

      return (
        <span>
          {'{'}
          {expanded && (
            <div className="ml-4">
              {entries.map(([key, val], index) => (
                <div key={key}>
                  <span className="text-gray-700">&quot;{key}&quot;</span>:{' '}
                  {formatValue(val, depth + 1)}
                  {index < entries.length - 1 && ','}
                </div>
              ))}
            </div>
          )}
          {'}'}
        </span>
      )
    }

    return <span className="text-gray-500">{String(value)}</span>
  }

  return (
    <div className="bg-white bg-opacity-50 rounded p-2 font-mono text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-500 hover:text-gray-700 mb-1"
      >
        {expanded ? '▼ Collapse' : '▶ Expand'}
      </button>
      <div>{formatValue(data)}</div>
    </div>
  )
}
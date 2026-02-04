'use client'

import { useState, useRef, useEffect } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import ApiTestCard from '@/components/ApiTestCard'
import { TestCase } from '@/types'

interface WebSocketMessage {
  type: 'sent' | 'received' | 'system'
  content: string
  timestamp: Date
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export default function WebSocketTest() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [websocketUrl, setWebsocketUrl] = useState('wss://echo.websocket.org/')
  const [supportStatus, setSupportStatus] = useState<Record<string, boolean>>({})
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [latency, setLatency] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastPingRef = useRef<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
    
    const checkSupport = () => {
      if (typeof window === 'undefined') return
      
      setSupportStatus({
        WebSocket: 'WebSocket' in window,
        WebSocketConstructor: typeof WebSocket === 'function',
        BinaryType: 'binaryType' in WebSocket.prototype,
        Protocol: 'protocol' in WebSocket.prototype,
        Extensions: 'extensions' in WebSocket.prototype,
        BufferedAmount: 'bufferedAmount' in WebSocket.prototype,
      })
    }

    checkSupport()

    return () => {
      disconnectWebSocket()
    }
  }, [])

  const addMessage = (type: 'sent' | 'received' | 'system', content: string) => {
    setMessages(prev => [...prev, {
      type,
      content,
      timestamp: new Date()
    }])
  }

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionState('connecting')
      setConnectionError(null)
      
      const ws = new WebSocket(websocketUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionState('connected')
        setReconnectAttempts(0)
        addMessage('system', `Connected to ${websocketUrl}`)
        
        // Start ping/pong for latency measurement
        startLatencyCheck()
      }

      ws.onmessage = (event) => {
        const message = event.data
        
        // Handle pong for latency measurement
        if (message === 'pong' && lastPingRef.current) {
          const currentLatency = Date.now() - lastPingRef.current
          setLatency(currentLatency)
          lastPingRef.current = null
          return
        }
        
        addMessage('received', message)
      }

      ws.onclose = (event) => {
        setConnectionState('disconnected')
        stopLatencyCheck()
        
        let reason = 'Connection closed'
        if (event.code === 1000) {
          reason += ' normally'
        } else if (event.code === 1001) {
          reason += ' due to page navigation'
        } else if (event.code === 1006) {
          reason += ' abnormally'
        } else {
          reason += ` with code ${event.code}`
        }
        
        addMessage('system', reason)
      }

      ws.onerror = () => {
        setConnectionState('error')
        setConnectionError('Connection failed')
        addMessage('system', 'Connection error occurred')
        stopLatencyCheck()
      }

    } catch (error) {
      setConnectionState('error')
      setConnectionError(error instanceof Error ? error.message : 'Unknown error')
      addMessage('system', `Failed to create WebSocket: ${error}`)
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }
    stopLatencyCheck()
  }

  const sendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !messageInput.trim()) {
      return
    }

    wsRef.current.send(messageInput)
    addMessage('sent', messageInput)
    setMessageInput('')
  }

  const startLatencyCheck = () => {
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        lastPingRef.current = Date.now()
        wsRef.current.send('ping')
      }
    }, 5000)
  }

  const stopLatencyCheck = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    lastPingRef.current = null
    setLatency(null)
  }

  const clearMessages = () => {
    setMessages([])
  }

  const testCases: TestCase[] = [
    {
      name: 'Check WebSocket API Support',
      description: 'Verify if WebSocket API is available in the browser',
      execute: async () => {
        const support = {
          WebSocket: 'WebSocket' in window,
          constructor: typeof WebSocket === 'function',
          readyState: WebSocket.CONNECTING !== undefined && WebSocket.OPEN !== undefined,
          constants: {
            CONNECTING: WebSocket.CONNECTING,
            OPEN: WebSocket.OPEN,
            CLOSING: WebSocket.CLOSING,
            CLOSED: WebSocket.CLOSED,
          }
        }
        return support
      },
      expectedBehavior: 'Returns object with WebSocket API availability status',
    },
    {
      name: 'Basic WebSocket Connection',
      description: 'Test basic connection to echo server',
      execute: async () => {
        return new Promise((resolve, reject) => {
          const testWs = new WebSocket('wss://echo.websocket.org/')
          const timeout = setTimeout(() => {
            testWs.close()
            reject(new Error('Connection timeout'))
          }, 10000)

          testWs.onopen = () => {
            clearTimeout(timeout)
            testWs.close()
            resolve({ success: true, url: 'wss://echo.websocket.org/' })
          }

          testWs.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Connection failed'))
          }
        })
      },
      expectedBehavior: 'Successfully connects to WebSocket echo server',
    },
    {
      name: 'Message Send and Receive',
      description: 'Test sending and receiving messages through WebSocket',
      execute: async () => {
        return new Promise((resolve, reject) => {
          const testWs = new WebSocket('wss://echo.websocket.org/')
          const testMessage = `Test message ${Date.now()}`
          const timeout = setTimeout(() => {
            testWs.close()
            reject(new Error('Message exchange timeout'))
          }, 10000)

          testWs.onopen = () => {
            testWs.send(testMessage)
          }

          testWs.onmessage = (event) => {
            clearTimeout(timeout)
            testWs.close()
            if (event.data === testMessage) {
              resolve({ success: true, sent: testMessage, received: event.data })
            } else {
              reject(new Error('Received message does not match sent message'))
            }
          }

          testWs.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('WebSocket error during message test'))
          }
        })
      },
      expectedBehavior: 'Sends message and receives identical echo response',
    },
    {
      name: 'Binary Data Transfer',
      description: 'Test sending and receiving binary data',
      execute: async () => {
        return new Promise((resolve, reject) => {
          const testWs = new WebSocket('wss://echo.websocket.org/')
          const binaryData = new Uint8Array([1, 2, 3, 4, 5])
          const timeout = setTimeout(() => {
            testWs.close()
            reject(new Error('Binary transfer timeout'))
          }, 10000)

          testWs.onopen = () => {
            testWs.binaryType = 'arraybuffer'
            testWs.send(binaryData)
          }

          testWs.onmessage = (event) => {
            clearTimeout(timeout)
            testWs.close()
            
            if (event.data instanceof ArrayBuffer) {
              const received = new Uint8Array(event.data)
              const match = received.every((val, i) => val === binaryData[i])
              resolve({ 
                success: match, 
                sent: Array.from(binaryData), 
                received: Array.from(received),
                binaryType: testWs.binaryType
              })
            } else {
              reject(new Error('Expected binary data but received text'))
            }
          }

          testWs.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('WebSocket error during binary test'))
          }
        })
      },
      expectedBehavior: 'Sends binary data and receives identical binary response',
    },
    {
      name: 'Connection State Monitoring',
      description: 'Test WebSocket connection state changes',
      execute: async () => {
        return new Promise((resolve, reject) => {
          const testWs = new WebSocket('wss://echo.websocket.org/')
          const states: string[] = []
          let timeout: NodeJS.Timeout

          const checkState = () => {
            switch (testWs.readyState) {
              case WebSocket.CONNECTING:
                states.push('CONNECTING')
                break
              case WebSocket.OPEN:
                states.push('OPEN')
                break
              case WebSocket.CLOSING:
                states.push('CLOSING')
                break
              case WebSocket.CLOSED:
                states.push('CLOSED')
                break
            }
          }

          timeout = setTimeout(() => {
            testWs.close()
            reject(new Error('Connection state test timeout'))
          }, 10000)

          // Check initial state
          checkState()

          testWs.onopen = () => {
            checkState()
            setTimeout(() => testWs.close(), 100)
          }

          testWs.onclose = () => {
            checkState()
            clearTimeout(timeout)
            resolve({ 
              success: true, 
              states: states,
              finalState: testWs.readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN'
            })
          }

          testWs.onerror = () => {
            clearTimeout(timeout)
            checkState()
            reject(new Error('WebSocket connection state test failed'))
          }
        })
      },
      expectedBehavior: 'Tracks connection state changes from CONNECTING → OPEN → CLOSED',
    },
    {
      name: 'Invalid URL Handling',
      description: 'Test error handling for invalid WebSocket URLs',
      execute: async () => {
        return new Promise((resolve, reject) => {
          try {
            const testWs = new WebSocket('wss://invalid-websocket-url-that-does-not-exist.com/')
            const timeout = setTimeout(() => {
              testWs.close()
              resolve({ success: true, errorHandled: true })
            }, 5000)

            testWs.onopen = () => {
              clearTimeout(timeout)
              testWs.close()
              reject(new Error('Connection should not succeed for invalid URL'))
            }

            testWs.onerror = () => {
              clearTimeout(timeout)
              resolve({ success: true, errorHandled: true, url: 'invalid-url' })
            }
          } catch (error) {
            resolve({ success: true, syntaxError: true, error: error instanceof Error ? error.message : 'Unknown error' })
          }
        })
      },
      expectedBehavior: 'Properly handles connection errors for invalid URLs',
    },
  ]

  const getStateColor = (state: ConnectionState) => {
    switch (state) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStateLabel = (state: ConnectionState) => {
    switch (state) {
      case 'connected': return '🟢 Connected'
      case 'connecting': return '🟡 Connecting...'
      case 'error': return '🔴 Error'
      default: return '⚫ Disconnected'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          WebSocket API Test
        </h1>
        <p className="text-gray-600">
          Test WebSocket connectivity and real-time messaging in the LINE Mini App environment
        </p>
      </div>

      <Card title="Connection Status">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <span className={`text-sm font-bold ${getStateColor(connectionState)}`}>
              {getStateLabel(connectionState)}
            </span>
          </div>
          
          {latency !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Latency:</span>
              <span className="text-sm font-mono text-gray-700">
                {latency}ms
              </span>
            </div>
          )}

          {connectionError && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error:</span>
              <span className="text-sm text-red-600">
                {connectionError}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reconnect Attempts:</span>
            <span className="text-sm font-mono text-gray-700">
              {reconnectAttempts}
            </span>
          </div>
        </div>
      </Card>

      <Card title="API Support">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(supportStatus).map(([key, supported]) => (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-xs font-mono">{key}:</span>
              <span className={`text-xs font-bold ${supported ? 'text-green-600' : 'text-red-600'}`}>
                {supported ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="WebSocket Connection">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WebSocket URL
            </label>
            <input
              type="text"
              value={websocketUrl}
              onChange={(e) => setWebsocketUrl(e.target.value)}
              disabled={connectionState === 'connecting' || connectionState === 'connected'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono disabled:bg-gray-100"
              placeholder="wss://echo.websocket.org/"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={connectWebSocket}
              disabled={connectionState === 'connecting' || connectionState === 'connected'}
              size="sm"
            >
              Connect
            </Button>
            <Button 
              onClick={disconnectWebSocket}
              disabled={connectionState === 'disconnected' || connectionState === 'connecting'}
              size="sm"
              variant="secondary"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Message Testing">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={connectionState !== 'connected'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
              placeholder="Enter message to send..."
            />
            <Button
              onClick={sendMessage}
              disabled={connectionState !== 'connected' || !messageInput.trim()}
              size="sm"
            >
              Send
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Message History ({messages.length})</span>
            <Button onClick={clearMessages} size="sm" variant="secondary">
              Clear
            </Button>
          </div>

          <div className="h-48 border border-gray-200 rounded-md overflow-y-auto p-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-sm">No messages yet...</div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-500 font-mono text-xs">
                      [{msg.timestamp.toLocaleTimeString()}]
                    </span>
                    <span className={`ml-2 font-medium ${
                      msg.type === 'sent' ? 'text-blue-600' : 
                      msg.type === 'received' ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {msg.type === 'sent' ? '→' : msg.type === 'received' ? '←' : 'ℹ'}
                    </span>
                    <span className="ml-1 break-words">
                      {msg.content}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="API Tests">
        <div className="space-y-4">
          {testCases.map((test, index) => (
            <ApiTestCard key={index} test={test} apiName="WebSocket" />
          ))}
        </div>
      </Card>
    </div>
  )
}
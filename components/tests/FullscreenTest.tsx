'use client'

import { useState, useRef, useEffect } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import ApiTestCard from '@/components/ApiTestCard'
import { TestCase, TestResult } from '@/types'

export default function FullscreenTest() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenElement, setFullscreenElement] = useState<string | null>(null)
  const [supportStatus, setSupportStatus] = useState<Record<string, boolean>>({})
  const [lastResult, setLastResult] = useState<TestResult | null>(null)
  const [fullscreenEnabled, setFullscreenEnabled] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setIsMounted(true)
    
    const checkSupport = () => {
      if (typeof window === 'undefined') return
      
      setSupportStatus({
        requestFullscreen: 'requestFullscreen' in document.documentElement,
        exitFullscreen: 'exitFullscreen' in document,
        fullscreenEnabled: document.fullscreenEnabled ?? false,
        fullscreenElement: 'fullscreenElement' in document,
        fullscreenchange: 'onfullscreenchange' in document,
        fullscreenerror: 'onfullscreenerror' in document,
      })
      setFullscreenEnabled(document.fullscreenEnabled ?? false)
    }

    const handleFullscreenChange = () => {
      const element = document.fullscreenElement
      setIsFullscreen(!!element)
      setFullscreenElement(element ? element.tagName : null)
      
      // Force a re-render to ensure styles are properly applied/removed
      if (!element && elementRef.current) {
        // Reset any inline styles that might have been applied
        elementRef.current.style.cssText = ''
        elementRef.current.classList.remove('fullscreen-active')
        
        // Force layout recalculation
        elementRef.current.offsetHeight
        
        // Ensure the element has the correct base classes
        elementRef.current.className = 'fullscreen-test-element p-4 bg-gradient-to-r from-line-blue to-line-green text-white rounded-lg'
      }
    }

    const handleFullscreenError = (e: Event) => {
      console.error('Fullscreen error:', e)
      setLastResult({
        apiName: 'Fullscreen',
        testName: 'Fullscreen Request',
        status: 'error',
        error: 'Fullscreen request failed. This may be due to permissions or browser restrictions.',
        timestamp: new Date(),
        executionTime: 0,
      })
    }

    checkSupport()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('fullscreenerror', handleFullscreenError)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('fullscreenerror', handleFullscreenError)
    }
  }, [])

  // Additional effect to watch for fullscreen state changes
  useEffect(() => {
    if (!isFullscreen && elementRef.current) {
      // Ensure element returns to normal size when fullscreen is exited
      const element = elementRef.current
      
      // Remove any potential fullscreen styling
      element.style.width = ''
      element.style.height = ''
      element.style.maxWidth = ''
      element.style.maxHeight = ''
      element.style.position = ''
      element.style.top = ''
      element.style.left = ''
      element.style.transform = ''
      element.style.zIndex = ''
      
      // Force a reflow
      element.offsetHeight
    }
  }, [isFullscreen])

  const testCases: TestCase[] = [
    {
      name: 'Check Fullscreen API Support',
      description: 'Verify if Fullscreen API is available',
      execute: async () => {
        const support = {
          requestFullscreen: 'requestFullscreen' in document.documentElement,
          exitFullscreen: 'exitFullscreen' in document,
          fullscreenEnabled: document.fullscreenEnabled,
          fullscreenElement: 'fullscreenElement' in document,
        }
        return support
      },
      expectedBehavior: 'Returns object with API availability status',
    },
    {
      name: 'Request Fullscreen (Document)',
      description: 'Request fullscreen mode for the entire document',
      execute: async () => {
        if (!document.fullscreenEnabled) {
          throw new Error('Fullscreen is not supported or not allowed')
        }
        await document.documentElement.requestFullscreen()
        return { success: true, element: 'document' }
      },
      expectedBehavior: 'Document enters fullscreen mode',
    },
    {
      name: 'Request Fullscreen (Specific Element)',
      description: 'Request fullscreen mode for a specific element',
      execute: async () => {
        if (!elementRef.current) {
          throw new Error('Test element not available')
        }
        if (!document.fullscreenEnabled) {
          throw new Error('Fullscreen is not supported or not allowed')
        }
        await elementRef.current.requestFullscreen()
        return { success: true, element: 'div' }
      },
      expectedBehavior: 'Specific element enters fullscreen mode',
    },
    {
      name: 'Request Fullscreen with Options',
      description: 'Request fullscreen with navigation UI option',
      execute: async () => {
        if (!document.fullscreenEnabled) {
          throw new Error('Fullscreen is not supported or not allowed')
        }
        await document.documentElement.requestFullscreen({ navigationUI: 'show' })
        return { success: true, options: { navigationUI: 'show' } }
      },
      expectedBehavior: 'Enters fullscreen with navigation UI visible',
    },
    {
      name: 'Exit Fullscreen',
      description: 'Exit fullscreen mode programmatically',
      execute: async () => {
        if (!document.fullscreenElement) {
          throw new Error('Not in fullscreen mode')
        }
        await document.exitFullscreen()
        return { success: true, exited: true }
      },
      expectedBehavior: 'Exits fullscreen mode',
    },
    {
      name: 'Get Fullscreen Element',
      description: 'Get the current fullscreen element',
      execute: async () => {
        const element = document.fullscreenElement
        return {
          hasFullscreenElement: !!element,
          elementTag: element?.tagName || null,
          elementId: element?.id || null,
        }
      },
      expectedBehavior: 'Returns current fullscreen element information',
    },
    {
      name: 'Video Fullscreen',
      description: 'Request fullscreen for a video element',
      execute: async () => {
        if (!videoRef.current) {
          throw new Error('Video element not available')
        }
        if (!document.fullscreenEnabled) {
          throw new Error('Fullscreen is not supported or not allowed')
        }
        await videoRef.current.requestFullscreen()
        return { success: true, element: 'video' }
      },
      expectedBehavior: 'Video element enters fullscreen mode',
    },
  ]

  const handleQuickFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error)
    }
  }

  const handleElementFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (elementRef.current) {
        // Add a class to track fullscreen state
        elementRef.current.classList.add('fullscreen-active')
        await elementRef.current.requestFullscreen()
      }
    } catch (error) {
      console.error('Element fullscreen failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fullscreen API Test
        </h1>
        <p className="text-gray-600">
          Test the Fullscreen API functionality in the LINE Mini App environment
        </p>
      </div>

      <Card title="Current Status">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fullscreen Active:</span>
            <span className={`text-sm font-bold ${isFullscreen ? 'text-green-600' : 'text-gray-500'}`}>
              {isFullscreen ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fullscreen Element:</span>
            <span className="text-sm font-mono text-gray-700">
              {fullscreenElement || 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fullscreen Enabled:</span>
            <span className={`text-sm font-bold ${fullscreenEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {isMounted ? (fullscreenEnabled ? 'Yes' : 'No') : 'Loading...'}
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

      <Card title="Quick Actions">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleQuickFullscreen} size="sm">
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Document)'}
            </Button>
            <Button onClick={handleElementFullscreen} size="sm" variant="secondary">
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Element)'}
            </Button>
          </div>

          <div
            ref={elementRef}
            className="fullscreen-test-element p-4 bg-gradient-to-r from-line-blue to-line-green text-white rounded-lg"
          >
            <p className="font-semibold">Test Element</p>
            <p className="text-sm">This element can be made fullscreen</p>
            {isFullscreen && fullscreenElement === 'DIV' && (
              <p className="text-sm mt-2">Press ESC to exit fullscreen</p>
            )}
          </div>

          <video
            ref={videoRef}
            className="w-full rounded-lg bg-black"
            controls
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23333' width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' font-family='sans-serif' font-size='24' text-anchor='middle' dominant-baseline='middle'%3EVideo Placeholder%3C/text%3E%3C/svg%3E"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </Card>

      <Card title="API Tests">
        <div className="space-y-4">
          {testCases.map((test, index) => (
            <ApiTestCard key={index} test={test} apiName="Fullscreen" />
          ))}
        </div>
      </Card>

      {lastResult && (
        <Card title="Last Error">
          <div className="text-red-600 text-sm">
            {lastResult.error}
          </div>
        </Card>
      )}
    </div>
  )
}
import { useEffect } from 'react'

export function useTouchOptimization() {
  useEffect(() => {
    // Prevent double-tap zoom
    let lastTouchEnd = 0
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    // Add passive event listeners for better scrolling performance
    const options = { passive: true }
    document.addEventListener('touchstart', () => {}, options)
    document.addEventListener('touchmove', () => {}, options)
    document.addEventListener('touchend', preventDoubleTapZoom, false)

    // Prevent pull-to-refresh in some browsers
    document.body.style.overscrollBehavior = 'none'

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom)
      document.body.style.overscrollBehavior = 'auto'
    }
  }, [])
}
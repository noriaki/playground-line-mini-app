export function isLineApp(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  return userAgent.includes('line')
}

export function isLIFF(): boolean {
  if (typeof window === 'undefined') return false
  
  return !!(window as any).liff
}

export function getLineVersion(): string | null {
  if (typeof window === 'undefined') return null
  
  const userAgent = window.navigator.userAgent
  const match = userAgent.match(/Line\/(\d+\.\d+\.\d+)/i)
  return match ? match[1] : null
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  )
}

export function getDeviceInfo() {
  if (typeof window === 'undefined') return null
  
  return {
    isLineApp: isLineApp(),
    isLIFF: isLIFF(),
    lineVersion: getLineVersion(),
    isMobile: isMobileDevice(),
    userAgent: window.navigator.userAgent,
    platform: window.navigator.platform,
    language: window.navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  }
}
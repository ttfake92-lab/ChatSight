import { useEffect, useState } from 'react'

function syncThemeClass(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function useSystemTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const matches = window.matchMedia('(prefers-color-scheme: dark)').matches
    syncThemeClass(matches)
    return matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
      syncThemeClass(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isDark
}

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'falafel-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  return {
    theme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light')),
    isDark: theme === 'dark',
  }
}

'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    // Dark is the default; a stored choice wins.
    const stored = (localStorage.getItem('theme') as 'light' | 'dark' | null) ?? 'dark'
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  if (theme === null) return null

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex items-center justify-center w-11 h-11 rounded-control text-muted hover:text-text transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
        className
      )}
    >
      {theme === 'dark' ? (
        <Sun size={20} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon size={20} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  )
}

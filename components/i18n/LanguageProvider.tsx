'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'id'

export const LANG_KEY = 'lang'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'id'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const fromDom = document.documentElement.dataset.lang
    let stored: string | null = fromDom ?? null
    if (!stored) {
      try {
        stored = localStorage.getItem(LANG_KEY)
      } catch {
        stored = null
      }
    }
    const next: Lang = isLang(stored) ? stored : 'en'
    setLangState(next)
    document.documentElement.dataset.lang = next
    document.documentElement.lang = next === 'id' ? 'id' : 'en'

    function onStorage(e: StorageEvent) {
      if (e.key !== LANG_KEY || !isLang(e.newValue)) return
      setLangState(e.newValue)
      document.documentElement.dataset.lang = e.newValue
      document.documentElement.lang = e.newValue === 'id' ? 'id' : 'en'
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    document.documentElement.dataset.lang = next
    document.documentElement.lang = next === 'id' ? 'id' : 'en'
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      /* storage blocked: the choice still applies for this page view */
    }
  }, [])

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}

'use client'

import { useLang, type Lang } from './LanguageProvider'
import { cn } from '@/lib/cn'

const OPTIONS: { value: Lang; label: string; aria: [string, string] }[] = [
  { value: 'id', label: 'ID', aria: ['Pilih bahasa Indonesia', 'Select Indonesian'] },
  { value: 'en', label: 'EN', aria: ['Pilih bahasa Inggris', 'Select English'] },
]

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()

  return (
    <div className={cn('lang-toggle', className)} role="group" aria-label="Bahasa / Language">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="lang-btn"
          aria-pressed={lang === option.value}
          aria-label={option.aria[lang === 'id' ? 0 : 1]}
          title={option.aria[lang === 'id' ? 0 : 1]}
          onClick={() => setLang(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

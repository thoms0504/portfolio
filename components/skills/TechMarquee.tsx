'use client'

import { TechLogo } from '@/components/ui/TechLogo'
import { useLang } from '@/components/i18n/LanguageProvider'

interface TechMarqueeProps {
  names: string[]
}

/** Slow, endlessly scrolling strip of technology logos. Pauses on hover. */
export function TechMarquee({ names }: TechMarqueeProps) {
  const { lang } = useLang()
  if (names.length === 0) return null
  const loop = [...names, ...names]

  return (
    <div
      className="marquee py-6 border-y border-line"
      aria-label={lang === 'id' ? 'Teknologi yang digunakan di berbagai proyek' : 'Technologies used across projects'}
    >
      <div className="marquee-track">
        {loop.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="inline-flex items-center gap-2.5 text-muted"
            aria-hidden={i >= names.length}
          >
            <TechLogo name={name} size={22} />
            <span className="text-small font-medium whitespace-nowrap">{name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

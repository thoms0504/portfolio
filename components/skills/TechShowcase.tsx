'use client'

import { useMemo, useState } from 'react'
import { TechLogo } from '@/components/ui/TechLogo'
import { TECH_CATEGORIES, getTechVisual, type TechCategory } from '@/lib/tech'

export interface TechUsage {
  name: string
  /** Number of projects that use this technology. */
  count: number
  /** Titles of the projects that use it. */
  projects: string[]
}

interface TechShowcaseProps {
  items: TechUsage[]
}

export function TechShowcase({ items }: TechShowcaseProps) {
  const [active, setActive] = useState<'all' | TechCategory>('all')

  const enriched = useMemo(
    () => items.map((it) => ({ ...it, visual: getTechVisual(it.name) })),
    [items]
  )

  const tabs = useMemo(() => {
    const present = new Set(enriched.map((e) => e.visual.def.category))
    return [
      { key: 'all' as const, label: 'All', count: enriched.length },
      ...TECH_CATEGORIES.filter((c) => present.has(c.key)).map((c) => ({
        key: c.key,
        label: c.label,
        count: enriched.filter((e) => e.visual.def.category === c.key).length,
      })),
    ]
  }, [enriched])

  const visible = enriched.filter((e) => active === 'all' || e.visual.def.category === active)

  return (
    <div>
      <div className="seg mb-8" role="tablist" aria-label="Filter technologies by category">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            className="seg-btn"
            onClick={() => setActive(t.key)}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60 tabular-nums">{t.count}</span>
          </button>
        ))}
      </div>

      <div
        key={active}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        {visible.map((item, i) => (
          <div
            key={item.name}
            className="skill-tile hero-animate"
            style={
              {
                '--tile-color': item.visual.isDark ? 'var(--text)' : item.visual.color,
                animationDelay: `${Math.min(i, 18) * 28}ms`,
              } as React.CSSProperties
            }
            title={item.projects.join(', ')}
          >
            <div className="skill-logo">
              <TechLogo name={item.name} size={26} />
            </div>
            <div className="min-w-0">
              <p className="text-small font-semibold text-text truncate">{item.name}</p>
              <p
                className="text-xs text-muted mt-0.5"
                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
              >
                {item.count === 0
                  ? 'skill'
                  : `${item.count} ${item.count === 1 ? 'project' : 'projects'}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

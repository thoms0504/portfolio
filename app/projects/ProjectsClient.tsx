'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { Tx } from '@/components/i18n/Tx'
import { useLang } from '@/components/i18n/LanguageProvider'
import type { Project } from '@/types'

type Category = 'All' | Project['category']

interface ProjectsClientProps {
  projects: Project[]
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const { lang } = useLang()
  const [category, setCategory] = useState<Category>('All')
  const [query, setQuery] = useState('')

  const categories = useMemo<Category[]>(
    () => ['All', ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      const matchCat = category === 'All' || p.category === category
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        (p.summaryId ?? '').toLowerCase().includes(q) ||
        p.stack.some((s) => s.toLowerCase().includes(q))
      return matchCat && matchQuery
    })
  }, [projects, category, query])

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="seg"
          role="tablist"
          aria-label={lang === 'id' ? 'Filter berdasarkan kategori' : 'Filter by category'}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              className="seg-btn"
              onClick={() => setCategory(cat)}
            >
              <Tx en={cat} id={cat === 'All' ? 'Semua' : undefined} />
            </button>
          ))}
        </div>

        <label className="relative block sm:w-72">
          <span className="sr-only">
            {lang === 'id'
              ? 'Cari proyek berdasarkan judul, ringkasan, atau teknologi'
              : 'Search projects by title, summary, or technology'}
          </span>
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder={lang === 'id' ? 'Cari berdasarkan judul atau teknologi...' : 'Search by title or technology...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-small text-text placeholder:text-muted transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </label>
      </div>

      <p
        className="mb-6 text-xs text-muted"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        aria-live="polite"
      >
        <Tx
          en={`${filtered.length} ${filtered.length === 1 ? 'project' : 'projects'}${category !== 'All' ? ` in ${category}` : ''}${query ? ` matching "${query}"` : ''}`}
          id={`${filtered.length} proyek${category !== 'All' ? ` dalam ${category}` : ''}${query ? ` cocok dengan "${query}"` : ''}`}
        />
      </p>

      {filtered.length === 0 ? (
        <p className="py-12 text-body text-muted">
          <Tx
            en="No matching projects. Try a different filter."
            id="Tidak ada proyek yang cocok. Coba filter lain."
          />
        </p>
      ) : (
        <ProjectGrid projects={filtered} />
      )}
    </>
  )
}

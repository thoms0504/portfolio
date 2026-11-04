'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import type { Project } from '@/types'

type Category = 'All' | Project['category']

interface ProjectsClientProps {
  projects: Project[]
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
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
        p.stack.some((s) => s.toLowerCase().includes(q))
      return matchCat && matchQuery
    })
  }, [projects, category, query])

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="seg" role="tablist" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              className="seg-btn"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="relative block sm:w-72">
          <span className="sr-only">Search projects by title, summary, or technology</span>
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder="Search by title or technology..."
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
        {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
        {category !== 'All' ? ` in ${category}` : ''}
        {query ? ` matching "${query}"` : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="py-12 text-body text-muted">No matching projects. Try a different filter.</p>
      ) : (
        <ProjectGrid projects={filtered} />
      )}
    </>
  )
}

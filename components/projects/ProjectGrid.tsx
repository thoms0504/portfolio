'use client'

import { useCallback, useEffect, useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'
import type { Project } from '@/types'

interface ProjectGridProps {
  projects: Project[]
}

/**
 * Grid of project cards. Details open in a modal on the same page (no route change).
 * The open project is mirrored in the URL hash (#slug) so a link can point straight at it.
 */
export function ProjectGrid({ projects }: ProjectGridProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  // Open from a #slug hash on load and when the hash changes (back/forward, shared link).
  useEffect(() => {
    function fromHash() {
      const slug = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      setOpenSlug(slug && projects.some((p) => p.slug === slug) ? slug : null)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [projects])

  const open = useCallback((slug: string) => {
    setOpenSlug(slug)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${slug}`)
  }, [])

  const close = useCallback(() => {
    setOpenSlug(null)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }, [])

  const active = openSlug ? projects.find((p) => p.slug === openSlug) : undefined

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <div
            key={project.slug}
            className="reveal flex"
            style={{ transitionDelay: `${(i % 3) * 70}ms` }}
          >
            <ProjectCard project={project} onOpen={open} />
          </div>
        ))}
      </div>

      {active && <ProjectModal key={active.slug} project={active} onClose={close} />}
    </>
  )
}

'use client'

import Image from 'next/image'
import { ArrowUpRight, ImageIcon, PlayCircle } from 'lucide-react'
import { TechLogo } from '@/components/ui/TechLogo'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  onOpen: (slug: string) => void
}

const MAX_LOGOS = 6

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const year = project.period.start.slice(0, 4)
  const hasDocs = project.images.length > 0 || project.videos.length > 0
  const extra = project.stack.length - MAX_LOGOS

  return (
    <button
      type="button"
      className="pcard"
      onClick={() => onOpen(project.slug)}
      aria-haspopup="dialog"
      aria-label={`Open details for ${project.title}`}
    >
      <div className="pcard-media">
        {project.cover ? (
          <Image
            src={project.cover}
            alt=""
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="pcard-empty" aria-hidden="true">
            <div className="flex items-center gap-4">
              {project.stack.slice(0, 3).map((t) => (
                <TechLogo key={t} name={t} size={34} />
              ))}
            </div>
            <span
              className="text-xs text-faint"
              style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--text-faint)' }}
            >
              belum ada dokumentasi
            </span>
          </div>
        )}

        <span
          className="absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-medium"
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
            border: '1px solid var(--line-strong)',
            backdropFilter: 'blur(6px)',
            color: 'var(--text)',
          }}
        >
          {project.category}
        </span>

        {project.demoUrl && (
          <span
            className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
              border: '1px solid var(--accent-border)',
              backdropFilter: 'blur(6px)',
              color: 'var(--accent)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: 'var(--accent)' }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            </span>
            Live
          </span>
        )}

        {hasDocs && (
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs"
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
              border: '1px solid var(--line-strong)',
              backdropFilter: 'blur(6px)',
              color: 'var(--text-muted)',
            }}
          >
            {project.images.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <ImageIcon size={12} aria-hidden="true" />
                {project.images.length}
              </span>
            )}
            {project.videos.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <PlayCircle size={12} aria-hidden="true" />
                {project.videos.length}
              </span>
            )}
          </span>
        )}

        <span className="pcard-open">
          Lihat detail <ArrowUpRight size={13} aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 text-text">{project.title}</h3>
          {year && (
            <span
              className="mt-0.5 text-xs text-muted tabular-nums"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              {year}
            </span>
          )}
        </div>

        <p className="text-small text-muted line-clamp-3">{project.summary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {project.stack.slice(0, MAX_LOGOS).map((t) => (
            <span
              key={t}
              title={t}
              className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface-2"
            >
              <TechLogo name={t} size={15} />
            </span>
          ))}
          {extra > 0 && (
            <span
              className="px-1 text-xs text-muted"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              +{extra}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ExternalLink, FileText, ImageIcon, X } from 'lucide-react'
import { TechBadge } from '@/components/ui/TechBadge'
import { TechLogo } from '@/components/ui/TechLogo'
import { TECH_CATEGORIES, getTech } from '@/lib/tech'
import type { Project } from '@/types'

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

type Tab = 'deskripsi' | 'dokumentasi'

const mono = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } as const

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [tab, setTab] = useState<Tab>('deskripsi')
  const [viewer, setViewer] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const docCount = project.images.length + project.videos.length
  const year = project.period.start.slice(0, 4)

  const paragraphs = useMemo(
    () => project.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    [project.content]
  )

  // Stack grouped by category, in a stable category order.
  const stackGroups = useMemo(() => {
    return TECH_CATEGORIES.map((cat) => ({
      ...cat,
      items: project.stack.filter((t) => getTech(t).category === cat.key),
    })).filter((g) => g.items.length > 0)
  }, [project.stack])

  useEffect(() => setMounted(true), [])

  const closeViewerOrModal = useCallback(() => {
    if (viewer !== null) setViewer(null)
    else onClose()
  }, [viewer, onClose])

  // Scroll lock, focus handling, Escape, arrow keys and a small focus trap.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeViewerOrModal()
        return
      }
      if (viewer !== null && project.images.length > 1) {
        if (e.key === 'ArrowRight') setViewer((v) => (v === null ? v : (v + 1) % project.images.length))
        if (e.key === 'ArrowLeft')
          setViewer((v) => (v === null ? v : (v - 1 + project.images.length) % project.images.length))
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [closeViewerOrModal, viewer, project.images.length])

  if (!mounted) return null

  const titleId = `modal-title-${project.slug}`

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="modal relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-5">
          <div className="min-w-0">
            <p className="eyebrow mb-3">
              {project.category}
              {year && <span className="text-muted"> / {year}</span>}
            </p>
            <h2 id={titleId} className="text-h2 mb-4">
              {project.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <TechLogo name="GitHub" size={15} mode="on-brand" />
                  Lihat di GitHub
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  Live demo
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs" role="tablist" aria-label="Project sections">
          <button
            role="tab"
            id="tab-deskripsi"
            aria-selected={tab === 'deskripsi'}
            aria-controls="panel-deskripsi"
            className="modal-tab"
            onClick={() => setTab('deskripsi')}
          >
            Deskripsi
          </button>
          <button
            role="tab"
            id="tab-dokumentasi"
            aria-selected={tab === 'dokumentasi'}
            aria-controls="panel-dokumentasi"
            className="modal-tab"
            onClick={() => setTab('dokumentasi')}
          >
            Dokumentasi
            {docCount > 0 && (
              <span className="ml-2 rounded-full bg-surface-2 px-1.5 py-0.5 text-xs text-muted" style={mono}>
                {docCount}
              </span>
            )}
          </button>
        </div>

        {/* Panels */}
        <div className="modal-body">
          {tab === 'deskripsi' && (
            <div
              id="panel-deskripsi"
              role="tabpanel"
              aria-labelledby="tab-deskripsi"
              className="grid gap-8 p-6 md:grid-cols-[1.15fr_1fr]"
            >
              <div className="space-y-4">
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className={i === 0 ? 'text-body text-text' : 'text-body text-muted'}
                      style={{ lineHeight: 1.7 }}
                    >
                      {p}
                    </p>
                  ))
                ) : project.summary ? (
                  <p className="text-body text-text" style={{ lineHeight: 1.7 }}>
                    {project.summary}
                  </p>
                ) : (
                  <div className="callout">
                    <FileText size={18} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
                    <p className="text-small text-muted">Belum ada deskripsi untuk proyek ini.</p>
                  </div>
                )}
              </div>

              <div>
                <p className="eyebrow mb-4">Tech stack</p>
                {stackGroups.length > 0 ? (
                  <div className="space-y-4">
                    {stackGroups.map((g) => (
                      <div key={g.key}>
                        <p className="mb-2 text-xs text-muted" style={mono}>
                          {g.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {g.items.map((t) => (
                            <TechBadge key={t} tech={t} size="lg" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-muted">Belum ada data tech stack.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'dokumentasi' && (
            <div
              id="panel-dokumentasi"
              role="tabpanel"
              aria-labelledby="tab-dokumentasi"
              className="p-6"
            >
              {docCount === 0 ? (
                <div className="callout">
                  <ImageIcon size={18} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="text-small font-medium text-text">Belum ada dokumentasi</p>
                    <p className="mt-1 text-small text-muted">
                      Screenshot atau video demo untuk proyek ini belum tersedia.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {project.videos.length > 0 && (
                    <section aria-label="Video">
                      <p className="eyebrow mb-3">Video</p>
                      <div className="grid gap-4">
                        {project.videos.map((src) => (
                          <div
                            key={src}
                            className="overflow-hidden rounded-xl border border-line bg-black"
                            style={{ aspectRatio: '16 / 9' }}
                          >
                            <video
                              controls
                              preload="metadata"
                              playsInline
                              className="h-full w-full"
                              aria-label={`${project.title} demo video`}
                            >
                              <source src={src} type="video/mp4" />
                              Browser Anda tidak mendukung pemutar video.
                            </video>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {project.images.length > 0 && (
                    <section aria-label="Screenshot">
                      <p className="eyebrow mb-3">Screenshot</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {project.images.map((src, i) => (
                          <button
                            key={src}
                            type="button"
                            className="doc-thumb"
                            onClick={() => setViewer(i)}
                            aria-label={`Perbesar screenshot ${i + 1} dari ${project.images.length}`}
                          >
                            <Image
                              src={src}
                              alt={`${project.title} screenshot ${i + 1}`}
                              fill
                              className="object-cover object-top"
                              sizes="(max-width: 640px) 100vw, 440px"
                            />
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image viewer */}
        {viewer !== null && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, #000 92%, transparent)', animation: 'fade 160ms ease both' }}
            role="dialog"
            aria-modal="true"
            aria-label={`Screenshot ${viewer + 1} dari ${project.images.length}`}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setViewer(null)
            }}
          >
            <div className="relative h-full w-full p-4 sm:p-10">
              <Image
                src={project.images[viewer]}
                alt={`${project.title} screenshot ${viewer + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <button
              type="button"
              onClick={() => setViewer(null)}
              aria-label="Tutup gambar"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {project.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setViewer((viewer - 1 + project.images.length) % project.images.length)}
                  aria-label="Gambar sebelumnya"
                  className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewer((viewer + 1) % project.images.length)}
                  aria-label="Gambar berikutnya"
                  className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
                <span
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                  style={mono}
                >
                  {viewer + 1} / {project.images.length}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

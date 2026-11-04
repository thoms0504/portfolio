import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { getProfile } from '@/lib/profile'
import { getAllProjects } from '@/lib/projects'
import { HeroSection } from '@/components/hero/HeroSection'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { TechShowcase, type TechUsage } from '@/components/skills/TechShowcase'
import { TechMarquee } from '@/components/skills/TechMarquee'
import { ExperienceTimeline } from '@/components/timeline/Timeline'
import { BrandIcon, type BrandId } from '@/components/ui/BrandIcon'

export const metadata: Metadata = {
  title: 'Thomson Sibuea - Data Scientist & Full-Stack Developer',
  description:
    'Data Scientist at BPS Provinsi Lampung building data pipelines, ML and LLM applications, and the web platforms around them.',
}

export default function Home() {
  const profile = getProfile()
  const projects = getAllProjects()
  const featured = projects.filter((p) => p.featured)

  // Skills = what the projects use (with counts) plus extra skills listed in profile.json.
  const usage = new Map<string, TechUsage>()
  for (const p of projects) {
    for (const tech of p.stack) {
      const entry = usage.get(tech) ?? { name: tech, count: 0, projects: [] }
      entry.count += 1
      entry.projects.push(p.title)
      usage.set(tech, entry)
    }
  }
  for (const tech of Object.values(profile.skills).flat()) {
    if (!usage.has(tech)) usage.set(tech, { name: tech, count: 0, projects: [] })
  }
  const techUsage = Array.from(usage.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  )

  const docCount = projects.reduce((n, p) => n + p.images.length + p.videos.length, 0)
  const stats = [
    { value: projects.length, label: 'projects' },
    { value: techUsage.length, label: 'technologies' },
    { value: docCount, label: 'screenshots & demos' },
    { value: profile.githubRepos ?? 0, label: 'github repositories' },
  ]

  const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

  const channels: { id: BrandId; label: string; detail: string; href: string }[] = [
    profile.links.whatsapp && {
      id: 'whatsapp' as const,
      label: 'WhatsApp',
      detail: 'Direct chat',
      href: profile.links.whatsapp,
    },
    profile.links.linkedin && {
      id: 'linkedin' as const,
      label: 'LinkedIn',
      detail: handle(profile.links.linkedin),
      href: profile.links.linkedin,
    },
    profile.links.github && {
      id: 'github' as const,
      label: 'GitHub',
      detail: handle(profile.links.github),
      href: profile.links.github,
    },
    profile.links.instagram && {
      id: 'instagram' as const,
      label: 'Instagram',
      detail: handle(profile.links.instagram),
      href: profile.links.instagram,
    },
  ].filter(Boolean) as { id: BrandId; label: string; detail: string; href: string }[]

  return (
    <>
      <HeroSection
        name={profile.name}
        email={profile.email}
        links={profile.links}
        stats={stats}
      />

      <TechMarquee names={techUsage.map((t) => t.name)} />

      {/* Selected work */}
      <section aria-labelledby="selected-work-heading" className="section-gap">
        <div className="mx-auto max-w-content page-px">
          <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Portfolio</p>
              <h2 id="selected-work-heading" className="text-h2">
                Selected work
              </h2>
              <p className="mt-2 max-w-xl text-body text-muted">
                Click a card to see the description, tech stack, and documentation without leaving the page.
              </p>
            </div>
            <Link href="/projects" className="btn btn-secondary btn-sm">
              All {projects.length} projects
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="py-12 text-body text-muted">No featured projects yet.</p>
          ) : (
            <ProjectGrid projects={featured} />
          )}
        </div>
      </section>

      {/* Skills */}
      <section aria-labelledby="skills-heading" className="section-gap border-t border-line">
        <div className="mx-auto max-w-content page-px">
          <div className="reveal mb-10">
            <p className="eyebrow mb-3">Tech stack</p>
            <h2 id="skills-heading" className="text-h2">
              Technologies I work with
            </h2>
            <p className="mt-2 max-w-xl text-body text-muted">
              Languages, UI frameworks, backend, databases, and tools. The number on each tile shows how many projects use it.
            </p>
          </div>
          <div className="reveal">
            <TechShowcase items={techUsage} />
          </div>
        </div>
      </section>

      {/* Experience */}
      {profile.experience.length > 0 && (
        <section aria-labelledby="experience-heading" className="section-gap border-t border-line">
          <div className="mx-auto max-w-content page-px">
            <div className="reveal mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">Experience</p>
                <h2 id="experience-heading" className="text-h2">
                  Work
                </h2>
              </div>
              <Link href="/about" className="text-small text-accent hover:text-accent-strong">
                More about me
              </Link>
            </div>
            <div className="reveal">
              <ExperienceTimeline items={profile.experience.slice(0, 3)} />
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section
        aria-labelledby="contact-cta-heading"
        className="section-gap relative overflow-hidden border-t border-line"
      >
        <div className="grid-bg absolute inset-0" aria-hidden="true" />
        <div
          className="hero-blob animate-pulse-glow"
          style={{ width: 460, height: 460, right: -120, top: -120, background: 'var(--accent-glow)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-content page-px">
          <div className="grid items-start gap-10 md:grid-cols-[1fr_340px]">
            <div className="reveal">
              <p className="eyebrow mb-3">Let&apos;s collaborate</p>
              <h2 id="contact-cta-heading" className="text-h1 mb-4">
                Have a project in mind?
              </h2>
              <p className="mb-8 max-w-xl text-body text-muted">
                Open to collaboration, freelance projects, and full-time roles. Send a message by email or
                through one of the channels alongside.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={`mailto:${profile.email}`} className="btn btn-primary">
                  <Mail size={16} aria-hidden="true" />
                  Send email
                </a>
                <Link href="/contact" className="btn btn-secondary">
                  Contact page
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <ul className="reveal flex flex-col gap-2.5" style={{ transitionDelay: '100ms' }}>
              {channels.map((c) => (
                <li key={c.id}>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="link-card">
                    <span
                      className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-line bg-surface-2"
                    >
                      <BrandIcon id={c.id} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-small font-medium text-text">{c.label}</span>
                      <span
                        className="block truncate text-xs text-muted"
                        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                      >
                        {c.detail}
                      </span>
                    </span>
                    <ArrowUpRight size={15} className="text-faint" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

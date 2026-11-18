import type { Metadata } from 'next'
import { getLocalizedProfile } from '@/lib/profile-i18n'
import { getAllProjects } from '@/lib/projects'
import { Tx } from '@/components/i18n/Tx'
import { ExperienceTimeline, EducationTimeline } from '@/components/timeline/Timeline'
import { SkillGroup } from '@/components/skills/SkillGroup'
import { CertificationList } from '@/components/certifications/CertificationList'
import { PrintButton } from '@/components/ui/PrintButton'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume of Thomson Sibuea: summary, experience, education, certifications, projects and skills.',
}

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function ResumePage() {
  const { en: profile, id: profileId } = getLocalizedProfile()
  const projects = getAllProjects()

  const contact = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'GitHub', value: strip(profile.links.github), href: profile.links.github },
    { label: 'LinkedIn', value: strip(profile.links.linkedin), href: profile.links.linkedin },
    profile.links.orcid && { label: 'ORCID', value: strip(profile.links.orcid), href: profile.links.orcid },
  ].filter(Boolean) as { label: string; value: string; href: string }[]

  return (
    <div className="mx-auto max-w-content page-px pb-24 pt-28">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="eyebrow mb-4 no-print">
            <Tx en="Resume" id="CV" />
          </p>
          <h1 className="text-h1 mb-2">{profile.name}</h1>
          <p className="max-w-prose text-body text-muted">
            <Tx en={profile.headline} id={profileId.headline} />
          </p>
          <p className="mt-2 text-small text-muted">{profile.location}</p>
        </div>
        <PrintButton className="btn btn-secondary no-print flex-shrink-0" />
      </div>

      {/* Contact */}
      <ul
        className="mb-12 flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 text-small"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {contact.map((c) => (
          <li key={c.label}>
            <span className="text-muted">{c.label}: </span>
            <a href={c.href} className="text-text no-underline hover:text-accent">
              {c.value}
            </a>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <section aria-labelledby="res-sum-heading" className="mb-12 border-b border-line pb-12">
        <h2 id="res-sum-heading" className="text-h2 mb-6">
          <Tx en="Summary" id="Ringkasan" />
        </h2>
        <p className="max-w-prose whitespace-pre-line text-body text-muted">
          <Tx en={profile.about} id={profileId.about} />
        </p>
      </section>

      {/* Experience */}
      {profile.experience.length > 0 && (
        <section aria-labelledby="res-exp-heading" className="mb-12 border-b border-line pb-12">
            <h2 id="res-exp-heading" className="text-h2 mb-8">
              <Tx en="Experience" id="Pengalaman" />
            </h2>
            <ExperienceTimeline items={profile.experience} itemsId={profileId.experience} />
        </section>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <section aria-labelledby="res-edu-heading" className="mb-12 border-b border-line pb-12">
            <h2 id="res-edu-heading" className="text-h2 mb-8">
              <Tx en="Education" id="Pendidikan" />
            </h2>
            <EducationTimeline items={profile.education} itemsId={profileId.education} />
        </section>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <section aria-labelledby="res-cert-heading" className="mb-12 border-b border-line pb-12">
            <h2 id="res-cert-heading" className="text-h2 mb-8">
              <Tx en="Certifications" id="Sertifikasi" />
            </h2>
          <CertificationList items={profile.certifications} />
        </section>
      )}

      {/* Projects */}
      <section aria-labelledby="res-proj-heading" className="mb-12 border-b border-line pb-12">
        <h2 id="res-proj-heading" className="text-h2 mb-8">
          <Tx en="Projects" id="Proyek" />
        </h2>
        <ul className="flex flex-col gap-6">
          {projects.map((p) => (
            <li key={p.slug} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-h3 text-text">{p.title}</h3>
                <span
                  className="text-xs text-muted"
                  style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                >
                  {p.stack.slice(0, 6).join(' / ')}
                </span>
              </div>
              <p className="mt-1 max-w-prose text-small text-muted">
                <Tx en={p.summary} id={p.summaryId} />
              </p>
              {(p.demoUrl || p.repoUrl) && (
                <p
                  className="mt-1 text-xs"
                  style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                >
                  {p.demoUrl && (
                    <a href={p.demoUrl} className="mr-4 text-accent no-underline hover:underline">
                      {strip(p.demoUrl)}
                    </a>
                  )}
                  {p.repoUrl && (
                    <a href={p.repoUrl} className="text-accent no-underline hover:underline">
                      {strip(p.repoUrl)}
                    </a>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Skills */}
      <section aria-labelledby="res-skills-heading">
        <h2 id="res-skills-heading" className="text-h2 mb-8">
          <Tx en="Skills" id="Keahlian" />
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <SkillGroup label="Languages" labelId="Bahasa pemrograman" items={profile.skills.languages} />
          <SkillGroup label="Frameworks, UI & backend" labelId="Framework, UI & backend" items={profile.skills.frameworks} />
          <SkillGroup label="Databases" labelId="Database" items={profile.skills.databases} />
          <SkillGroup label="AI / ML" items={profile.skills.ai ?? []} />
          <SkillGroup label="Geospatial" items={profile.skills.geospatial ?? []} />
          <SkillGroup label="Tools" items={profile.skills.tools} />
        </div>
      </section>
    </div>
  )
}

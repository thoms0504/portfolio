import type { Metadata } from 'next'
import Image from 'next/image'
import { getProfile } from '@/lib/profile'
import { ExperienceTimeline, EducationTimeline } from '@/components/timeline/Timeline'
import { SkillGroup } from '@/components/skills/SkillGroup'
import { CertificationList } from '@/components/certifications/CertificationList'

export const metadata: Metadata = {
  title: 'About',
  description: 'Background, experience, education, certifications, and skills of Thomson Sibuea, software engineer.',
}

export default function AboutPage() {
  const profile = getProfile()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.headline,
    email: profile.email,
    sameAs: Object.values(profile.links),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-24 max-w-content mx-auto page-px">
        {/* Header */}
        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start pb-12 border-b border-line">
          <div>
            <h1 className="text-h1 mb-4">About</h1>
            <p className="text-body text-muted max-w-prose whitespace-pre-line">{profile.about}</p>
            <div className="flex items-center gap-3 mt-4 text-small text-muted">
              <span>{profile.location}</span>
            </div>
          </div>
          <div
            className="relative rounded-media overflow-hidden border border-line bg-surface w-[180px] md:w-[220px]"
            style={{ aspectRatio: '4/5' }}
          >
            <Image
              src="/images/profile_new.png"
              alt="Thomson Sibuea"
              fill
              className="object-cover object-top"
              sizes="220px"
            />
          </div>
        </div>

        {/* Experience */}
        {profile.experience.length > 0 && (
          <section aria-labelledby="exp-heading" className="py-12 border-b border-line">
            <h2 id="exp-heading" className="text-h2 mb-8">
              Experience
            </h2>
            <ExperienceTimeline items={profile.experience} />
          </section>
        )}

        {/* Education */}
        {profile.education.length > 0 && (
          <section aria-labelledby="edu-heading" className="py-12 border-b border-line">
            <h2 id="edu-heading" className="text-h2 mb-8">
              Education
            </h2>
            <EducationTimeline items={profile.education} />
          </section>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <section aria-labelledby="cert-heading" className="py-12 border-b border-line">
            <h2 id="cert-heading" className="text-h2 mb-8">
              Certifications
            </h2>
            <CertificationList items={profile.certifications} />
          </section>
        )}

        {/* Skills */}
        <section aria-labelledby="skills-heading" className="py-12">
          <h2 id="skills-heading" className="text-h2 mb-8">
            Skills
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <SkillGroup label="Languages" items={profile.skills.languages} />
            <SkillGroup label="Frameworks, UI & backend" items={profile.skills.frameworks} />
            <SkillGroup label="Databases" items={profile.skills.databases} />
            <SkillGroup label="AI / ML" items={profile.skills.ai ?? []} />
            <SkillGroup label="Geospatial" items={profile.skills.geospatial ?? []} />
            <SkillGroup label="Tools" items={profile.skills.tools} />
          </div>
        </section>
      </div>
    </>
  )
}

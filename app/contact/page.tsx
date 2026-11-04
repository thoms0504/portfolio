import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { getProfile } from '@/lib/profile'
import { ContactForm } from '@/components/contact-form/ContactForm'
import { BrandIcon, type BrandId } from '@/components/ui/BrandIcon'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Thomson Sibuea for collaboration, freelance projects, or full-time roles.',
}

export default function ContactPage() {
  const profile = getProfile()
  const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

  const channels = (
    [
      {
        id: 'email',
        label: 'Email',
        detail: profile.email,
        note: 'Best for detailed project briefs',
        href: `mailto:${profile.email}`,
        external: false,
      },
      profile.links.whatsapp && {
        id: 'whatsapp',
        label: 'WhatsApp',
        detail: 'Direct chat',
        note: 'Quick discussion',
        href: profile.links.whatsapp,
        external: true,
      },
      profile.links.linkedin && {
        id: 'linkedin',
        label: 'LinkedIn',
        detail: handle(profile.links.linkedin),
        note: 'Professional network',
        href: profile.links.linkedin,
        external: true,
      },
      profile.links.github && {
        id: 'github',
        label: 'GitHub',
        detail: handle(profile.links.github),
        note: 'Code and project repositories',
        href: profile.links.github,
        external: true,
      },
      profile.links.instagram && {
        id: 'instagram',
        label: 'Instagram',
        detail: handle(profile.links.instagram),
        note: 'Updates and activities',
        href: profile.links.instagram,
        external: true,
      },
    ] as const
  ).filter(Boolean) as {
    id: BrandId
    label: string
    detail: string
    note: string
    href: string
    external: boolean
  }[]

  return (
    <div className="mx-auto max-w-content page-px pb-24 pt-28">
      <div className="mb-14 max-w-2xl">
        <p className="eyebrow mb-4">Let&apos;s work together</p>
        <h1 className="text-h1 mb-4">Get in touch</h1>
        <p className="text-body text-muted">
          Open to collaboration, freelance projects, and full-time roles. Whether you have a clear brief or
          just an idea, reach out through one of the channels below or send a message through the form.
        </p>
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <h2 className="text-h3 mb-5">Contact me</h2>
          <ul className="flex flex-col gap-2.5">
            {channels.map((c) => (
              <li key={c.id}>
                <a
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                  className="link-card"
                >
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-line bg-surface-2">
                    <BrandIcon id={c.id} size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-medium leading-tight text-text">{c.label}</span>
                    <span
                      className="block truncate text-xs text-muted"
                      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                      {c.detail}
                    </span>
                    <span className="mt-0.5 block text-xs text-faint">{c.note}</span>
                  </span>
                  <ArrowUpRight size={16} className="text-faint" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-h3 mb-2">Send a message</h2>
          <p className="mb-6 text-small text-muted">
            Tell me about your project, idea, or collaboration opportunity.
          </p>
          {profile.links.whatsapp ? (
            <ContactForm whatsappUrl={profile.links.whatsapp} />
          ) : (
            <p className="text-body text-muted">Use one of the listed channels to reach me.</p>
          )}
        </div>
      </div>
    </div>
  )
}

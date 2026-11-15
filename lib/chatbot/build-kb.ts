import { getProfile } from '@/lib/profile'
import { getAllProjects } from '@/lib/projects'
import { getCredentialUrl } from '@/lib/issuers'
import type { Kb, KbDoc } from './types'

/** Server-side only (reads the content folder). Run at build time by app/api/chatbot-kb/route.ts. */
export function buildKb(): Kb {
  const profile = getProfile()
  const projects = getAllProjects()
  const docs: KbDoc[] = []

  profile.about
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((p, i) => {
      docs.push({ id: `about-${i}`, kind: 'about', title: 'About Thomson', text: p, href: '/about' })
    })

  for (const p of projects) {
    docs.push({
      id: `project-${p.slug}`,
      kind: 'project',
      title: p.title,
      text: [p.title, p.summary, p.category, p.stack.join(' '), p.content].join('. '),
      ref: p.slug,
      href: `/projects#${p.slug}`,
    })
  }

  profile.experience.forEach((e, i) => {
    docs.push({
      id: `experience-${i}`,
      kind: 'experience',
      title: `${e.role} at ${e.company}`,
      text: [e.role, e.company, e.type, e.period, e.location, e.description, ...(e.highlights ?? [])]
        .filter(Boolean)
        .join('. '),
      ref: String(i),
      href: '/about',
    })
  })

  profile.education.forEach((e, i) => {
    docs.push({
      id: `education-${i}`,
      kind: 'education',
      title: e.institution,
      text: [e.institution, e.degree, e.period, e.description, ...(e.highlights ?? [])].filter(Boolean).join('. '),
      ref: String(i),
      href: '/about',
    })
  })

  const certifications = (profile.certifications ?? []).map((c) => ({ ...c, url: getCredentialUrl(c) }))
  certifications.forEach((c, i) => {
    docs.push({
      id: `certification-${i}`,
      kind: 'certification',
      title: c.name,
      text: [c.name, c.issuer, `issued ${c.issued}`, c.expires ? `expires ${c.expires}` : '', 'certificate certification credential']
        .filter(Boolean)
        .join('. '),
      ref: String(i),
      href: '/certifications',
    })
  })

  const skillLabels: Record<string, string> = {
    languages: 'Programming languages',
    frameworks: 'Frameworks, UI and backend',
    databases: 'Databases',
    ai: 'AI and machine learning',
    geospatial: 'Geospatial',
    tools: 'Tools',
  }
  for (const [key, items] of Object.entries(profile.skills)) {
    if (!items?.length) continue
    docs.push({
      id: `skills-${key}`,
      kind: 'skills',
      title: skillLabels[key] ?? key,
      text: `${skillLabels[key] ?? key}: ${items.join(', ')}`,
      ref: key,
      href: '/#skills-heading',
    })
  }

  docs.push({
    id: 'contact',
    kind: 'contact',
    title: 'Contact',
    text: `Contact ${profile.name} by email ${profile.email}, WhatsApp, LinkedIn, GitHub or Instagram. Location ${profile.location}.`,
    href: '/contact',
  })
  docs.push(
    {
      id: 'faq-availability',
      kind: 'faq',
      title: 'Availability',
      text: 'Open to collaboration, freelance projects and full-time roles. Hire or work with Thomson by email or WhatsApp.',
      href: '/contact',
    },
    {
      id: 'faq-articles',
      kind: 'faq',
      title: 'Articles and opinions',
      text: 'The Articles section for opinion pieces and articles is still in development and coming soon.',
      href: '/articles',
    },
    {
      id: 'faq-resume',
      kind: 'faq',
      title: 'Resume',
      text: 'A print-friendly resume with summary, experience, education, certifications, projects and skills is on the Resume page. It can be printed or saved as PDF.',
      href: '/resume',
    }
  )

  const techs = Array.from(
    new Set([...projects.flatMap((p) => p.stack), ...Object.values(profile.skills).flat()])
  )

  return {
    name: profile.name,
    headline: profile.headline,
    about: profile.about,
    location: profile.location,
    email: profile.email,
    githubRepos: profile.githubRepos,
    links: profile.links,
    experience: profile.experience,
    education: profile.education,
    certifications,
    skills: profile.skills,
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      category: p.category,
      featured: Boolean(p.featured),
      order: p.order ?? 999,
      start: p.period.start,
      end: p.period.end,
      stack: p.stack,
      repoUrl: p.repoUrl,
      demoUrl: p.demoUrl,
      description: p.content,
      mediaCount: p.images.length + p.videos.length,
    })),
    techs,
    docs,
  }
}

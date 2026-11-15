import type { Certification, Education, Experience, Profile } from '@/types'

export type Lang = 'en' | 'id'

export interface KbProject {
  slug: string
  title: string
  summary: string
  category: string
  featured: boolean
  order: number
  start: string
  end: string
  stack: string[]
  repoUrl?: string
  demoUrl?: string
  /** Full MDX body, paragraphs separated by blank lines. */
  description: string
  /** Number of screenshots + videos. */
  mediaCount: number
}

export interface KbCertification extends Certification {
  /** Verification link, resolved at build time. */
  url?: string
}

export type KbDocKind =
  | 'about'
  | 'project'
  | 'experience'
  | 'education'
  | 'certification'
  | 'skills'
  | 'contact'
  | 'faq'

/** One retrievable chunk of the portfolio. */
export interface KbDoc {
  id: string
  kind: KbDocKind
  title: string
  text: string
  /** Index or slug of the underlying record. */
  ref?: string
  href?: string
}

/** Everything the chatbot knows. Built at build time and shipped as JSON; no network calls at runtime. */
export interface Kb {
  name: string
  headline: string
  about: string
  location: string
  email: string
  githubRepos?: number
  links: Record<string, string>
  experience: Experience[]
  education: Education[]
  certifications: KbCertification[]
  skills: Profile['skills']
  projects: KbProject[]
  /** Every technology named in a project stack or in the skills list. */
  techs: string[]
  docs: KbDoc[]
}

/** Small state echoed back by the client so follow-up questions ("and its stack?") work. */
export interface ChatContext {
  lang?: Lang
  /** Slug of the project last talked about. */
  project?: string
  /** Slugs of the projects in the last list, for "the second one". */
  list?: string[]
}

export interface ChatLink {
  label: string
  href: string
  external?: boolean
}

export interface ChatReply {
  /** Lightweight markdown: paragraphs, "- " bullets and **bold**. */
  answer: string
  links: ChatLink[]
  suggestions: string[]
  /** False when the question was outside the portfolio. */
  inScope: boolean
  context: ChatContext
}

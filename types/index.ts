export interface ProjectFrontmatter {
  title: string
  slug: string
  summary: string
  category: 'Web' | 'Backend' | 'Data/AI' | 'Automation' | 'Other'
  featured: boolean
  /** Lower numbers appear first. */
  order?: number
  period: { start: string; end: string }
  stack: string[]
  repoUrl?: string
  demoUrl?: string
}

export interface Project extends ProjectFrontmatter {
  /** Short description (1-2 paragraphs) from the MDX body. */
  content: string
  /** Screenshots discovered in public/projects/<slug>/ (URL-encoded paths). */
  images: string[]
  /** Videos discovered in public/projects/<slug>/ (URL-encoded paths). */
  videos: string[]
  /** First screenshot, or empty string when the project has no documentation yet. */
  cover: string
}

export interface Experience {
  company: string
  role: string
  period: string
  description: string
  /** Employment type, e.g. Full-time, Contract, Internship. */
  type?: string
  /** City and work mode, e.g. "Lampung, Indonesia · On-site". */
  location?: string
  /** Bullet-point responsibilities / accomplishments. */
  highlights?: string[]
}

export interface Education {
  institution: string
  degree: string
  period: string
  /** Extra line such as grade or thesis. */
  description?: string
  /** Bullet points, e.g. activities and societies. */
  highlights?: string[]
}

export interface Certification {
  name: string
  issuer: string
  /** Issue date, e.g. "Jul 2024". */
  issued: string
  /** Expiry date, e.g. "Jul 2027". Omit when the credential does not expire. */
  expires?: string
  credentialId?: string
  /** Link to verify the credential. */
  credentialUrl?: string
}

export interface Profile {
  name: string
  headline: string
  about: string
  location: string
  email: string
  githubRepos?: number
  links: { github: string; linkedin: string; [key: string]: string }
  experience: Experience[]
  education: Education[]
  certifications?: Certification[]
  skills: {
    languages: string[]
    frameworks: string[]
    databases: string[]
    ai?: string[]
    geospatial?: string[]
    tools: string[]
  }
}

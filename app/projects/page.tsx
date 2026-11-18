import type { Metadata } from 'next'
import { getAllProjects } from '@/lib/projects'
import { ProjectsClient } from './ProjectsClient'
import { Tx } from '@/components/i18n/Tx'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Selected projects by Thomson Sibuea: data and AI systems, backend services, and web platforms.',
}

export default function ProjectsPage() {
  const projects = getAllProjects()
  return (
    <div className="mx-auto max-w-content page-px pb-24 pt-28">
      <p className="eyebrow mb-4">
        <Tx en="Portfolio" id="Portofolio" />
      </p>
      <h1 className="text-h1 mb-3">
        <Tx en="Projects" id="Proyek" />
      </h1>
      <p className="mb-10 max-w-prose text-body text-muted">
        <Tx
          en={`${projects.length} projects. Click a card to see the description, tech stack, and documentation.`}
          id={`${projects.length} proyek. Klik kartu untuk melihat deskripsi, tech stack, dan dokumentasi.`}
        />
      </p>
      <ProjectsClient projects={projects} />
    </div>
  )
}

import type { Metadata } from 'next'
import { getProfile } from '@/lib/profile'
import { CertificationList } from '@/components/certifications/CertificationList'
import { Tx } from '@/components/i18n/Tx'

export const metadata: Metadata = {
  title: 'Certifications',
  description:
    'Licenses and certifications earned by Thomson Sibuea in data science, machine learning, AI and web development.',
}

export default function CertificationsPage() {
  const certifications = getProfile().certifications ?? []

  return (
    <div className="mx-auto max-w-content page-px pb-24 pt-28">
      <p className="eyebrow mb-4">
        <Tx en="Credentials" id="Kredensial" />
      </p>
      <h1 className="text-h1 mb-3">
        <Tx en="Certifications" id="Sertifikasi" />
      </h1>
      <p className="mb-10 max-w-prose text-body text-muted">
        <Tx
          en={`${certifications.length} licenses and certifications from DataCamp, Anthropic, freeCodeCamp, Kaggle, Progate and Dicoding.`}
          id={`${certifications.length} lisensi dan sertifikasi dari DataCamp, Anthropic, freeCodeCamp, Kaggle, Progate, dan Dicoding.`}
        />
      </p>

      {certifications.length === 0 ? (
        <p className="py-12 text-body text-muted">
          <Tx en="No certifications yet." id="Belum ada sertifikasi." />
        </p>
      ) : (
        <CertificationList items={certifications} />
      )}
    </div>
  )
}

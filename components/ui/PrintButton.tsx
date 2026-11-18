import { Download } from 'lucide-react'
import { Tx } from '@/components/i18n/Tx'

/** Downloads the resume PDF served from public/. */
export function PrintButton({ className }: { className?: string }) {
  return (
    <a href="/ThomsonSibuea_Resume.pdf" download className={className ?? 'btn btn-secondary'}>
      <Download size={16} aria-hidden="true" />
      <Tx en="Download PDF" id="Unduh PDF" />
    </a>
  )
}

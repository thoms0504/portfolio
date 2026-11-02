import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="pt-24 min-h-[60vh] flex flex-col items-center justify-center text-center page-px">
      <p className="text-small text-muted font-mono mb-4">404</p>
      <h1 className="text-h1 mb-4">Page not found</h1>
      <p className="text-body text-muted max-w-sm mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button as="a" href="/" variant="primary">
        Back to home
      </Button>
    </div>
  )
}

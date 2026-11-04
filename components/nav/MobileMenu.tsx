'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/cn'

export interface NavLink {
  href: string
  label: string
  /** Optional small tag shown next to the label, e.g. "Soon". */
  badge?: string
}

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: NavLink[]
  pathname: string
}

export function MobileMenu({ open, onClose, links, pathname }: MobileMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Trap focus and close on Escape
  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-[60] bg-bg flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 page-px border-b border-line">
        <span className="font-semibold text-text text-[1.0625rem]">Thomson Sibuea</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-11 h-11 rounded-control text-muted hover:text-text transition-colors"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Links */}
      <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-6">
        {links.map(({ href, label, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'text-h3 py-3 border-b border-line transition-colors no-underline',
                active ? 'text-accent font-semibold' : 'text-text hover:text-accent'
              )}
            >
              {label}
              {badge && (
                <span className="ml-2 rounded-full border border-line bg-surface-2 px-2 py-0.5 align-middle text-[0.6875rem] font-medium uppercase leading-none tracking-wide text-muted">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
        <Link
          href="/contact"
          onClick={onClose}
          className={cn(
            'text-h3 py-3 border-b border-line transition-colors no-underline',
            pathname === '/contact' ? 'text-accent font-semibold' : 'text-text hover:text-accent'
          )}
        >
          Contact
        </Link>
      </nav>
    </div>
  )
}

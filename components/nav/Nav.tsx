'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import { useLang } from '@/components/i18n/LanguageProvider'
import { Tx } from '@/components/i18n/Tx'
import { MobileMenu, type NavLink } from './MobileMenu'
import { cn } from '@/lib/cn'

const navLinks: NavLink[] = [
  { href: '/projects', label: 'Projects', labelId: 'Proyek' },
  { href: '/about', label: 'About', labelId: 'Tentang' },
  { href: '/certifications', label: 'Certifications', labelId: 'Sertifikasi' },
  { href: '/articles', label: 'Articles', labelId: 'Artikel', badge: 'Soon', badgeId: 'Segera' },
  { href: '/resume', label: 'Resume', labelId: 'CV' },
]

export function Nav() {
  const pathname = usePathname()
  const { lang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 h-16 flex items-center',
          'nav-bar',
          scrolled && 'border-b border-line'
        )}
      >
        <div className="w-full max-w-content mx-auto page-px flex items-center justify-between gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="font-sans font-semibold text-text hover:text-accent transition-colors duration-[120ms] text-[1.0625rem] no-underline"
          >
            Thomson Sibuea
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label={lang === 'id' ? 'Navigasi utama' : 'Main navigation'}
            className="hidden lg:flex items-center gap-1"
          >
            {navLinks.map(({ href, label, labelId, badge, badgeId }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-4 py-2 text-body rounded-control transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] no-underline',
                    active
                      ? 'text-text border-b-2 border-accent font-medium'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <Tx en={label} id={labelId} />
                  {badge && (
                    <span className="ml-1.5 rounded-full border border-line bg-surface-2 px-1.5 py-0.5 align-middle text-[0.625rem] font-medium uppercase leading-none tracking-wide text-muted">
                      <Tx en={badge} id={badgeId} />
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageToggle className="hidden lg:inline-flex" />
            <ThemeToggle className="hidden lg:flex" />
            <Link
              href="/contact"
              className={cn(
                'hidden lg:inline-flex items-center h-9 px-4 rounded-control text-body font-medium',
                'border border-line text-text bg-transparent',
                'hover:bg-surface transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] no-underline'
              )}
            >
              <Tx en="Contact" id="Kontak" />
            </Link>
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-control text-muted hover:text-text transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label={lang === 'id' ? 'Buka menu navigasi' : 'Open navigation menu'}
            >
              <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
        pathname={pathname}
      />
    </>
  )
}

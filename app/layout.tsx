import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Nav } from '@/components/nav/Nav'
import { RevealObserver } from '@/components/ui/RevealObserver'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Thomson Sibuea — Data Scientist & Full-Stack Developer',
    template: '%s | Thomson Sibuea',
  },
  description:
    'Data Scientist at BPS Provinsi Lampung building intelligent end-to-end systems — ML pipelines, RAG chatbots, and production web platforms.',
  metadataBase: new URL('https://thomsonsibuea.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thomsonsibuea.com',
    siteName: 'Thomson Sibuea',
    images: [
      {
        url: '/images/profile.jpeg',
        alt: 'Thomson Sibuea',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        {/* Theme init — dark by default (Stratus-style); a saved choice wins. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);})()`,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <RevealObserver />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="border-t border-line bg-surface">
          <div className="max-w-content mx-auto page-px py-10 flex flex-col gap-6 text-small text-muted">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>Thomson Sibuea</span>
                <span className="ml-2 opacity-60">· Data Scientist & Full-Stack Developer</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="opacity-60">Lampung, Indonesia</span>
              </div>
            </div>
            <p className="border-t border-line pt-6 opacity-60">
              &copy; {new Date().getFullYear()} Thomson Sibuea. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}

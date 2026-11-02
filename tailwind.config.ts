import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        brand: 'var(--brand)',
        'brand-on': 'var(--brand-on)',
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        violet: 'var(--violet)',
        cyan: 'var(--cyan)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
        prose: '68ch',
      },
      borderRadius: {
        tag: '6px',
        control: '8px',
        media: '12px',
      },
      spacing: {
        section: '96px',
        'section-mobile': '64px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text)',
            maxWidth: '68ch',
            a: { color: 'var(--accent)' },
            h1: { color: 'var(--text)' },
            h2: { color: 'var(--text)' },
            h3: { color: 'var(--text)' },
            h4: { color: 'var(--text)' },
            code: {
              color: 'var(--text)',
              backgroundColor: 'var(--surface)',
              borderRadius: '4px',
              padding: '2px 6px',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
            },
            blockquote: {
              borderLeftColor: 'var(--line)',
              color: 'var(--text-muted)',
            },
            hr: { borderColor: 'var(--line)' },
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Download } from 'lucide-react'
import { BrandIcon, type BrandId } from '@/components/ui/BrandIcon'
import { TechLogo } from '@/components/ui/TechLogo'

const ROLES = ['Data Scientist', 'Full-Stack Developer', 'AI / LLM Engineer', 'Remote Sensing & GeoAI']

const FLOATING: { tech: string; style: React.CSSProperties; delay: string }[] = [
  { tech: 'Python', style: { top: '6%', left: '-8%' }, delay: '0s' },
  { tech: 'Next.js', style: { top: '14%', right: '-10%' }, delay: '1.2s' },
  { tech: 'FastAPI', style: { bottom: '22%', right: '-12%' }, delay: '2.1s' },
  { tech: 'TensorFlow', style: { bottom: '8%', left: '-6%' }, delay: '0.7s' },
]

export interface HeroStat {
  value: number
  label: string
}

interface HeroProps {
  name: string
  email: string
  links: Record<string, string>
  stats: HeroStat[]
}

/** Counts up from 0 once the element is visible. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setN(value)
      return
    }
    let raf = 0
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        const start = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / 1100)
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return <span ref={ref}>{n}</span>
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return Number.isNaN(n) ? [94, 234, 212] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function HeroSection({ name, email, links, stats }: HeroProps) {
  const [roleIdx, setRoleIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [first, ...rest] = name.split(' ')

  // Typewriter
  useEffect(() => {
    const target = ROLES[roleIdx]
    let t: ReturnType<typeof setTimeout>
    if (!deleting) {
      if (typed.length < target.length) t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 65)
      else t = setTimeout(() => setDeleting(true), 1900)
    } else if (typed.length > 0) {
      t = setTimeout(() => setTyped(typed.slice(0, -1)), 32)
    } else {
      setDeleting(false)
      setRoleIdx((i) => (i + 1) % ROLES.length)
    }
    return () => clearTimeout(t)
  }, [typed, deleting, roleIdx])

  // Particle network, tinted with the current accent colour.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let rgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent'))
    const pts: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = []

    const readAccent = () => {
      rgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent'))
    }
    const themeObs = new MutationObserver(readAccent)
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const init = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      pts.length = 0
      const count = Math.min(90, Math.floor((w * h) / 14000))
      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.4 + 0.5,
          a: Math.random() * 0.5 + 0.2,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const [r, g, b] = rgb
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`
        ctx.fill()
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.hypot(dx, dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.16 * (1 - d / 110)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }

    init()
    draw()
    const ro = new ResizeObserver(init)
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      themeObs.disconnect()
    }
  }, [])

  const socials: { id: BrandId; href?: string; label: string }[] = [
    { id: 'github', href: links.github, label: 'GitHub' },
    { id: 'linkedin', href: links.linkedin, label: 'LinkedIn' },
    { id: 'instagram', href: links.instagram, label: 'Instagram' },
    { id: 'whatsapp', href: links.whatsapp, label: 'WhatsApp' },
    { id: 'email', href: email ? `mailto:${email}` : undefined, label: 'Email' },
  ]

  return (
    <section aria-label="Introduction" className="relative flex min-h-[94vh] flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.55 }}
        aria-hidden="true"
      />
      <div
        className="hero-blob animate-pulse-glow"
        style={{ width: 520, height: 520, top: -160, left: -120, background: 'var(--accent-glow)' }}
        aria-hidden="true"
      />
      <div
        className="hero-blob animate-pulse-glow"
        style={{
          width: 420,
          height: 420,
          bottom: -140,
          right: '8%',
          background: 'color-mix(in srgb, var(--cyan) 14%, transparent)',
          animationDelay: '2s',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-content page-px pb-16 pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div>
            <div
              className="hero-animate mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
              style={{
                borderColor: 'var(--accent-border)',
                background: 'var(--accent-surface)',
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '0.75rem',
                color: 'var(--accent)',
                letterSpacing: '0.04em',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ background: 'var(--accent)' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />
              </span>
              Open to opportunities
            </div>

            <h1 className="hero-animate text-display mb-4" style={{ animationDelay: '70ms' }}>
              {first}
              <br />
              <span className="gradient-text">{rest.join(' ')}</span>
            </h1>

            <p
              className="hero-animate mb-6 h-8 text-h3"
              style={{
                animationDelay: '140ms',
                fontFamily: 'var(--font-geist-mono), monospace',
                fontWeight: 500,
                color: 'var(--text-muted)',
              }}
              aria-label={ROLES.join(', ')}
            >
              <span style={{ color: 'var(--accent)' }}>&gt;</span> {typed}
              <span
                className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse"
                style={{ background: 'var(--accent)' }}
              />
            </p>

            <p
              className="hero-animate mb-9 max-w-xl text-body text-muted"
              style={{ animationDelay: '210ms' }}
            >
              Data Scientist and IT Specialist at BPS Provinsi Lampung. I build data pipelines, ML and GeoAI
              applications, and the web platforms around them, from the model to the interface.
            </p>

            <div className="hero-animate mb-9 flex flex-wrap gap-3" style={{ animationDelay: '280ms' }}>
              <Link href="/projects" className="btn btn-primary">
                View projects
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href="/ThomsonSibuea_Resume.pdf" download className="btn btn-secondary">
                <Download size={16} aria-hidden="true" />
                Resume
              </a>
            </div>

            <div className="hero-animate flex items-center gap-2.5" style={{ animationDelay: '350ms' }}>
              {socials
                .filter((s) => s.href)
                .map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target={s.id === 'email' ? undefined : '_blank'}
                    rel={s.id === 'email' ? undefined : 'noopener noreferrer'}
                    aria-label={s.label}
                    title={s.label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-line-strong bg-surface text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-text"
                  >
                    <BrandIcon id={s.id} size={18} />
                  </a>
                ))}
            </div>
          </div>

          {/* Right: photo */}
          <div className="hero-animate relative mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[340px]" style={{ animationDelay: '120ms' }}>
            <div
              className="absolute -inset-6 rounded-[32px] animate-pulse-glow"
              style={{ background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)' }}
              aria-hidden="true"
            />
            <div
              className="relative overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--line-strong)', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div
                className="flex items-center gap-1.5 border-b px-3.5 py-2.5"
                style={{ borderColor: 'var(--line)', background: 'var(--surface-2)' }}
                aria-hidden="true"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#febc2e' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
                <span
                  className="ml-2 text-xs"
                  style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--text-faint)' }}
                >
                  ~/thomson/profile
                </span>
              </div>
              <div className="relative" style={{ aspectRatio: '4 / 5' }}>
                <Image
                  src="/images/profile_new.png"
                  alt={`Portrait of ${name}`}
                  fill
                  className="object-cover object-top"
                  sizes="340px"
                  priority
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3"
                  style={{ background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--bg) 55%, transparent))' }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {FLOATING.map((f) => (
              <div
                key={f.tech}
                className="animate-float absolute hidden items-center gap-2 rounded-xl border px-3 py-2 lg:flex"
                style={{
                  ...f.style,
                  animationDelay: f.delay,
                  background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
                  borderColor: 'var(--line-strong)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                }}
              >
                <TechLogo name={f.tech} size={18} />
                <span className="text-xs font-medium text-text">{f.tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div
          className="hero-animate mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border sm:grid-cols-4"
          style={{ borderColor: 'var(--line)', background: 'var(--line)', animationDelay: '460ms' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="px-5 py-5" style={{ background: 'var(--surface)' }}>
              <div className="text-h1 gradient-text tabular-nums" style={{ lineHeight: 1.1 }}>
                <CountUp value={s.value} />
              </div>
              <div
                className="mt-1 text-xs text-muted"
                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-bounce-subtle absolute bottom-6 left-1/2 -translate-x-1/2 text-faint" aria-hidden="true">
        <ChevronDown size={22} />
      </div>
    </section>
  )
}

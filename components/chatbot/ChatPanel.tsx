'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, RotateCcw, Send, X } from 'lucide-react'
import { createEngine, type Engine } from '@/lib/chatbot/engine'
import type { ChatContext, ChatLink, ChatReply, Kb, Lang } from '@/lib/chatbot/types'
import { useLang } from '@/components/i18n/LanguageProvider'
import { cn } from '@/lib/cn'

interface Message {
  id: number
  role: 'user' | 'bot'
  text: string
  links?: ChatLink[]
  inScope?: boolean
}

interface Saved {
  messages: Message[]
  suggestions: string[]
  context: ChatContext
}

const STORAGE_KEY = 'portfolio-chat-v1'
const MAX_INPUT = 300

const welcomeText = (lang: Lang) =>
  lang === 'id'
    ? "Hai! Saya asisten portofolio. Tanyakan proyek, pengalaman, pendidikan, sertifikasi, keahlian Thomson, atau cara menghubunginya."
    : "Hi! I'm the portfolio assistant. Ask me about Thomson's projects, experience, education, certifications, skills or how to contact him."

interface ChatPanelProps {
  open: boolean
  onClose: () => void
}

/** Renders **bold** inside a line. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-text">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

/** Tiny markdown subset: paragraphs, "- " bullets and **bold**. No HTML is ever injected. */
function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)
  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim())
        const groups: { bullets: boolean; lines: string[] }[] = []
        for (const line of lines) {
          const bullet = line.startsWith('- ')
          const last = groups[groups.length - 1]
          if (last && last.bullets === bullet) last.lines.push(bullet ? line.slice(2) : line)
          else groups.push({ bullets: bullet, lines: [bullet ? line.slice(2) : line] })
        }
        return groups.map((g, gi) =>
          g.bullets ? (
            <ul key={`${bi}-${gi}`} className="space-y-1.5 pl-4" style={{ listStyleType: 'disc' }}>
              {g.lines.map((l, li) => (
                <li key={li} className="pl-0.5">
                  <Inline text={l} />
                </li>
              ))}
            </ul>
          ) : (
            <p key={`${bi}-${gi}`}>
              {g.lines.map((l, li) => (
                <span key={li}>
                  {li > 0 && <br />}
                  <Inline text={l} />
                </span>
              ))}
            </p>
          )
        )
      })}
    </div>
  )
}

export default function ChatPanel({ open, onClose }: ChatPanelProps) {
  const pathname = usePathname()
  const { lang } = useLang()
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [ready, setReady] = useState(false)

  const engineRef = useRef<Engine | null>(null)
  const ctxRef = useRef<ChatContext>({})
  const langRef = useRef<Lang>(lang)
  const messageCountRef = useRef(0)
  const idRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const welcome = useCallback((engine: Engine, language: Lang): Saved => {
    return {
      messages: [{ id: ++idRef.current, role: 'bot', text: welcomeText(language) }],
      suggestions: engine.starters(language),
      context: { lang: language },
    }
  }, [])

  const loadKb = useCallback(async () => {
    setLoadError(false)
    try {
      const res = await fetch('/api/chatbot-kb')
      if (!res.ok) throw new Error(String(res.status))
      const kb = (await res.json()) as Kb
      const engine = createEngine(kb)
      engineRef.current = engine

      let saved: Saved | null = null
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (raw) saved = JSON.parse(raw) as Saved
      } catch {
        saved = null
      }
      const state =
        saved && Array.isArray(saved.messages) && saved.messages.length
          ? saved
          : welcome(engine, langRef.current)
      idRef.current = state.messages.reduce((m, x) => Math.max(m, x.id), 0)
      ctxRef.current = state.context ?? {}
      setMessages(state.messages)
      setSuggestions(state.suggestions ?? [])
      setReady(true)
    } catch {
      setLoadError(true)
    }
  }, [welcome])

  useEffect(() => {
    loadKb()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [loadKb])

  useEffect(() => {
    messageCountRef.current = messages.length
  }, [messages])

  // Keep the assistant in step with the site-wide language choice.
  useEffect(() => {
    langRef.current = lang
    ctxRef.current = { ...ctxRef.current, lang }
    const engine = engineRef.current
    if (!engine || !ready || messageCountRef.current !== 1) return
    setMessages((prev) =>
      prev.map((m) => (m.role === 'bot' ? { ...m, text: welcomeText(lang) } : m))
    )
    setSuggestions(engine.starters(lang))
  }, [lang, ready])

  // Persist the conversation for the tab session.
  useEffect(() => {
    if (!ready) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, suggestions, context: ctxRef.current } satisfies Saved))
    } catch {
      /* storage full or blocked: the chat still works */
    }
  }, [messages, suggestions, ready])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    if (open && ready) inputRef.current?.focus()
  }, [open, ready])

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function send(raw: string) {
    const text = raw.trim().slice(0, MAX_INPUT)
    const engine = engineRef.current
    if (!text || !engine || busy) return

    setMessages((m) => [...m, { id: ++idRef.current, role: 'user', text }])
    setSuggestions([])
    setInput('')
    setBusy(true)

    const reply: ChatReply = engine.reply(text, ctxRef.current)
    ctxRef.current = reply.context
    // A short pause so the answer does not feel instant and jarring.
    const delay = Math.min(900, 280 + reply.answer.length * 0.6)
    timerRef.current = setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: ++idRef.current, role: 'bot', text: reply.answer, links: reply.links, inScope: reply.inScope },
      ])
      setSuggestions(reply.suggestions)
      setBusy(false)
    }, delay)
  }

  function reset() {
    const engine = engineRef.current
    if (!engine) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setBusy(false)
    const fresh = welcome(engine, lang)
    ctxRef.current = fresh.context
    setMessages(fresh.messages)
    setSuggestions(fresh.suggestions)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    inputRef.current?.focus()
  }

  function onLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    // A project modal is driven by the URL hash; on /projects the hash must change in place.
    const m = /^\/projects#(.+)$/.exec(href)
    if (m && pathname === '/projects') {
      e.preventDefault()
      window.location.hash = m[1]
    }
    if (window.innerWidth < 640) onClose()
  }

  const ui =
    lang === 'id'
      ? {
          dialog: 'Asisten portofolio',
          subtitle: 'Jawaban hanya dari portofolio ini. Tanpa AI eksternal.',
          newConversation: 'Mulai percakapan baru',
          newConversationTitle: 'Percakapan baru',
          close: 'Tutup asisten',
          loading: 'Memuat...',
          loadError: 'Gagal memuat data portofolio.',
          retry: 'Coba lagi',
          typing: 'Asisten sedang mengetik',
          inputLabel: 'Ajukan pertanyaan tentang portofolio',
          placeholder: 'Tanya tentang proyek, keahlian, kontak...',
          send: 'Kirim pesan',
        }
      : {
          dialog: 'Portfolio assistant',
          subtitle: 'Answers from this portfolio only. No external AI.',
          newConversation: 'Start a new conversation',
          newConversationTitle: 'New conversation',
          close: 'Close assistant',
          loading: 'Loading...',
          loadError: "I couldn't load the portfolio data.",
          retry: 'Try again',
          typing: 'Assistant is typing',
          inputLabel: 'Ask a question about the portfolio',
          placeholder: 'Ask about projects, skills, contact...',
          send: 'Send message',
        }

  const chip =
    'rounded-full border border-line-strong bg-surface px-3 py-1.5 text-left text-xs text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50'

  return (
    <div
      role="dialog"
      aria-label={ui.dialog}
      aria-modal="false"
      hidden={!open}
      className={cn(
        'no-print fixed z-[45] flex-col overflow-hidden rounded-2xl border border-line-strong bg-bg',
        open ? 'flex' : 'hidden',
        'inset-x-3 bottom-[5.5rem] top-20 sm:inset-x-auto sm:right-6 sm:top-auto sm:h-[min(36rem,calc(100vh-8rem))] sm:w-[24rem]',
        open && 'chat-pop'
      )}
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <div className="min-w-0">
          <p className="text-body font-semibold leading-tight text-text">{ui.dialog}</p>
          <p className="mt-0.5 text-xs text-muted">{ui.subtitle}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={reset}
            disabled={!ready}
            aria-label={ui.newConversation}
            title={ui.newConversationTitle}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-40"
          >
            <RotateCcw size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={ui.close}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={logRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-relevant="additions">
        {!ready && !loadError && <p className="text-small text-muted">{ui.loading}</p>}
        {loadError && (
          <div className="space-y-2">
            <p className="text-small text-muted">{ui.loadError}</p>
            <button type="button" className={chip} onClick={loadKb}>
              {ui.retry}
            </button>
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <p
                className="max-w-[85%] break-words rounded-2xl rounded-br-md px-3.5 py-2 text-small"
                style={{ background: 'var(--brand)', color: 'var(--brand-on)' }}
              >
                {m.text}
              </p>
            </div>
          ) : (
            <div key={m.id} className="flex flex-col items-start gap-2">
              <div
                className={cn(
                  'max-w-[92%] break-words rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-small leading-relaxed text-muted',
                  m.inScope === false ? 'border-line-strong bg-surface' : 'border-line bg-surface-2'
                )}
              >
                <RichText text={m.text} />
              </div>
              {m.links && m.links.length > 0 && (
                <div className="flex max-w-[92%] flex-wrap gap-1.5">
                  {m.links.map((l) =>
                    l.external ? (
                      <a
                        key={l.href + l.label}
                        href={l.href}
                        target={l.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        className="chat-link"
                      >
                        {l.label}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        onClick={(e) => onLinkClick(e, l.href)}
                        className="chat-link"
                      >
                        {l.label}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          )
        )}

        {busy && (
          <div className="flex items-center gap-1 px-1" aria-label={ui.typing} role="status">
            <span className="chat-dot" />
            <span className="chat-dot" style={{ animationDelay: '120ms' }} />
            <span className="chat-dot" style={{ animationDelay: '240ms' }} />
          </div>
        )}

        {!busy && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestions.map((s) => (
              <button key={s} type="button" className={chip} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="flex items-center gap-2 border-t border-line bg-surface px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          {ui.inputLabel}
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_INPUT}
          autoComplete="off"
          placeholder={ui.placeholder}
          disabled={!ready}
          className="h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-bg px-3 text-small text-text placeholder:text-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!ready || busy || !input.trim()}
          aria-label={ui.send}
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg transition-opacity disabled:opacity-40"
          style={{ background: 'var(--brand)', color: 'var(--brand-on)' }}
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

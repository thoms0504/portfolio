'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MessageCircle, X } from 'lucide-react'
import { useLang } from '@/components/i18n/LanguageProvider'

// The panel (and the chatbot engine) is only downloaded the first time the button is clicked.
const ChatPanel = dynamic(() => import('./ChatPanel'), { ssr: false })

const NUDGE_KEY = 'portfolio-chat-nudge'

/** Floating chat button, fixed to the bottom-right corner on every page. */
export function ChatWidget() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const [nudge, setNudge] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // A one-time hint next to the button, shown after a few seconds on the first visit.
  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(NUDGE_KEY) === '1'
    } catch {
      seen = true
    }
    if (seen) return
    const show = setTimeout(() => setNudge(true), 4000)
    const hide = setTimeout(() => setNudge(false), 14000)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [])

  const dismissNudge = useCallback(() => {
    setNudge(false)
    try {
      localStorage.setItem(NUDGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(() => {
    setOpen((o) => !o)
    setEverOpened(true)
    dismissNudge()
  }, [dismissNudge])

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  return (
    <>
      {everOpened && <ChatPanel open={open} onClose={close} />}

      <div className="no-print fixed bottom-5 right-4 z-[46] flex items-center gap-3 sm:bottom-6 sm:right-6">
        {nudge && !open && (
          <button
            type="button"
            onClick={toggle}
            className="chat-pop hidden rounded-full border border-line-strong bg-surface px-3.5 py-2 text-small text-text sm:block"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {lang === 'id' ? 'Tanya saya tentang portofolio ini' : 'Ask me about this portfolio'}
          </button>
        )}
        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          aria-label={
            lang === 'id'
              ? open
                ? 'Tutup asisten portofolio'
                : 'Buka asisten portofolio'
              : open
                ? 'Close portfolio assistant'
                : 'Open portfolio assistant'
          }
          aria-expanded={open}
          className="chat-fab grid h-14 w-14 place-items-center rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          style={{ background: 'var(--brand)', color: 'var(--brand-on)', boxShadow: '0 10px 30px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.35)' }}
        >
          {open ? <X size={22} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
        </button>
      </div>
    </>
  )
}

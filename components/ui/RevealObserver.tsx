'use client'

import { useEffect } from 'react'

/**
 * Adds `in-view` to every `.reveal` element as it scrolls into view.
 *
 * A MutationObserver picks up elements added later (client-side navigation, a filter
 * that brings cards back), so nothing is ever left permanently hidden.
 */
export function RevealObserver() {
  useEffect(() => {
    const seen = new WeakSet<Element>()
    const root = document.documentElement

    if (!('IntersectionObserver' in window)) return // content simply stays visible

    root.classList.add('js-reveal')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const scan = () => {
      document.querySelectorAll('.reveal:not(.in-view)').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        io.observe(el)
      })
    }

    let frame = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(scan)
    })

    scan()
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      mo.disconnect()
      io.disconnect()
      root.classList.remove('js-reveal')
    }
  }, [])

  return null
}

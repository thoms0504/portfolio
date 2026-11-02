'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { cn } from '@/lib/cn'

interface FormState {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE = 1000

function validate(data: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = 'Enter your name.'
  // Email is optional here: WhatsApp already identifies the sender by phone number.
  if (data.email.trim() && !EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Enter a valid email address, for example name@company.com.'
  }
  if (!data.message.trim()) errors.message = 'Enter a message.'
  else if (data.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.'
  return errors
}

/** The text that is pre-filled in the WhatsApp chat. */
function buildWhatsAppText(data: FormState): string {
  const lines = [`Halo Thomson, saya ${data.name.trim()}.`, '', data.message.trim()]
  if (data.email.trim()) lines.push('', `Email: ${data.email.trim()}`)
  lines.push('', '(Dikirim dari portfolio)')
  return lines.join('\n')
}

interface ContactFormProps {
  /** WhatsApp link in wa.me/<number> form. */
  whatsappUrl: string
}

export function ContactForm({ whatsappUrl }: ContactFormProps) {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [opened, setOpened] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    // Open WhatsApp with the message pre-typed; the visitor presses send inside WhatsApp.
    const url = `${whatsappUrl}?text=${encodeURIComponent(buildWhatsAppText(form))}`
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) window.location.href = url // popup blocked: navigate in the same tab
    setOpened(true)
    setForm({ name: '', email: '', message: '' })
  }

  const fieldBase =
    'w-full h-11 px-3 rounded-control border border-line bg-surface text-text text-body placeholder:text-muted transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 max-w-lg">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-body text-text mb-2 font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
          className={cn(fieldBase, errors.name && 'border-red-500')}
          placeholder="Your name"
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-small mt-1.5" style={{ color: 'var(--warning)' }}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-body text-text mb-2 font-medium">
          Email <span className="text-muted font-normal">(optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
          className={cn(fieldBase, errors.email && 'border-red-500')}
          placeholder="name@company.com"
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-small mt-1.5" style={{ color: 'var(--warning)' }}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-body text-text mb-2 font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={MAX_MESSAGE}
          value={form.message}
          onChange={handleChange}
          aria-describedby={errors.message ? 'message-error' : undefined}
          aria-invalid={!!errors.message}
          className={cn(
            fieldBase,
            'h-auto py-3 resize-y',
            errors.message && 'border-red-500'
          )}
          placeholder="Tell me about your project or question"
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-small mt-1.5" style={{ color: 'var(--warning)' }}>
            {errors.message}
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" className="self-start">
        <BrandIcon id="whatsapp" size={18} />
        Send via WhatsApp
      </Button>

      <p className="text-small text-muted">
        WhatsApp will open with your message already typed. Press send there to deliver it.
      </p>

      {opened && (
        <p role="status" className="text-body" style={{ color: 'var(--success)' }}>
          WhatsApp opened with your message. Press send in WhatsApp to finish.
        </p>
      )}
    </form>
  )
}

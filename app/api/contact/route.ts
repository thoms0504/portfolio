import { NextResponse } from 'next/server'

interface ContactBody {
  name: string
  email: string
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, email, message } = body as ContactBody

  // Server-side validation
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (!email?.trim() || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
  }
  if (!message?.trim() || message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
  }

  // Sanitize
  const safeName = name.trim().slice(0, 200)
  const safeEmail = email.trim().slice(0, 200)
  const safeMessage = message.trim().slice(0, 5000)

  // Send via Resend if configured
  const resendKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_EMAIL

  if (resendKey && toEmail) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <noreply@thomsonsibuea.com>',
          to: [toEmail],
          subject: `Portfolio contact from ${safeName}`,
          text: `From: ${safeName} <${safeEmail}>\n\n${safeMessage}`,
          reply_to: safeEmail,
        }),
      })

      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
      }
    } catch {
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

import { NextResponse } from 'next/server'
import { buildKb } from '@/lib/chatbot/build-kb'

// Rendered once at build time and served as a static JSON file. The chatbot downloads it
// on first open and answers entirely in the browser: no runtime server work, no external API.
export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json(buildKb())
}

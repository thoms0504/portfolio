import fs from 'fs'
import path from 'path'
import type { Profile } from '@/types'

export function getProfile(): Profile {
  const filePath = path.join(process.cwd(), 'content', 'profile.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw) as Profile
}

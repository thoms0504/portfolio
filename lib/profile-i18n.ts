import fs from 'fs'
import path from 'path'
import { getProfile } from './profile'
import type { Profile, ProfileTranslation } from '@/types'

export function getProfileTranslation(): ProfileTranslation {
  const filePath = path.join(process.cwd(), 'content', 'profile.id.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as ProfileTranslation
}

/** English profile with the Indonesian prose merged in. Proper names are left untouched. */
export function getLocalizedProfile(): { en: Profile; id: Profile } {
  const en = getProfile()
  const tr = getProfileTranslation()
  return {
    en,
    id: {
      ...en,
      headline: tr.headline ?? en.headline,
      about: tr.about ?? en.about,
      experience: en.experience.map((item, i) => ({
        ...item,
        description: tr.experience?.[i]?.description ?? item.description,
        highlights: tr.experience?.[i]?.highlights ?? item.highlights,
      })),
      education: en.education.map((item, i) => ({
        ...item,
        description: tr.education?.[i]?.description ?? item.description,
        highlights: tr.education?.[i]?.highlights ?? item.highlights,
      })),
    },
  }
}

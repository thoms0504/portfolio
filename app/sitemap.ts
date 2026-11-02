import type { MetadataRoute } from 'next'

const BASE = 'https://thomsonsibuea.com'

// Project details open in a modal on /projects, so there are no per-project URLs to list.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/projects`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE}/resume`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}

import { MetadataRoute } from 'next'

const BASE_URL = 'https://fiveserieshq.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL,                   priority: 1.0,  changeFrequency: 'daily'   as const },
    { url: `${BASE_URL}/forums`,       priority: 0.9,  changeFrequency: 'hourly'  as const },
    { url: `${BASE_URL}/videos`,       priority: 0.8,  changeFrequency: 'daily'   as const },
    { url: `${BASE_URL}/vendors`,      priority: 0.8,  changeFrequency: 'weekly'  as const },
    { url: `${BASE_URL}/technical`,    priority: 0.9,  changeFrequency: 'weekly'  as const },
    { url: `${BASE_URL}/events`,       priority: 0.7,  changeFrequency: 'daily'   as const },
    { url: `${BASE_URL}/builds`,       priority: 0.7,  changeFrequency: 'weekly'  as const },
    { url: `${BASE_URL}/about`,        priority: 0.5,  changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/auth/join`,    priority: 0.6,  changeFrequency: 'monthly' as const },
  ]

  return staticPages.map(p => ({
    url: p.url,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))
}

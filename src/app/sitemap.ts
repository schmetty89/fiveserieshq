import { MetadataRoute } from 'next'

const BASE_URL = 'https://fiveserieshq.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL,                   priority: 1.0,  changeFrequency: 'daily'   },
    { url: `${BASE_URL}/forums`,       priority: 0.9,  changeFrequency: 'hourly'  },
    { url: `${BASE_URL}/videos`,       priority: 0.8,  changeFrequency: 'daily'   },
    { url: `${BASE_URL}/vendors`,      priority: 0.8,  changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/technical`,    priority: 0.9,  changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/events`,       priority: 0.7,  changeFrequency: 'daily'   },
    { url: `${BASE_URL}/builds`,       priority: 0.7,  changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/about`,        priority: 0.5,  changeFrequency: 'monthly' },
    { url: `${BASE_URL}/auth/join`,    priority: 0.6,  changeFrequency: 'monthly' },
  ]

  // Generation-specific forum pages
  const generations = ['E34', 'E39', 'E60', 'F10', 'G30']
  const genCategories = ['powertrain', 'suspension', 'electrical', 'builds', 'general', 'marketplace']

  const genPages = generations.flatMap(gen =>
    genCategories.map(cat => ({
      url: `${BASE_URL}/forums/subforum?gen=${gen}&cat=${cat}`,
      priority: 0.7,
      changeFrequency: 'hourly' as const,
    }))
  )

  // Regional forum pages
  const regions = [
    'northeast-us', 'southeast-us', 'midwest-us',
    'southwest-us', 'west-coast-us', 'eastern-canada', 'western-canada',
  ]
  const regionalPages = regions.map(region => ({
    url: `${BASE_URL}/forums/subforum?region=${region}`,
    priority: 0.6,
    changeFrequency: 'daily' as const,
  }))

  // Technical info pages
  const techPages = generations.flatMap(gen => [
    { url: `${BASE_URL}/technical?gen=${gen}&section=documents`,    priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/technical?gen=${gen}&section=maintenance`,  priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/technical?gen=${gen}&section=performance`,  priority: 0.7, changeFrequency: 'weekly' as const },
  ])

  return [
    ...staticPages.map(p => ({
      ...p,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
    })),
    ...genPages,
    ...regionalPages,
    ...techPages,
  ]
}

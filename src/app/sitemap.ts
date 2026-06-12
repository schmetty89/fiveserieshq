import { MetadataRoute } from 'next'

const BASE_URL = 'https://fiveserieshq.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL,                 lastModified: new Date(), changeFrequency: 'daily'   },
    { url: `${BASE_URL}/forums`,     lastModified: new Date(), changeFrequency: 'hourly'  },
    { url: `${BASE_URL}/videos`,     lastModified: new Date(), changeFrequency: 'daily'   },
    { url: `${BASE_URL}/vendors`,    lastModified: new Date(), changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/technical`,  lastModified: new Date(), changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/events`,     lastModified: new Date(), changeFrequency: 'daily'   },
    { url: `${BASE_URL}/builds`,     lastModified: new Date(), changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/about`,      lastModified: new Date(), changeFrequency: 'monthly' },
    { url: `${BASE_URL}/auth/join`,  lastModified: new Date(), changeFrequency: 'monthly' },
  ]
}

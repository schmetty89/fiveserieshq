import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/callback',
          '/members/me',
        ],
      },
    ],
    sitemap: 'https://fiveserieshq.com/sitemap.xml',
    host: 'https://fiveserieshq.com',
  }
}

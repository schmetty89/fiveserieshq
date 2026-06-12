import { Metadata } from 'next'

const BASE_URL = 'https://fiveserieshq.com'

const GEN_YEARS: Record<string, string> = {
  E34: '1988–1996', E39: '1995–2003',
  E60: '2003–2010', F10: '2010–2017', G30: '2017–present',
}

export function generatePageMetadata({
  title,
  description,
  path,
  gen,
  ogSub,
}: {
  title: string
  description: string
  path: string
  gen?: string
  ogSub?: string
}): Metadata {
  const ogTitle = gen ? `${title} — BMW ${gen} ${GEN_YEARS[gen] ?? ''}` : title
  const ogImage = gen
    ? `${BASE_URL}/api/og?title=${encodeURIComponent(ogTitle)}&sub=${encodeURIComponent(ogSub ?? description)}&gen=${gen}`
    : `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&sub=${encodeURIComponent(ogSub ?? description)}`

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}${path}` },
    openGraph: {
      title: ogTitle,
      description,
      url: `${BASE_URL}${path}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage],
    },
  }
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/hero/HeroSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FiveSeriesHQ — The BMW 5 Series Community',
  description:
    'The definitive BMW 5 Series community. Forums, builds, technical library, video library, trusted vendors, and events — covering every generation from E34 to G30.',
  alternates: { canonical: 'https://fiveserieshq.com' },
  openGraph: {
    title: 'FiveSeriesHQ — The BMW 5 Series Community',
    description: 'The definitive BMW 5 Series community — E34 to G30.',
    url: 'https://fiveserieshq.com',
    images: [{ url: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/og-image.png', width: 1200, height: 630 }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'FiveSeriesHQ',
  url: 'https://fiveserieshq.com',
  description: 'The definitive BMW 5 Series community covering every generation from E34 to G30.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://fiveserieshq.com/forums?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FitmentTool } from '@/components/technical/fitment/FitmentTool'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rim Fitment Guide — BMW 5 Series E34 to G30',
  description:
    'Verified wheel and tire fitment data for every BMW 5 Series generation (E34, E39, E60, F10, G30). Bolt patterns, hub bores, offset ranges, OEM specs, and community-sourced combos.',
  keywords: [
    'BMW 5 Series wheel fitment', 'BMW E39 rim fitment', 'BMW 5 Series bolt pattern',
    'BMW 5 Series hub bore', 'BMW wheel offset', 'E34 fitment', 'E60 fitment',
    'F10 fitment', 'G30 fitment', '5x120 fitment', '5x112 G30',
  ],
  openGraph: {
    title: 'BMW 5 Series Rim Fitment Tool — FiveSeriesHQ',
    description: 'Bolt patterns, hub bores, offset ranges, and community-verified wheel combos for E34 through G30.',
    type: 'website',
  },
}

export default function FitmentPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <FitmentTool />
      </main>
      <Footer />
    </>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { TechnicalInfo } from '@/components/technical/TechnicalInfo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technical Info — BMW 5 Series Database',
  description: 'The most comprehensive BMW 5 Series technical library online. Factory service manuals, wiring diagrams, maintenance guides, and performance documentation for every generation.',
}

export default function TechnicalPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <TechnicalInfo />
      </main>
      <Footer />
    </>
  )
}

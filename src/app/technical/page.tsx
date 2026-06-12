import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { TechnicalInfo } from '@/components/technical/TechnicalInfo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technical info',
  description: 'BMW 5 Series technical database — service manuals, wiring diagrams, maintenance guides, and performance references for E34 through G30.',
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

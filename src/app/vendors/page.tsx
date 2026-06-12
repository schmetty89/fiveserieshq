import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VendorDirectory } from '@/components/vendors/VendorDirectory'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trusted vendors',
  description: 'Curated BMW 5 Series parts suppliers, tuners, and independent shops — approved by the FiveSeriesHQ community.',
}

export default function VendorsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <VendorDirectory />
      </main>
      <Footer />
    </>
  )
}

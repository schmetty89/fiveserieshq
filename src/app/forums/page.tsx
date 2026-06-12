import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ForumIndex } from '@/components/forums/ForumIndex'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forums',
  description: 'BMW 5 Series community forums — E34, E39, E60, F10, G30 and regional discussion.',
}

export default function ForumsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <ForumIndex />
      </main>
      <Footer />
    </>
  )
}

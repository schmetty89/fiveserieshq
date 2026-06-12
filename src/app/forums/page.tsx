import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ForumIndex } from '@/components/forums/ForumIndex'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forums — BMW 5 Series Discussion',
  description: 'BMW 5 Series community forums covering all generations — E34, E39, E60, F10, G30. Technical help, builds, general discussion, marketplace, and regional subforums.',
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

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VideoLibrary } from '@/components/videos/VideoLibrary'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video library',
  description: 'BMW 5 Series community video library — DIY guides, build diaries, reviews, and track day footage across all generations.',
}

export default function VideosPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <VideoLibrary />
      </main>
      <Footer />
    </>
  )
}

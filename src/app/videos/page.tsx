import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VideoLibrary } from '@/components/videos/VideoLibrary'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Library — BMW 5 Series',
  description: 'The best BMW 5 Series videos in one place. DIY guides, build progress, reviews, and track footage — curated and organized by generation from E34 to G30.',
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

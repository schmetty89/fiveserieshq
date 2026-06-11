import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/hero/HeroSection'
import { HomeFeed } from '@/components/hero/HomeFeed'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HomeFeed />
      </main>
      <Footer />
    </>
  )
}

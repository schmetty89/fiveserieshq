import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MyProfile } from '@/components/members/MyProfile'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My profile' }

export default function MyProfilePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <MyProfile />
      </main>
      <Footer />
    </>
  )
}

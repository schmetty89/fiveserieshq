import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PublicProfile } from '@/components/members/PublicProfile'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `${username}'s profile` }
}

export default async function MemberProfilePage({ params }: Props) {
  const { username } = await params
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <PublicProfile username={username} />
      </main>
      <Footer />
    </>
  )
}

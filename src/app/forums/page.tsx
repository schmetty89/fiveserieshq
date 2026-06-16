import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ForumIndex } from '@/components/forums/ForumIndex'
import { SubforumView } from '@/components/forums/SubforumView'
import type { Metadata } from 'next'

interface Props {
  searchParams: Promise<{ gen?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  return params.gen
    ? {
        title: `BMW ${params.gen} Forums — Five Series HQ`,
        description: `BMW ${params.gen} forum categories — engine, drivetrain, suspension, electrical, general discussion, and marketplace.`,
      }
    : {
        title: 'Forums — BMW 5 Series Discussion',
        description: 'BMW 5 Series community forums covering all generations — E34, E39, E60, F10, G30. Technical help, builds, general discussion, marketplace, and regional subforums.',
      }
}

export default async function ForumsPage({ searchParams }: Props) {
  const params = await searchParams
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {params.gen ? <SubforumView gen={params.gen} /> : <ForumIndex />}
      </main>
      <Footer />
    </>
  )
}

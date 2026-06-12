import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ThreadView } from '@/components/forums/ThreadView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Thread ${id}` }
}

export default async function ThreadPage({ params }: Props) {
  const { id } = await params
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <ThreadView threadId={id} />
      </main>
      <Footer />
    </>
  )
}

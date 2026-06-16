import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SubforumView } from '@/components/forums/SubforumView'
import type { Metadata } from 'next'

interface Props {
  searchParams: Promise<{ gen?: string; cat?: string; engine?: string; transmission?: string; region?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const title = params.region
    ? `Regional Forums`
    : params.gen && params.cat
    ? `${params.gen} — ${params.cat}${params.engine ? ` — ${params.engine}` : ''}${params.transmission ? ` — ${params.transmission}` : ''}`
    : 'Forums'
  return { title }
}

export default async function SubforumPage({ searchParams }: Props) {
  const params = await searchParams
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <SubforumView
          gen={params.gen}
          cat={params.cat}
          engine={params.engine}
          transmission={params.transmission}
          region={params.region}
        />
      </main>
      <Footer />
    </>
  )
}

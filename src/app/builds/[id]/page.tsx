import { Navbar } from '@/components/layout/Navbar'
import { BuildDetail } from '@/components/showcase/BuildDetail'

export default async function BuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BuildDetail buildId={id} />
      </div>
    </>
  )
}

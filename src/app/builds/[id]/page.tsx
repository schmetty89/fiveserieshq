import { Navbar } from '@/components/layout/Navbar'
import { BuildDetail } from '@/components/showcase/BuildDetail'

export default function BuildDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BuildDetail buildId={params.id} />
      </div>
    </>
  )
}

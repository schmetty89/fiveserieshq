import { Navbar } from '@/components/layout/Navbar'
import { BuildsListing } from '@/components/showcase/BuildsListing'

export default function BuildsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BuildsListing />
      </div>
    </>
  )
}

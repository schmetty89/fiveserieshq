'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TechSubmitForm } from '@/components/technical/TechSubmitForm'

function SubmitPageInner() {
  const searchParams = useSearchParams()
  const gen = searchParams.get('gen') ?? undefined
  const section = searchParams.get('section') ?? undefined
  const backHref = `/technical?gen=${gen ?? 'E39'}&section=${section ?? 'maintenance'}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to technical library
      </Link>
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Submit technical content</h1>
      <p className="text-sm text-gray-500 mb-8">Contribute a guide, document, or reference for the community.</p>
      <TechSubmitForm defaultGen={gen} defaultSection={section} backHref={backHref} />
    </div>
  )
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-xl max-w-3xl mx-auto my-8" />}>
      <SubmitPageInner />
    </Suspense>
  )
}

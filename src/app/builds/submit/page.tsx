'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BuildSubmitForm } from '@/components/showcase/BuildSubmitForm'

function SubmitInner() {
  const params = useSearchParams()
  const id = params.get('id') ?? undefined
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">
        {id ? 'Edit your build' : 'Start a build'}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Document your BMW 5 Series build. Save a draft now and keep adding to it over time.
      </p>
      <BuildSubmitForm buildId={id} />
    </div>
  )
}

export default function ShowcaseSubmitPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-xl max-w-3xl mx-auto my-8" />}>
      <SubmitInner />
    </Suspense>
  )
}

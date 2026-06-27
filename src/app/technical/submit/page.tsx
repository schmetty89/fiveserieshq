'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TechSubmitForm } from '@/components/technical/TechSubmitForm'
import { TemplatePickerModal } from '@/components/technical/TemplatePickerModal'
import { GuideTemplate } from '@/lib/guide-templates'
import { LayoutTemplate } from 'lucide-react'

function SubmitInner() {
  const params = useSearchParams()
  const defaultGen = params.get('gen') ?? undefined
  const defaultSection = params.get('section') ?? undefined
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<GuideTemplate | null>(null)

  function handleTemplateSelect(template: GuideTemplate, generation: string) {
    setSelectedTemplate({ ...template, _prefillGen: generation } as GuideTemplate & { _prefillGen: string })
    setShowTemplateModal(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Submit a guide</h1>
          <p className="text-sm text-gray-500">
            Document your knowledge. Submissions are reviewed before going live.
          </p>
        </div>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <LayoutTemplate size={14} />
          Start from template
        </button>
      </div>

      <TechSubmitForm
        defaultGen={defaultGen}
        defaultSection={defaultSection}
        prefillTemplate={selectedTemplate as (GuideTemplate & { _prefillGen: string }) | null}
        onTemplateClear={() => setSelectedTemplate(null)}
      />

      {showTemplateModal && (
        <TemplatePickerModal
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  )
}

export default function TechSubmitPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-xl max-w-3xl mx-auto my-8" />}>
      <SubmitInner />
    </Suspense>
  )
}

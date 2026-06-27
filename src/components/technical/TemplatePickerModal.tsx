'use client'

import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { GUIDE_TEMPLATES, GuideTemplate } from '@/lib/guide-templates'
import { GENERATIONS } from '@/types'

interface Props {
  onSelect: (template: GuideTemplate, generation: string) => void
  onClose: () => void
}

export function TemplatePickerModal({ onSelect, onClose }: Props) {
  const [step, setStep] = useState<'template' | 'generation'>('template')
  const [chosen, setChosen] = useState<GuideTemplate | null>(null)
  const [generation, setGeneration] = useState('')

  function handleTemplateClick(template: GuideTemplate) {
    setChosen(template)
    setStep('generation')
  }

  function handleConfirm() {
    if (!chosen || !generation) return
    onSelect(chosen, generation)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {step === 'template' ? 'Choose a template' : chosen?.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === 'template' ? 'Select a common task to start with' : 'Which generation is this guide for?'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {step === 'template' ? (
            <div className="space-y-2">
              {GUIDE_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{template.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                The template will pre-fill the guide title, section, system, and basic steps. You&apos;ll still need to add tools, part numbers, photos, and elaborate on each step.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENERATIONS.map(gen => (
                  <button
                    key={gen}
                    onClick={() => setGeneration(gen)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      generation === gen
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {step === 'generation' ? (
            <>
              <button
                onClick={() => setStep('template')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!generation}
                className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                Use this template
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

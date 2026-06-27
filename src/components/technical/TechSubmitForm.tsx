'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, AlertCircle, CheckCircle, Upload, FileText, Wrench } from 'lucide-react'
import Link from 'next/link'
import { GENERATIONS } from '@/types'
import { MAINTENANCE_SYSTEMS, PERFORMANCE_SYSTEMS, DIAGNOSIS_SYSTEMS, DOC_CATEGORIES, ENGINES_BY_GENERATION } from '@/lib/technical-config'
import { submitTechDocument, submitTechArticle } from '@/lib/technical-data'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { GUIDE_FIELDS, composeGuideBody, type GuideSection, SOCKET_CATEGORIES, ALL_DRIVES, availableDrives, ratchetCount, variantsFor, validateChecklist, type ChecklistValue } from '@/lib/article-fields'
import { GuideTemplate } from '@/lib/guide-templates'

interface Props {
  defaultGen?: string
  defaultSection?: string
  backHref?: string
  prefillTemplate?: (GuideTemplate & { _prefillGen: string }) | null
  onTemplateClear?: () => void
}

export function TechSubmitForm({ defaultGen, defaultSection, backHref = '/technical', prefillTemplate, onTemplateClear }: Props) {
  const { user } = useAuth()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    section: defaultSection || 'maintenance',
    contentType: 'guide' as 'guide' | 'pdf',
    generation: defaultGen || '',
    engine: '',
    system: '',
    docCategory: '',
    title: '',
    yearRange: '',
    body: '',
  })
  const [guide, setGuide] = useState<Record<string, string | number | ChecklistValue>>({})
  const str = (k: string) => { const v = guide[k]; return typeof v === 'string' ? v : '' }
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!prefillTemplate) return
    setForm(f => ({
      ...f,
      section: prefillTemplate.section,
      system: prefillTemplate.system,
      generation: prefillTemplate._prefillGen,
      title: prefillTemplate.title,
      contentType: 'guide',
    }))
    setGuide(g => ({
      ...g,
      steps: prefillTemplate.steps,
    }))
  }, [prefillTemplate])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.size > 50 * 1024 * 1024) {
      setError('File must be under 50MB.')
      return
    }
    setFile(selected)
    setError('')
  }

  function resetForm() {
    setForm({
      section: defaultSection || 'maintenance',
      contentType: 'guide',
      generation: defaultGen || '',
      engine: '',
      system: '',
      docCategory: '',
      title: '',
      yearRange: '',
      body: '',
    })
    setGuide({})
    setFile(null)
    setError('')
    setSubmitted(false)
  }

  const systems = form.section === 'diagnosis' ? DIAGNOSIS_SYSTEMS : form.section === 'performance' ? PERFORMANCE_SYSTEMS : MAINTENANCE_SYSTEMS
  const engineOptions = form.generation ? (ENGINES_BY_GENERATION[form.generation] ?? []) : []

  async function uploadFile(): Promise<string | null> {
    if (!file || !user) return null
    setUploading(true)
    const ext = file.name.split('.').pop()
    const filename = `${user.id}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('tech-documents')
      .upload(filename, file, { cacheControl: '3600', upsert: false })
    setUploading(false)
    if (error) throw error
    const { data: urlData } = supabase.storage.from('tech-documents').getPublicUrl(data.path)
    return urlData.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!user) return setError('You must be signed in to submit.')
    if (!form.generation) return setError('Please select a generation.')
    if (!form.title.trim()) return setError('Please enter a title.')

    setLoading(true)
    try {
      let fileUrl: string | null = null
      if (file) {
        fileUrl = await uploadFile()
      }

      if (form.section === 'documents') {
        if (!form.docCategory) { setError('Please select a document category.'); setLoading(false); return }
        if (!form.yearRange.trim()) { setError('Please enter the year range.'); setLoading(false); return }
        if (!file) { setError('Please upload the document file.'); setLoading(false); return }
        await submitTechDocument({
          name: form.title.trim(),
          generation: form.generation,
          category: form.docCategory,
          fileUrl: fileUrl ?? '#pending',
          fileSizeMb: file ? Math.round(file.size / 1024 / 1024 * 10) / 10 : undefined,
          yearRange: form.yearRange.trim(),
          submittedBy: user.id,
        })
      } else {
        if (!form.system) { setError('Please select a system category.'); setLoading(false); return }
        if (form.contentType === 'guide') {
          const composed = composeGuideBody(form.section as GuideSection, guide)
          if (!composed) { setError('Please fill in at least one field.'); setLoading(false); return }
          const checklistError = validateChecklist(guide['tools'] as ChecklistValue | undefined)
          if (checklistError) { setError(checklistError); setLoading(false); return }
        }
        const engineLine = form.engine ? `Engine: ${form.engine}\n\n` : ''
        if (form.contentType === 'pdf' && !file) { setError('Please upload a PDF file.'); setLoading(false); return }
        await submitTechArticle({
          title: form.title.trim(),
          generation: form.generation,
          section: form.section as 'maintenance' | 'performance' | 'diagnosis',
          system: form.system,
          contentType: form.contentType,
          body: form.contentType === 'guide' ? engineLine + composeGuideBody(form.section as GuideSection, guide) : undefined,
          fileUrl: fileUrl ?? undefined,
          authorId: user.id,
        })
      }
      setSubmitted(true)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const needsFile = form.section === 'documents' || (form.section !== 'documents' && form.contentType === 'pdf')

  if (submitted) {
    return (
      <div className="py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Submitted for review</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Your submission will be reviewed by the admin before it appears in the library.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={resetForm}
            className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
            Submit another
          </button>
          <Link href={backHref}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            Back to technical library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 leading-relaxed">
        Submissions are reviewed before going live. Verified content gets a badge.
      </p>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {prefillTemplate && (
        <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3.5 py-3">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Template loaded:</span> {prefillTemplate.title} — fill in the remaining fields and elaborate on the steps.
          </p>
          <button
            type="button"
            onClick={() => {
              resetForm()
              onTemplateClear?.()
            }}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
          >
            Clear
          </button>
        </div>
      )}

      {/* Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'documents',    label: '📄 Technical documents' },
            { value: 'maintenance',  label: '🔧 Maintenance' },
            { value: 'performance',  label: '🚀 Performance' },
            { value: 'diagnosis',    label: '🔍 Fault diagnosis' },
          ].map(s => (
            <button key={s.value} type="button"
              onClick={() => { setForm(f => ({ ...f, section: s.value, system: '' })); setGuide({}) }}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                form.section === s.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content type */}
      {form.section !== 'documents' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content type</label>
          <div className="flex gap-2">
            {[{ value: 'guide', label: '✍️ Written guide' }, { value: 'pdf', label: '📎 PDF upload' }].map(t => (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, contentType: t.value as 'guide' | 'pdf' }))}
                className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                  form.contentType === t.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generation + category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Generation</label>
          <select name="generation" value={form.generation} onChange={handleChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">Select generation</option>
            {GENERATIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {form.section === 'documents' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document type</label>
            <select name="docCategory" value={form.docCategory} onChange={handleChange}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="">Select type</option>
              {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">System</label>
            <select name="system" value={form.system} onChange={handleChange}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="">Select system</option>
              {systems.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        )}
      </div>

            {/* Engine (optional) */}
            {form.section !== 'documents' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Engine <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.engine}
                  onChange={(e) => setForm(f => ({ ...f, engine: e.target.value }))}
                  disabled={!form.generation}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">{form.generation ? 'Select engine (optional)' : 'Select a generation first'}</option>
                  {engineOptions.map((eng) => (
                    <option key={`${eng.model}-${eng.full}`} value={eng.full}>
                      {eng.model} — {eng.full} ({eng.years})
                    </option>
                  ))}
                </select>
              </div>
            )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {form.section === 'documents' ? 'Document name' : 'Guide title'}
        </label>
        <input type="text" name="title" value={form.title} onChange={handleChange}
          placeholder={form.section === 'documents' ? 'e.g. E39 Factory Service Manual' : 'e.g. M54 cooling system full overhaul'}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      {/* Year range (documents only) */}
      {form.section === 'documents' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Year range</label>
          <input type="text" name="yearRange" value={form.yearRange} onChange={handleChange}
            placeholder="e.g. 1995–2003"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      )}

      {/* Guide body — structured fields per section */}
      {form.section !== 'documents' && form.contentType === 'guide' && (
        <>
          {(GUIDE_FIELDS[form.section as GuideSection] ?? []).map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              {field.type === 'wrench' ? (
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGuide((g) => ({ ...g, [field.key]: n }))}
                      className="p-1"
                      aria-label={`${n} wrench${n > 1 ? 'es' : ''}`}
                    >
                      <Wrench
                        size={22}
                        className={(Number(guide[field.key]) || 0) >= n ? 'text-gray-900' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              ) : field.type === 'checklist' ? (
                <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {(() => {
                    const tools = (guide[field.key] as ChecklistValue) ?? {}
                    const sel = tools.selected ?? []
                    const meta = tools.meta ?? {}
                    const drives = availableDrives(sel)
                    const showSocketDrive = ratchetCount(sel) >= 2 && drives.length >= 1

                    const setMeta = (id: string, patch: Partial<{ drive: string }>) =>
                      setGuide((g) => {
                        const cur = (g[field.key] as ChecklistValue) ?? {}
                        const m = { ...(cur.meta ?? {}) }
                        m[id] = { ...(m[id] ?? {}), ...patch }
                        return { ...g, [field.key]: { ...cur, meta: m } }
                      })

                    const toggleSelected = (id: string, on: boolean) =>
                      setGuide((g) => {
                        const cur = (g[field.key] as ChecklistValue) ?? {}
                        const curSel = cur.selected ?? []
                        const next = on ? [...curSel, id] : curSel.filter((x) => x !== id)
                        return { ...g, [field.key]: { ...cur, selected: next } }
                      })

                    const toggleDrive = (id: string, drive: string, on: boolean) =>
                      setGuide((g) => {
                        const cur = (g[field.key] as ChecklistValue) ?? {}
                        const m = { ...(cur.meta ?? {}) }
                        const entry = { ...(m[id] ?? {}) }
                        const d = { ...(entry.drives ?? {}) }
                        if (on) { if (!d[drive]) d[drive] = [] } else { delete d[drive] }
                        entry.drives = d
                        m[id] = entry
                        return { ...g, [field.key]: { ...cur, meta: m } }
                      })

                    const toggleDriveVariant = (id: string, drive: string, variant: string, on: boolean) =>
                      setGuide((g) => {
                        const cur = (g[field.key] as ChecklistValue) ?? {}
                        const m = { ...(cur.meta ?? {}) }
                        const entry = { ...(m[id] ?? {}) }
                        const d = { ...(entry.drives ?? {}) }
                        const list = d[drive] ?? []
                        d[drive] = on ? [...list, variant] : list.filter((x) => x !== variant)
                        entry.drives = d
                        m[id] = entry
                        return { ...g, [field.key]: { ...cur, meta: m } }
                      })

                    const toggleVariant = (id: string, variant: string, on: boolean) =>
                      setGuide((g) => {
                        const cur = (g[field.key] as ChecklistValue) ?? {}
                        const m = { ...(cur.meta ?? {}) }
                        const entry = { ...(m[id] ?? {}) }
                        const list = entry.variants ?? []
                        entry.variants = on ? [...list, variant] : list.filter((x) => x !== variant)
                        m[id] = entry
                        return { ...g, [field.key]: { ...cur, meta: m } }
                      })

                    return (
                      <>
                        {(field.groups ?? []).map((group) => {
                          const isSocketCat = (SOCKET_CATEGORIES as readonly string[]).includes(group.category)
                          return (
                            <div key={group.category}>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{group.category}</p>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                {group.tools.map((tool) => {
                                  const id = `${group.category}::${tool}`
                                  const checked = sel.includes(id)
                                  const isTorque = group.category === 'Ratchets & Drive Tools' && tool === 'Torque Wrench'
                                  return (
                                    <div key={id} className="col-span-1">
                                      <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={checked} onChange={(e) => toggleSelected(id, e.target.checked)} />
                                        {tool}
                                      </label>

                                      {checked && isTorque && (
                                        <div className="ml-6 mt-1">
                                          <select
                                            value={meta[id]?.drive ?? ''}
                                            onChange={(e) => setMeta(id, { drive: e.target.value })}
                                            className="text-xs border border-gray-200 rounded px-2 py-1"
                                          >
                                            <option value="">Drive size…</option>
                                            {ALL_DRIVES.map((d) => <option key={d} value={d}>{d}</option>)}
                                          </select>
                                        </div>
                                      )}

                                      {checked && isSocketCat && showSocketDrive && (
                                        <div className="ml-6 mt-1 space-y-1">
                                          {drives.map((d) => {
                                            const driveOn = !!(meta[id]?.drives && d in (meta[id]?.drives ?? {}))
                                            return (
                                              <div key={d}>
                                                <label className="flex items-center gap-1 text-xs text-gray-600">
                                                  <input type="checkbox" checked={driveOn} onChange={(e) => toggleDrive(id, d, e.target.checked)} />
                                                  {d} drive
                                                </label>
                                                {driveOn && (
                                                  <div className="ml-5 flex flex-wrap gap-x-3 gap-y-0.5">
                                                    {variantsFor(group.category).map((variant) => (
                                                      <label key={variant} className="flex items-center gap-1 text-xs text-gray-500">
                                                        <input
                                                          type="checkbox"
                                                          checked={(meta[id]?.drives?.[d] ?? []).includes(variant)}
                                                          onChange={(e) => toggleDriveVariant(id, d, variant, e.target.checked)}
                                                        />
                                                        {variant}
                                                      </label>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}

                                      {checked && isSocketCat && !showSocketDrive && (
                                        <div className="ml-6 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                                          {variantsFor(group.category).map((variant) => (
                                            <label key={variant} className="flex items-center gap-1 text-xs text-gray-600">
                                              <input
                                                type="checkbox"
                                                checked={(meta[id]?.variants ?? []).includes(variant)}
                                                onChange={(e) => toggleVariant(id, variant, e.target.checked)}
                                              />
                                              {variant}
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                        {field.allowCustom && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Other</p>
                            <input
                              type="text"
                              placeholder="Other tools (comma-separated)"
                              value={tools.custom ?? ''}
                              onChange={(e) =>
                                setGuide((g) => {
                                  const cur = (g[field.key] as ChecklistValue) ?? {}
                                  return { ...g, [field.key]: { ...cur, custom: e.target.value } }
                                })
                              }
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                            />
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              ) : field.type === 'select' ? (
                <select
                  value={str(field.key)}
                  onChange={(e) => setGuide((g) => ({ ...g, [field.key]: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select…</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={str(field.key)}
                  onChange={(e) => setGuide((g) => ({ ...g, [field.key]: e.target.value }))}
                  rows={field.list ? 3 : 5}
                  placeholder={field.placeholder}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              ) : (
                <input
                  type="text"
                  value={str(field.key)}
                  onChange={(e) => setGuide((g) => ({ ...g, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              )}
            </div>
          ))}
        </>
      )}

      {/* File upload */}
      {needsFile && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {form.section === 'documents' ? 'Upload document' : 'Upload PDF'}
            {form.section === 'documents' && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
              file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2 text-green-700">
                <FileText size={16} />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-green-600">({Math.round(file.size / 1024 / 1024 * 10) / 10} MB)</span>
              </div>
            ) : (
              <div className="text-gray-400">
                <Upload size={20} className="mx-auto mb-2" />
                <p className="text-sm">Click to upload a PDF or document</p>
                <p className="text-xs mt-1">Max 50MB · PDF, DOC, DOCX</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Link href={backHref}
          className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
          Cancel
        </Link>
        <button type="submit" disabled={loading || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors">
          {uploading ? (
            <><Loader2 size={13} className="animate-spin" /> Uploading file...</>
          ) : loading ? (
            <><Loader2 size={13} className="animate-spin" /> Submitting...</>
          ) : (
            'Submit for review'
          )}
        </button>
      </div>
    </form>
  )
}

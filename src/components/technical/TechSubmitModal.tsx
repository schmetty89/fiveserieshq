'use client'

import { useState, useRef } from 'react'
import { X, Loader2, AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react'
import { GENERATIONS } from '@/types'
import { MAINTENANCE_SYSTEMS, PERFORMANCE_SYSTEMS, DOC_CATEGORIES } from '@/lib/technical-config'
import { submitTechDocument, submitTechArticle } from '@/lib/technical-data'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'

interface Props {
  defaultGen?: string
  defaultSection?: string
  onClose: () => void
}

export function TechSubmitModal({ defaultGen, defaultSection, onClose }: Props) {
  const { user } = useAuth()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    section: defaultSection || 'maintenance',
    contentType: 'guide' as 'guide' | 'pdf',
    generation: defaultGen || '',
    system: '',
    docCategory: '',
    title: '',
    yearRange: '',
    body: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    // Max 50MB
    if (selected.size > 50 * 1024 * 1024) {
      setError('File must be under 50MB.')
      return
    }
    setFile(selected)
    setError('')
  }

  const systems = form.section === 'performance' ? PERFORMANCE_SYSTEMS : MAINTENANCE_SYSTEMS

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

      // Upload file if provided
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
        if (form.contentType === 'guide' && !form.body.trim()) { setError('Please write the guide content.'); setLoading(false); return }
        if (form.contentType === 'pdf' && !file) { setError('Please upload a PDF file.'); setLoading(false); return }
        await submitTechArticle({
          title: form.title.trim(),
          generation: form.generation,
          section: form.section as 'maintenance' | 'performance',
          system: form.system,
          contentType: form.contentType,
          body: form.contentType === 'guide' ? form.body.trim() : undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Submit technical content</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Submitted for review</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your submission will be reviewed by the admin before it appears in the library.
            </p>
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Submissions are reviewed before going live. Verified content gets a badge.
            </p>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
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
                ].map(s => (
                  <button key={s.value} type="button"
                    onClick={() => setForm(f => ({ ...f, section: s.value, system: '' }))}
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

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {form.section === 'documents' ? 'Document name' : 'Article title'}
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

            {/* Guide body */}
            {form.section !== 'documents' && form.contentType === 'guide' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guide content</label>
                <textarea name="body" value={form.body} onChange={handleChange}
                  rows={6}
                  placeholder="Write your guide here. Include tools needed, part numbers, torque specs, and step-by-step instructions."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
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
              <button type="button" onClick={onClose}
                className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
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
        )}
      </div>
    </div>
  )
}

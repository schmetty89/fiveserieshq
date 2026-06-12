'use client'

import { useState } from 'react'
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { GENERATIONS } from '@/types'
import { submitVendorApplication } from '@/lib/vendor-data'

interface Props {
  onClose: () => void
}

const VENDOR_TYPES = [
  { value: 'parts',      label: 'Parts supplier' },
  { value: 'tuner',      label: 'Tuner' },
  { value: 'shop',       label: 'Independent shop' },
  { value: 'fabricator', label: 'Fabricator' },
  { value: 'other',      label: 'Other' },
]

export function VendorApplyModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    location: '',
    websiteUrl: '',
    instagram: '',
    contactEmail: '',
    yearsInBusiness: '',
    generations: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  function toggleGen(gen: string) {
    setForm(f => ({
      ...f,
      generations: f.generations.includes(gen)
        ? f.generations.filter(g => g !== gen)
        : [...f.generations, gen],
    }))
  }

  function toggleAllGens() {
    setForm(f => ({
      ...f,
      generations: f.generations.length === GENERATIONS.length ? [] : [...GENERATIONS],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Business name is required.')
    if (!form.type) return setError('Please select a business type.')
    if (!form.description.trim()) return setError('Please describe your business.')
    if (!form.location.trim()) return setError('Location is required.')
    if (!form.contactEmail.trim()) return setError('Contact email is required.')
    if (form.generations.length === 0) return setError('Please select at least one generation you cover.')

    setLoading(true)
    try {
      await submitVendorApplication({
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        location: form.location.trim(),
        websiteUrl: form.websiteUrl.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
        generations: form.generations,
        yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : undefined,
        contactEmail: form.contactEmail.trim(),
      })
      setSubmitted(true)
    } catch {
      setError('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Vendor application</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application submitted</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Thanks for applying. Your application will be reviewed by the admin.
              You&apos;ll be contacted at the email you provided once a decision is made.
            </p>
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Every vendor is manually reviewed before appearing in the directory.
              Fill in your details and we&apos;ll be in touch.
            </p>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Euro Car Service"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">Select type</option>
                  {VENDOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Years in business</label>
                <input type="number" name="yearsInBusiness" value={form.yearsInBusiness} onChange={handleChange}
                  placeholder="e.g. 12" min="0"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact email</label>
                <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange}
                  placeholder="you@shop.com"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input type="text" name="location" value={form.location} onChange={handleChange}
                  placeholder="City, ST or Online"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="url" name="websiteUrl" value={form.websiteUrl} onChange={handleChange}
                  placeholder="https://yoursite.com"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" name="instagram" value={form.instagram} onChange={handleChange}
                  placeholder="@handle"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Generations covered
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENERATIONS.map(gen => (
                    <button key={gen} type="button" onClick={() => toggleGen(gen)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        form.generations.includes(gen)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {gen}
                    </button>
                  ))}
                  <button type="button" onClick={toggleAllGens}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      form.generations.length === GENERATIONS.length
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    All
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description / specialties
                </label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={4}
                  placeholder="Describe what you offer and why you'd be a good fit for the community..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose}
                className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors">
                {loading ? <><Loader2 size={13} className="animate-spin" /> Submitting...</> : 'Submit application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

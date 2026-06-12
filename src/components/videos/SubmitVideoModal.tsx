'use client'

import { useState } from 'react'
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { submitVideo } from '@/lib/video-data'
import { VIDEO_CATEGORIES } from '@/lib/video-config'
import { useAuth } from '@/components/auth/AuthProvider'
import { GENERATIONS } from '@/types'
import { extractYouTubeId } from '@/lib/utils'

interface Props { onClose: () => void; onSubmitted: () => void }

export function SubmitVideoModal({ onClose, onSubmitted }: Props) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    url: '', title: '', channelName: '',
    category: '', generation: '', duration: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!user) return setError('You must be signed in to submit a video.')

    const ytId = extractYouTubeId(form.url)
    if (!ytId) return setError('Please enter a valid YouTube URL.')
    if (!form.title.trim()) return setError('Please enter a title for the video.')
    if (!form.category) return setError('Please select a category.')
    if (!form.generation) return setError('Please select a generation.')

    setLoading(true)
    try {
      await submitVideo({
        youtubeId: ytId,
        title: form.title.trim(),
        channelName: form.channelName.trim() || 'Unknown',
        category: form.category,
        generation: form.generation,
        duration: form.duration.trim() || '',
        submittedBy: user.id,
      })
      setSubmitted(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Submit a video</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Video submitted</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your submission will be reviewed by the admin before it appears in the library.
            </p>
            <button onClick={() => { onSubmitted(); onClose() }}
              className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Only YouTube links are supported. Videos must be relevant to BMW 5 Series ownership, builds, or maintenance.
            </p>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL</label>
              <input type="url" name="url" value={form.url} onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Video title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. E39 M54 cooling system full overhaul"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel name</label>
                <input type="text" name="channelName" value={form.channelName} onChange={handleChange}
                  placeholder="e.g. BMWDIYGarage"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" name="duration" value={form.duration} onChange={handleChange}
                  placeholder="e.g. 32:14"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">Select category</option>
                  {VIDEO_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Generation</label>
                <select name="generation" value={form.generation} onChange={handleChange}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">Select generation</option>
                  {GENERATIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes for admin <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                rows={3}
                placeholder="Any context about why this video would be useful to the community..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose}
                className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors">
                {loading ? <><Loader2 size={13} className="animate-spin" /> Submitting...</> : 'Submit for review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

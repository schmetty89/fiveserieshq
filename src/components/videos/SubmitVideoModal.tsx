'use client'

import { useState } from 'react'
import { X, Loader2, AlertCircle, CheckCircle, Youtube } from 'lucide-react'
import { submitVideo } from '@/lib/video-data'
import { VIDEO_CATEGORIES } from '@/lib/video-config'
import { useAuth } from '@/components/auth/AuthProvider'
import { GENERATIONS } from '@/types'
import { extractYouTubeId } from '@/lib/utils'

interface Props { onClose: () => void; onSubmitted: () => void }

function isValidInstagramUrl(url: string): boolean {
  return url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')
}

const instagramIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

export function SubmitVideoModal({ onClose, onSubmitted }: Props) {
  const { user } = useAuth()
  const [platform, setPlatform] = useState<'youtube' | 'instagram'>('youtube')
  const [form, setForm] = useState({
    url: '', title: '', channelName: '',
    category: '', generation: '', duration: '', notes: '',
    instagramUrl: '', accountName: '',
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

    if (!form.title.trim()) return setError('Please enter a title.')
    if (!form.category) return setError('Please select a category.')
    if (!form.generation) return setError('Please select a generation.')

    setLoading(true)
    try {
      if (platform === 'youtube') {
        const ytId = extractYouTubeId(form.url)
        if (!ytId) { setError('Please enter a valid YouTube URL.'); setLoading(false); return }
        await submitVideo({
          platform: 'youtube',
          youtubeId: ytId,
          instagramUrl: null,
          title: form.title.trim(),
          channelName: form.channelName.trim() || 'Unknown',
          category: form.category,
          generation: form.generation,
          duration: form.duration.trim() || null,
          submittedBy: user.id,
        })
      } else {
        if (!form.instagramUrl.trim()) { setError('Please enter an Instagram Reel URL.'); setLoading(false); return }
        if (!isValidInstagramUrl(form.instagramUrl)) {
          setError('Please enter a valid Instagram Reel URL (must contain instagram.com/reel/ or instagram.com/p/).')
          setLoading(false)
          return
        }
        await submitVideo({
          platform: 'instagram',
          youtubeId: null,
          instagramUrl: form.instagramUrl.trim(),
          title: form.title.trim(),
          channelName: form.accountName.trim() || 'Unknown',
          category: form.category,
          generation: form.generation,
          duration: null,
          submittedBy: user.id,
        })
      }
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
            {/* Platform toggle */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setPlatform('youtube')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  platform === 'youtube' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Youtube size={13} /> YouTube
              </button>
              <button
                type="button"
                onClick={() => setPlatform('instagram')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  platform === 'instagram' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {instagramIcon} Instagram
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Videos must be relevant to BMW 5 Series ownership, builds, or maintenance.
            </p>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {platform === 'youtube' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL</label>
                <input type="url" name="url" value={form.url} onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram Reel URL</label>
                <input type="url" name="instagramUrl" value={form.instagramUrl} onChange={handleChange}
                  placeholder="https://www.instagram.com/reel/..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Video title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. E39 M54 cooling system full overhaul"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>

            {platform === 'youtube' ? (
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account name <span className="text-gray-400 font-normal">(@username)</span></label>
                <input type="text" name="accountName" value={form.accountName} onChange={handleChange}
                  placeholder="e.g. @bmwdiygarage"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            )}

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

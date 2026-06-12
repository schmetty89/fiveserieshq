'use client'

import { useState } from 'react'
import { X, Loader2, AlertCircle, Star } from 'lucide-react'
import { submitVendorReview } from '@/lib/vendor-data'
import { useAuth } from '@/components/auth/AuthProvider'

interface Props {
  vendorId: string
  vendorName: string
  onClose: () => void
  onSubmitted: () => void
}

export function VendorReviewModal({ vendorId, vendorName, onClose, onSubmitted }: Props) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!user) return setError('You must be signed in to leave a review.')
    if (rating === 0) return setError('Please select a star rating.')
    if (body.trim().length < 20) return setError('Review must be at least 20 characters.')

    setLoading(true)
    try {
      await submitVendorReview({ vendorId, authorId: user.id, rating, body: body.trim() })
      onSubmitted()
    } catch {
      setError('Failed to submit review. You may have already reviewed this vendor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Write a review</h2>
            <p className="text-sm text-gray-500 mt-0.5">{vendorName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hovered || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hovered || rating]}
              </p>
            )}
          </div>

          {/* Review body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your review</label>
            <textarea
              value={body}
              onChange={e => { setBody(e.target.value); setError('') }}
              rows={4}
              placeholder="Share your experience — parts quality, communication, turnaround time, any discounts for community members..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-400 mt-1">{body.length} / 500 characters</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors">
              {loading ? <><Loader2 size={13} className="animate-spin" /> Submitting...</> : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

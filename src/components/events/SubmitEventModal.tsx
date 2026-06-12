'use client'

import { useState } from 'react'
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { submitEvent } from '@/lib/event-data'
import { useAuth } from '@/components/auth/AuthProvider'
import { REGIONAL_SUBFORUMS } from '@/lib/forum-config'

interface Props { onClose: () => void; onSubmitted: () => void }

const EVENT_TYPES = [
  { value: 'meetup',    label: '🤝 Meetup' },
  { value: 'track-day', label: '🏁 Track day' },
  { value: 'show',      label: '🏆 Show' },
]

export function SubmitEventModal({ onClose, onSubmitted }: Props) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '', description: '', type: '', eventDate: '',
    location: '', region: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!user) return setError('You must be signed in to submit an event.')
    if (!form.name.trim()) return setError('Please enter an event name.')
    if (!form.type) return setError('Please select an event type.')
    if (!form.eventDate) return setError('Please select a date.')
    if (!form.location.trim()) return setError('Please enter a location.')
    if (!form.description.trim()) return setError('Please add a description.')

    setLoading(true)
    try {
      await submitEvent({
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        eventDate: form.eventDate,
        location: form.location.trim(),
        region: form.region || undefined,
        organizerId: user.id,
      })
      setSubmitted(true)
    } catch {
      setError('Failed to submit event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Submit an event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event submitted</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your event has been added to the calendar. Share it with the community in the regional forums.
            </p>
            <button onClick={() => { onSubmitted(); onClose() }}
              className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. DFW 5 Series meet"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">Select type</option>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input type="text" name="location" value={form.location} onChange={handleChange}
                  placeholder="City, ST or venue name"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region <span className="text-gray-400 font-normal">(optional)</span></label>
                <select name="region" value={form.region} onChange={handleChange}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">Select region</option>
                  {REGIONAL_SUBFORUMS.map(r => (
                    <option key={r.id} value={r.id}>{r.flag} {r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={4}
                placeholder="Tell people what to expect — parking, dress code, any registration required..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose}
                className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors">
                {loading ? <><Loader2 size={13} className="animate-spin" /> Submitting...</> : 'Submit event'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

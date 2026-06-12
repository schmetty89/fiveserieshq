'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, MapPin, Users, Calendar, ChevronRight } from 'lucide-react'
import { getEvents } from '@/lib/event-data'
import { REGIONAL_SUBFORUMS } from '@/lib/forum-config'
import { useAuth } from '@/components/auth/AuthProvider'
import { SubmitEventModal } from './SubmitEventModal'

interface Event {
  id: string
  name: string
  description: string
  type: string
  event_date: string
  location: string
  region?: string
  attendee_count: number
  created_at: string
  profiles: { username: string } | { username: string }[]
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  'meetup':    { label: 'Meetup',    icon: '🤝', bg: '#E6F1FB', text: '#185FA5' },
  'track-day': { label: 'Track day', icon: '🏁', bg: '#E1F5EE', text: '#0F6E56' },
  'show':      { label: 'Show',      icon: '🏆', bg: '#FAEEDA', text: '#854F0B' },
}

const TYPE_FILTERS = [
  { value: '', label: 'All events' },
  { value: 'meetup', label: '🤝 Meetups' },
  { value: 'track-day', label: '🏁 Track days' },
  { value: 'show', label: '🏆 Shows' },
]

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate().toString(),
    full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  }
}

function groupEventsByMonth(events: Event[]) {
  const groups: Record<string, Event[]> = {}
  events.forEach(e => {
    const date = new Date(e.event_date + 'T00:00:00')
    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })
  return groups
}

export function EventsCalendar() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getEvents({
        type: typeFilter || undefined,
        region: regionFilter || undefined,
      })
      setEvents(data as Event[])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [typeFilter, regionFilter])

  useEffect(() => { loadEvents() }, [loadEvents])

  const grouped = groupEventsByMonth(events)

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Events</h1>
          <p className="text-sm text-gray-500">Meetups, track days, and shows — submit yours or find one near you.</p>
        </div>
        {user && (
          <button onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0">
            <Plus size={14} /> Submit event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                typeFilter === f.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setRegionFilter('')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !regionFilter ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            All regions
          </button>
          {REGIONAL_SUBFORUMS.map(r => (
            <button key={r.id} onClick={() => setRegionFilter(r.id === regionFilter ? '' : r.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                regionFilter === r.id ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {r.flag} {r.name.replace(' US', '').replace(' Canada', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <Calendar size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">No upcoming events</p>
          <p className="text-xs text-gray-400 mb-4">Try adjusting your filters or be the first to add one.</p>
          {user && (
            <button onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
              <Plus size={13} /> Submit event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                {month}
              </h2>
              <div className="space-y-3">
                {monthEvents.map(event => {
                  const { month: m, day, full } = formatEventDate(event.event_date)
                  const typeConf = TYPE_CONFIG[event.type] ?? { label: event.type, icon: '📅', bg: '#F3F4F6', text: '#374151' }
                  const regionInfo = REGIONAL_SUBFORUMS.find(r => r.id === event.region)
                  const isExpanded = expandedId === event.id
                  const organizer = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles

                  return (
                    <div key={event.id}
                      className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                      <div className="flex items-start gap-4 p-5">
                        {/* Date badge */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0 text-center">
                          <div className="text-[10px] font-bold text-gray-400 tracking-widest">{m}</div>
                          <div className="text-2xl font-bold text-gray-900 leading-none">{day}</div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-900">{event.name}</h3>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: typeConf.bg, color: typeConf.text }}>
                              {typeConf.icon} {typeConf.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />{full}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />{event.location}
                            </span>
                            {regionInfo && (
                              <span>{regionInfo.flag} {regionInfo.name}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users size={11} />{event.attendee_count} attending
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : event.id)}
                              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              {isExpanded ? 'Hide details' : 'Show details'}
                              <ChevronRight size={11} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                            <button
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                            >
                              <Users size={11} /> Attend
                            </button>
                            {organizer && (
                              <span className="text-xs text-gray-400 ml-1">by {organizer.username}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded description */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit CTA strip */}
      <div className="mt-10 border border-gray-100 rounded-xl p-6 bg-gray-50 flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">Organising an event?</p>
          <p className="text-xs text-gray-500">Add it to the calendar so the community can find it. Meetups, track days, shows — all welcome.</p>
        </div>
        {user ? (
          <button onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0">
            <Plus size={13} /> Submit event
          </button>
        ) : (
          <a href="/auth/join"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0">
            Join to submit
          </a>
        )}
      </div>

      {showSubmitModal && (
        <SubmitEventModal
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={loadEvents}
        />
      )}
    </div>
  )
}

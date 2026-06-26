'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, ChevronRight, ChevronDown, MapPin } from 'lucide-react'
import { GENERATIONS, Generation } from '@/types'
import { GENERATION_YEARS } from '@/types'
import { GEN_SUBFORUM_CATS, REGIONAL_SUBFORUMS, GEN_COLORS, GENERATION_ENGINES, GENERATION_TRANSMISSIONS } from '@/lib/forum-config'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'

const TECH_CATS = ['engine', 'drivetrain', 'suspension', 'electrical']

export function ForumIndex() {
  const { user } = useAuth()
  const [genThreadCounts, setGenThreadCounts] = useState<Record<string, number>>({
    E34: 0, E39: 0, E60: 0, F10: 0, G30: 0,
  })
  const [regionalThreadCount, setRegionalThreadCount] = useState<number>(0)
  const [countsLoading, setCountsLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      const supabase = createClient()

      const { data: genData } = await supabase
        .from('threads')
        .select('generation')
        .eq('is_deleted', false)
        .not('generation', 'is', null)

      if (genData) {
        const counts: Record<string, number> = { E34: 0, E39: 0, E60: 0, F10: 0, G30: 0 }
        for (const row of genData) {
          if (row.generation && counts[row.generation] !== undefined) {
            counts[row.generation]++
          }
        }
        setGenThreadCounts(counts)
      }

      const { count: regionalCount } = await supabase
        .from('threads')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .not('region_id', 'is', null)

      setRegionalThreadCount(regionalCount ?? 0)
      setCountsLoading(false)
    }

    fetchCounts()
  }, [])

  const [activeFilter, setActiveFilter] = useState<Generation | 'all' | 'regional'>('all')
  const [expandedEngineGen, setExpandedEngineGen] = useState<Generation | null>(null)
  const [expandedDrivetrainGen, setExpandedDrivetrainGen] = useState<Generation | null>(null)
  const [openTransmissionGroups, setOpenTransmissionGroups] = useState<Set<string>>(new Set())

  function toggleTransmissionGroup(key: string) {
    setOpenTransmissionGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const showGen = activeFilter === 'all' || GENERATIONS.includes(activeFilter as Generation)
  const showRegional = activeFilter === 'all' || activeFilter === 'regional'
  const filteredGens = activeFilter === 'all' || activeFilter === 'regional'
    ? GENERATIONS
    : [activeFilter as Generation]

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Forums</h1>
          <p className="text-sm text-gray-500">Discuss, ask, and share across every generation and region.</p>
        </div>
        {user && (
          <Link
            href="/forums/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Edit size={14} /> New thread
          </Link>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(['all', ...GENERATIONS, 'regional'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f as typeof activeFilter)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              activeFilter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {f === 'all' ? 'All' : f === 'regional' ? '📍 Regional' : f}
          </button>
        ))}
      </div>

      {/* Generation subforums */}
      {showGen && (
        <div className="space-y-3 mb-6">
          {filteredGens.map(gen => {
            const { bg, text } = GEN_COLORS[gen]
            const techCats = GEN_SUBFORUM_CATS.filter(c => TECH_CATS.includes(c.id))
            const otherCats = GEN_SUBFORUM_CATS.filter(c => !TECH_CATS.includes(c.id))

            return (
              <div key={gen} className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Gen header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: bg, color: text }}>
                    {gen}
                  </span>
                  <span className="text-sm font-medium text-gray-800 flex-1">
                    BMW {gen} · {GENERATION_YEARS[gen]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {countsLoading ? '—' : genThreadCounts[gen].toLocaleString()} thread{genThreadCounts[gen] !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tech subsection label */}
                <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    🔧 Tech & maintenance
                  </span>
                </div>

                {/* Tech cats */}
                {techCats.map((cat) => {
                  if (cat.id === 'engine') {
                    const isExpanded = expandedEngineGen === gen
                    return (
                      <div key={cat.id} className="border-b border-gray-100">
                        <button
                          type="button"
                          onClick={() => setExpandedEngineGen(isExpanded ? null : gen)}
                          className="w-full flex items-center gap-3 px-4 py-3 pl-8 hover:bg-gray-50 transition-colors group text-left"
                        >
                          <div className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0" style={{ background: bg }}>
                            <span>{cat.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</div>
                            <div className="text-xs text-gray-400">{cat.desc}</div>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="bg-gray-50/50">
                            <Link
                              href={`/forums/subforum?gen=${gen}&cat=engine`}
                              className="flex items-center gap-3 px-4 py-2.5 pl-16 hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-sm text-gray-600 group-hover:text-gray-900">All engine discussion</span>
                            </Link>
                            {GENERATION_ENGINES[gen].map(eng => (
                              <Link
                                key={eng.id}
                                href={`/forums/subforum?gen=${gen}&cat=engine&engine=${eng.id}`}
                                className="flex items-center gap-3 px-4 py-2.5 pl-16 hover:bg-gray-50 transition-colors group"
                              >
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">{eng.code}</span>
                                <span className="text-xs text-gray-400">{eng.models}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  if (cat.id === 'drivetrain') {
                    const isExpanded = expandedDrivetrainGen === gen
                    const transmissions = GENERATION_TRANSMISSIONS[gen]
                    const groups: { type: 'manual' | 'automatic'; label: string }[] = [
                      { type: 'manual', label: 'Manual' },
                      { type: 'automatic', label: 'Automatic' },
                    ]
                    return (
                      <div key={cat.id} className="border-b border-gray-100">
                        <button
                          type="button"
                          onClick={() => setExpandedDrivetrainGen(isExpanded ? null : gen)}
                          className="w-full flex items-center gap-3 px-4 py-3 pl-8 hover:bg-gray-50 transition-colors group text-left"
                        >
                          <div className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0" style={{ background: bg }}>
                            <span>{cat.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</div>
                            <div className="text-xs text-gray-400">{cat.desc}</div>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="bg-gray-50/50">
                            <Link
                              href={`/forums/subforum?gen=${gen}&cat=drivetrain`}
                              className="flex items-center gap-3 px-4 py-2.5 pl-16 hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-sm text-gray-600 group-hover:text-gray-900">All drivetrain discussion</span>
                            </Link>
                            {groups.map(({ type, label }) => {
                              const groupKey = `${gen}-${type}`
                              const isGroupOpen = openTransmissionGroups.has(groupKey)
                              const items = transmissions.filter(t => t.type === type)
                              return (
                                <div key={type}>
                                  <button
                                    type="button"
                                    onClick={() => toggleTransmissionGroup(groupKey)}
                                    className="w-full flex items-center gap-3 px-4 py-2 pl-16 hover:bg-gray-50 transition-colors group text-left"
                                  >
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-1">{label}</span>
                                    <ChevronDown
                                      size={12}
                                      className={`text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                  {isGroupOpen && items.map(t => (
                                    <Link
                                      key={t.id}
                                      href={`/forums/subforum?gen=${gen}&cat=drivetrain&transmission=${t.id}`}
                                      className="flex items-center gap-3 px-4 py-2 pl-24 hover:bg-gray-50 transition-colors group"
                                    >
                                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{t.code}</span>
                                      <span className="text-xs text-gray-400">{t.models}</span>
                                    </Link>
                                  ))}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }
                  return (
                    <Link
                      key={cat.id}
                      href={`/forums/subforum?gen=${gen}&cat=${cat.id}`}
                      className="flex items-center gap-3 px-4 py-3 pl-8 hover:bg-gray-50 transition-colors group border-b border-gray-100"
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0" style={{ background: bg }}>
                        <span>{cat.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</div>
                        <div className="text-xs text-gray-400">{cat.desc}</div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                    </Link>
                  )
                })}

                {/* Other cats */}
                {otherCats.map((cat, idx) => (
                  <Link
                    key={cat.id}
                    href={`/forums/subforum?gen=${gen}&cat=${cat.id}`}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${
                      idx < otherCats.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0" style={{ background: bg }}>
                      <span>{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</div>
                      <div className="text-xs text-gray-400">{cat.desc}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Regional subforums */}
      {showRegional && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
              <MapPin size={10} /> Regional
            </span>
            <span className="text-sm font-medium text-gray-800 flex-1">Regional discussion — US & Canada</span>
            <span className="text-xs text-gray-400">
              {countsLoading ? '—' : regionalThreadCount.toLocaleString()} thread{regionalThreadCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* US */}
          <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">🇺🇸 United States</span>
          </div>
          {REGIONAL_SUBFORUMS.filter(r => !r.id.includes('canada')).map((region) => (
            <Link
              key={region.id}
              href={`/forums/subforum?region=${region.id}`}
              className={`flex items-center gap-3 px-4 py-3 pl-8 hover:bg-gray-50 transition-colors group border-b border-gray-100`}
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0 bg-gray-100">
                <MapPin size={13} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{region.name}</div>
                <div className="text-xs text-gray-400">{region.desc}</div>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
            </Link>
          ))}

          {/* Canada */}
          <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">🇨🇦 Canada</span>
          </div>
          {REGIONAL_SUBFORUMS.filter(r => r.id.includes('canada')).map((region, idx, arr) => (
            <Link
              key={region.id}
              href={`/forums/subforum?region=${region.id}`}
              className={`flex items-center gap-3 px-4 py-3 pl-8 hover:bg-gray-50 transition-colors group ${
                idx < arr.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0 bg-gray-100">
                <MapPin size={13} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{region.name}</div>
                <div className="text-xs text-gray-400">{region.desc}</div>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

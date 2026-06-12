'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, ChevronRight, MapPin } from 'lucide-react'
import { GENERATIONS, Generation } from '@/types'
import { GENERATION_YEARS } from '@/types'
import { GEN_SUBFORUM_CATS, REGIONAL_SUBFORUMS, GEN_COLORS } from '@/lib/forum-config'
import { useAuth } from '@/components/auth/AuthProvider'

const GEN_THREAD_COUNTS: Record<Generation, number> = {
  E34: 1240, E39: 3800, E60: 2100, F10: 1900, G30: 1400,
}

const TECH_CATS = ['powertrain', 'suspension', 'electrical']

export function ForumIndex() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState<Generation | 'all' | 'regional'>('all')

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
                    {GEN_THREAD_COUNTS[gen].toLocaleString()} threads
                  </span>
                </div>

                {/* Tech subsection label */}
                <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    🔧 Tech & maintenance
                  </span>
                </div>

                {/* Tech cats */}
                {techCats.map((cat, idx) => (
                  <Link
                    key={cat.id}
                    href={`/forums/subforum?gen=${gen}&cat=${cat.id}`}
                    className={`flex items-center gap-3 px-4 py-3 pl-8 hover:bg-gray-50 transition-colors group ${
                      idx < techCats.length - 1 ? 'border-b border-gray-100' : 'border-b border-gray-100'
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
              {REGIONAL_SUBFORUMS.reduce((a) => a + 180, 0).toLocaleString()} threads
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

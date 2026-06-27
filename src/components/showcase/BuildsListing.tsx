'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Wrench, LayoutGrid, List, Car } from 'lucide-react'
import { GEN_COLORS } from '@/lib/forum-config'
import { GENERATIONS, Generation } from '@/types'

interface BuildCard {
  id: string
  build_name: string
  year: number | null
  generation: string | null
  model: string | null
  engine: string | null
  build_status: 'planning' | 'in_progress' | 'complete' | 'sold' | 'retired'
  moderation_status: string
  created_at: string
  cover_photo_url: string | null
  component_count: number
  total_cost: number
  profiles: { username: string }
}

const BUILD_STATUS_STYLES: Record<string, string> = {
  planning:    'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  complete:    'bg-green-100 text-green-700',
  sold:        'bg-amber-100 text-amber-700',
  retired:     'bg-red-100 text-red-500',
}

const BUILD_STATUS_LABELS: Record<string, string> = {
  planning:    'Planning',
  in_progress: 'In Progress',
  complete:    'Complete',
  sold:        'Sold',
  retired:     'Retired',
}

export function BuildsListing() {
  const [builds, setBuilds] = useState<BuildCard[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [genFilter, setGenFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from('builds')
        .select(`
          id, build_name, year, generation, model, engine,
          build_status, moderation_status, created_at, user_id,
          profiles(username),
          build_photos(url, is_cover),
          build_components(cost, quantity)
        `)

      if (!user) {
        query = query.eq('moderation_status', 'verified')
      } else {
        query = query.or(`moderation_status.eq.verified,moderation_status.eq.in_progress_shared,user_id.eq.${user.id}`)
      }

      const { data } = await query.order('created_at', { ascending: false })

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: BuildCard[] = data.map((b: any) => {
          const photos: Array<{ url: string; is_cover: boolean }> = b.build_photos ?? []
          const comps: Array<{ cost: number | null; quantity: number | null }> = b.build_components ?? []
          const coverPhoto = photos.find(p => p.is_cover)
          const totalCost = comps.reduce((sum, c) => sum + (c.cost ?? 0) * (c.quantity ?? 1), 0)
          return {
            id: b.id,
            build_name: b.build_name,
            year: b.year,
            generation: b.generation,
            model: b.model,
            engine: b.engine,
            build_status: b.build_status,
            moderation_status: b.moderation_status,
            created_at: b.created_at,
            cover_photo_url: coverPhoto?.url ?? null,
            component_count: comps.length,
            total_cost: totalCost,
            profiles: Array.isArray(b.profiles) ? b.profiles[0] : b.profiles,
          }
        })
        setBuilds(mapped)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = builds
    .filter(b => !genFilter || b.generation === genFilter)
    .filter(b => !statusFilter || b.build_status === statusFilter)
    .sort((a, b) => {
      if (sort === 'most_components') return b.component_count - a.component_count
      if (sort === 'highest_cost') return b.total_cost - a.total_cost
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const toggleStyle = (active: boolean) =>
    `inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Build Showcase</h1>
          <p className="text-sm text-gray-500">Community BMW 5 Series builds — documented from start to finish.</p>
        </div>
        {userId && (
          <Link href="/builds/submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
            <Wrench size={14} /> Submit a build
          </Link>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          <button onClick={() => setView('grid')} className={toggleStyle(view === 'grid')}>
            <LayoutGrid size={14} /> Grid
          </button>
          <button onClick={() => setView('list')} className={toggleStyle(view === 'list')}>
            <List size={14} /> List
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setGenFilter('')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !genFilter ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            All
          </button>
          {GENERATIONS.map(gen => (
            <button key={gen} onClick={() => setGenFilter(gen === genFilter ? '' : gen)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                genFilter === gen ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {gen}
            </button>
          ))}
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">All statuses</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="complete">Complete</option>
          <option value="sold">Sold</option>
          <option value="retired">Retired</option>
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="newest">Newest</option>
          <option value="most_components">Most components</option>
          <option value="highest_cost">Highest cost</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <Car size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">No builds yet</p>
          <p className="text-xs text-gray-400 mb-4">Be the first to document your build.</p>
          {userId && (
            <Link href="/builds/submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
              <Wrench size={13} /> Submit a build
            </Link>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(build => {
            const genColors = build.generation ? GEN_COLORS[build.generation as Generation] : null
            return (
              <Link key={build.id} href={`/builds/${build.id}`}
                className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors group">
                <div className="relative w-full aspect-[4/3] bg-gray-100">
                  {build.cover_photo_url ? (
                    <Image src={build.cover_photo_url} alt={build.build_name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Car size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1.5 line-clamp-1">{build.build_name}</p>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {genColors && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: genColors.bg, color: genColors.text }}>
                        {build.generation}
                      </span>
                    )}
                    {build.engine && <span className="text-xs text-gray-500">{build.engine}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${BUILD_STATUS_STYLES[build.build_status] ?? ''}`}>
                      {BUILD_STATUS_LABELS[build.build_status] ?? build.build_status}
                    </span>
                    <span className="text-xs text-gray-400">@{build.profiles?.username}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(build => {
            const genColors = build.generation ? GEN_COLORS[build.generation as Generation] : null
            return (
              <Link key={build.id} href={`/builds/${build.id}`}
                className="flex items-center gap-4 border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors group">
                <div className="relative w-20 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {build.cover_photo_url ? (
                    <Image src={build.cover_photo_url} alt={build.build_name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Car size={18} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1 truncate">{build.build_name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {genColors && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: genColors.bg, color: genColors.text }}>
                        {build.generation}
                      </span>
                    )}
                    {build.engine && <span className="text-xs text-gray-500">{build.engine}</span>}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${BUILD_STATUS_STYLES[build.build_status] ?? ''}`}>
                      {BUILD_STATUS_LABELS[build.build_status] ?? build.build_status}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right hidden sm:block">
                  <p className="text-xs text-gray-500">{build.component_count} components</p>
                  {build.total_cost > 0 && (
                    <p className="text-xs text-gray-500">${build.total_cost.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-gray-400">@{build.profiles?.username}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

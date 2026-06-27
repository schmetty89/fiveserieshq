'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Car, Pencil } from 'lucide-react'
import { GEN_COLORS } from '@/lib/forum-config'

interface Props { buildId: string }

interface Build {
  id: string
  user_id: string
  year: number | null
  generation: string | null
  model: string | null
  engine: string | null
  transmission: string | null
  exterior_color: string | null
  interior_color: string | null
  mileage: number | null
  vin: string | null
  production_date: string | null
  factory_options: string | null
  build_name: string
  build_description: string | null
  build_goals: string | null
  inspiration: string | null
  moderation_status: string
  build_status: string
  admin_notes: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
  profiles: { username: string } | null
}

interface Component {
  id: string
  section: string
  category: string | null
  name: string
  manufacturer: string | null
  supplier: string | null
  part_number: string | null
  cost: number | null
  quantity: number | null
  status: string
  description: string | null
  sort_order: number
}

interface Photo {
  id: string
  url: string
  caption: string | null
  is_cover: boolean
  sort_order: number
  gallery_category: string | null
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

const COMPONENT_STATUS_STYLES: Record<string, string> = {
  installed: 'bg-green-100 text-green-700',
  ordered:   'bg-amber-100 text-amber-700',
  planned:   'bg-gray-100 text-gray-600',
  removed:   'bg-red-100 text-red-500',
}

const SECTIONS = ['powertrain', 'drivetrain', 'suspension', 'wheels_tires', 'brakes', 'exterior', 'interior', 'electronics']

const SECTION_LABELS: Record<string, string> = {
  powertrain:   'Powertrain',
  drivetrain:   'Drivetrain',
  suspension:   'Suspension',
  wheels_tires: 'Wheels & Tires',
  brakes:       'Brakes',
  exterior:     'Exterior',
  interior:     'Interior',
  electronics:  'Electronics',
}

export function BuildDetail({ buildId }: Props) {
  const [build, setBuild] = useState<Build | null>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'photos'>('overview')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: buildData } = await supabase
        .from('builds')
        .select('*, profiles(username)')
        .eq('id', buildId)
        .single()

      if (!buildData) { setNotFound(true); setLoading(false); return }

      const isPublic = buildData.moderation_status === 'verified' || buildData.moderation_status === 'in_progress_shared'
      const owner = user?.id === buildData.user_id

      let admin = false
      if (user && !owner && !isPublic) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        admin = profile?.role === 'admin' || profile?.role === 'moderator'
      }

      if (!isPublic && !owner && !admin) { setNotFound(true); setLoading(false); return }

      const [{ data: comps }, { data: pics }] = await Promise.all([
        supabase.from('build_components').select('*').eq('build_id', buildId).order('sort_order', { ascending: true }),
        supabase.from('build_photos').select('*').eq('build_id', buildId).order('sort_order', { ascending: true }),
      ])

      setBuild(buildData as Build)
      setComponents(comps ?? [])
      setPhotos(pics ?? [])
      setIsOwner(owner)
      setLoading(false)
    }
    load()
  }, [buildId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full aspect-[16/9] bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-6 bg-gray-100 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
      </div>
    )
  }

  if (notFound || !build) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
        <Car size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-500 mb-1">Build not found</p>
        <p className="text-xs text-gray-400 mb-4">This build doesn&apos;t exist or isn&apos;t publicly visible.</p>
        <Link href="/builds" className="text-sm text-blue-600 hover:underline">← Back to showcase</Link>
      </div>
    )
  }

  const coverPhoto = photos.find(p => p.is_cover) ?? photos[0] ?? null
  const installedCount = components.filter(c => c.status === 'installed').length
  const progressPct = components.length > 0 ? Math.round((installedCount / components.length) * 100) : 0
  const totalCost = components.reduce((sum, c) => sum + (c.cost ?? 0) * (c.quantity ?? 1), 0)
  const genColors = build.generation ? GEN_COLORS[build.generation as keyof typeof GEN_COLORS] : null
  const profile = Array.isArray(build.profiles) ? build.profiles[0] : build.profiles

  const tabStyle = (tab: string) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-gray-900 text-gray-900'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <div>
      {/* Hero */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-6">
        {coverPhoto ? (
          <Image src={coverPhoto.url} alt={build.build_name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car size={48} className="text-gray-300" />
          </div>
        )}
        {coverPhoto && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl font-semibold text-white mb-2">{build.build_name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                {genColors && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ background: genColors.bg, color: genColors.text }}>
                    {build.generation}
                  </span>
                )}
                {build.engine && <span className="text-xs text-white/80">{build.engine}</span>}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BUILD_STATUS_STYLES[build.build_status] ?? ''}`}>
                  {BUILD_STATUS_LABELS[build.build_status] ?? build.build_status}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {!coverPhoto && (
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{build.build_name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {genColors && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: genColors.bg, color: genColors.text }}>
                {build.generation}
              </span>
            )}
            {build.engine && <span className="text-xs text-gray-500">{build.engine}</span>}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BUILD_STATUS_STYLES[build.build_status] ?? ''}`}>
              {BUILD_STATUS_LABELS[build.build_status] ?? build.build_status}
            </span>
          </div>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">by @{profile?.username}</span>
          <span className="text-xs text-gray-400">{new Date(build.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          {components.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-xs text-gray-500">{progressPct}% installed</span>
            </div>
          )}
          {isOwner && build.moderation_status !== 'verified' && (
            <Link href={`/builds/submit?id=${build.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-gray-300 transition-colors">
              <Pencil size={12} /> Edit build
            </Link>
          )}
        </div>
      </div>

      {/* Moderation status banner — owner only */}
      {isOwner && build.moderation_status !== 'verified' && (
        <div className={`rounded-lg px-4 py-3 mb-6 text-sm ${
          build.moderation_status === 'rejected'
            ? 'bg-red-50 border border-red-100 text-red-700'
            : build.moderation_status === 'draft'
            ? 'bg-gray-50 border border-gray-200 text-gray-600'
            : 'bg-amber-50 border border-amber-100 text-amber-700'
        }`}>
          {build.moderation_status === 'draft' && (
            <div className="flex items-center justify-between gap-4">
              <span>This build is a draft. Submit it for review when ready.</span>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase
                    .from('builds')
                    .update({ moderation_status: 'pending_initial' })
                    .eq('id', build.id)
                  window.location.reload()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                Submit for review
              </button>
            </div>
          )}
          {build.moderation_status === 'pending_initial' && 'Your build is pending initial review.'}
          {build.moderation_status === 'in_progress_shared' && 'Your build is under review and visible to members.'}
          {build.moderation_status === 'proofreading' && 'Your build is in proofreading.'}
          {build.moderation_status === 'pending_final' && 'Your build is pending final approval.'}
          {build.moderation_status === 'rejected' && `Your build was rejected${build.admin_notes ? `: ${build.admin_notes}` : '.'}`}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-6 flex">
        <button onClick={() => setActiveTab('overview')} className={tabStyle('overview')}>Overview</button>
        <button onClick={() => setActiveTab('components')} className={tabStyle('components')}>
          Components{components.length > 0 && <span className="ml-1 text-xs text-gray-400">({components.length})</span>}
        </button>
        <button onClick={() => setActiveTab('photos')} className={tabStyle('photos')}>
          Photos{photos.length > 0 && <span className="ml-1 text-xs text-gray-400">({photos.length})</span>}
        </button>
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {build.build_description && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">About this build</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{build.build_description}</p>
            </div>
          )}
          {build.build_goals && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Goals</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{build.build_goals}</p>
            </div>
          )}
          {build.inspiration && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Inspiration</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{build.inspiration}</p>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Vehicle specs</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 border border-gray-100 rounded-xl p-4">
              {([
                ['Year', build.year?.toString()],
                ['Model', build.model],
                ['Generation', build.generation],
                ['Engine', build.engine],
                ['Transmission', build.transmission],
                ['Exterior color', build.exterior_color],
                ['Interior color', build.interior_color],
                ['Mileage', build.mileage ? `${build.mileage.toLocaleString()} mi` : null],
                ['Production date', build.production_date],
              ] as [string, string | null | undefined][]).filter(([, val]) => val).map(([label, val]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
                  <span className="text-sm text-gray-700">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {build.factory_options && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Factory options</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{build.factory_options}</p>
            </div>
          )}

          {totalCost > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Cost summary</h2>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Total invested</span>
                  <span className="text-sm font-semibold text-gray-900">${totalCost.toLocaleString()}</span>
                </div>
                {['powertrain', 'suspension', 'wheels_tires'].map(section => {
                  const sectionCost = components
                    .filter(c => c.section === section)
                    .reduce((sum, c) => sum + (c.cost ?? 0) * (c.quantity ?? 1), 0)
                  if (!sectionCost) return null
                  return (
                    <div key={section} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-500">{SECTION_LABELS[section]}</span>
                      <span className="text-xs text-gray-700">${sectionCost.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Components tab */}
      {activeTab === 'components' && (
        <div>
          {components.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No components documented yet.</p>
          ) : (
            <div className="space-y-6">
              {SECTIONS.filter(section => components.some(c => c.section === section)).map(section => (
                <div key={section}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {SECTION_LABELS[section]}
                  </h3>
                  <div className="space-y-2">
                    {components.filter(c => c.section === section).map(comp => (
                      <div key={comp.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-800">{comp.name}</span>
                            {comp.manufacturer && <span className="text-xs text-gray-400">{comp.manufacturer}</span>}
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${COMPONENT_STATUS_STYLES[comp.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
                            </span>
                          </div>
                          {comp.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{comp.description}</p>
                          )}
                        </div>
                        {comp.cost != null && (
                          <span className="text-xs text-gray-600 flex-shrink-0 ml-3">
                            ${((comp.cost) * (comp.quantity ?? 1)).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {totalCost > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-sm font-semibold text-gray-900">${totalCost.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Photos tab */}
      {activeTab === 'photos' && (
        <div>
          {photos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...photos].sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0)).map(photo => (
                <div key={photo.id} className="group">
                  <a href={photo.url} target="_blank" rel="noopener noreferrer">
                    <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={photo.url} alt={photo.caption ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {photo.is_cover && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          ★ Cover
                        </div>
                      )}
                    </div>
                  </a>
                  {photo.caption && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

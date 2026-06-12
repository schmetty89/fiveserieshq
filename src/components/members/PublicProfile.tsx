'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, MessageCircle, Car, Youtube } from 'lucide-react'
import { getProfile, getGarageCars, getMemberThreads } from '@/lib/member-data'
import { GEN_COLORS } from '@/lib/forum-config'
import { Generation } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { TierBadge } from './TierBadge'

interface Props { username: string }

interface ProfileData {
  id: string
  username: string
  bio?: string
  location?: string
  member_number: number
  post_count: number
  build_count: number
  video_count: number
  tier: number
  created_at: string
}

interface Car {
  id: string
  year: number
  model: string
  generation: string
  color_name: string
  color_code: string
  mileage?: string
  is_primary: boolean
}

interface Thread {
  id: string
  title: string
  generation?: string
  reply_count: number
  created_at: string
}

export function PublicProfile({ username }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'garage' | 'activity'>('garage')

  useEffect(() => {
    async function load() {
      const p = await getProfile(username)
      if (!p) { setLoading(false); return }
      setProfile(p as ProfileData)
      const [c, t] = await Promise.all([getGarageCars(p.id), getMemberThreads(p.id)])
      setCars(c as Car[])
      setThreads(t as Thread[])
      setLoading(false)
    }
    load()
  }, [username])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-2">Member not found.</p>
        <Link href="/forums" className="text-sm text-blue-600 hover:underline">Back to forums</Link>
      </div>
    )
  }

  const initials = profile.username.substring(0, 2).toUpperCase()
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

      {/* Sidebar */}
      <aside className="space-y-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-semibold mb-3">
            {initials}
          </div>
          <div className="flex items-center gap-2 justify-center">
            <h1 className="text-lg font-semibold text-gray-900">{profile.username}</h1>
            <TierBadge tier={profile.tier ?? 1} size={18} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Member #{profile.member_number}</p>
        </div>

        {profile.bio && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">About</p>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Info</p>
          {profile.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-gray-400" />{profile.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-gray-400" />Member since {joinDate}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle size={14} className="text-gray-400" />{profile.post_count} posts
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Car size={14} className="text-gray-400" />{profile.build_count} builds
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Youtube size={14} className="text-gray-400" />{profile.video_count} videos
          </div>
        </div>
      </aside>

      {/* Main */}
      <div>
        <div className="flex border-b border-gray-100 mb-6">
          {(['garage', 'activity'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-gray-900 font-medium border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}>
              {tab === 'garage' ? '🚗 Garage' : '💬 Forum activity'}
            </button>
          ))}
        </div>

        {activeTab === 'garage' && (
          cars.length === 0 ? (
            <div className="text-center py-12">
              <Car size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No cars in garage yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cars.map(car => {
                const colors = GEN_COLORS[car.generation as Generation]
                return (
                  <div key={car.id} className={`border rounded-xl overflow-hidden ${car.is_primary ? 'border-blue-200' : 'border-gray-100'}`}>
                    <div className="h-24 bg-gray-50 flex items-center justify-center relative">
                      <span className="text-4xl">🚗</span>
                      {car.is_primary && (
                        <div className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Primary
                        </div>
                      )}
                      <div className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: colors?.bg, color: colors?.text }}>
                        {car.generation}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{car.year} BMW {car.model}</p>
                      <p className="text-xs text-gray-500">{car.color_name}{car.color_code ? ` (${car.color_code})` : ''}</p>
                      {car.mileage && <p className="text-xs text-gray-400 mt-0.5">{car.mileage} miles</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {activeTab === 'activity' && (
          threads.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No forum posts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {threads.map(t => {
                const colors = t.generation ? GEN_COLORS[t.generation as Generation] : null
                return (
                  <Link key={t.id} href={`/forums/thread/${t.id}`}
                    className="flex items-start gap-3 py-3.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors mb-1">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {colors && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: colors.bg, color: colors.text }}>
                            {t.generation}
                          </span>
                        )}
                        <span>{t.reply_count} replies</span>
                        <span>{formatRelativeTime(t.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

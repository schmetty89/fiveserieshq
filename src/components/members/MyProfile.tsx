'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, MessageCircle, Car, Youtube, Edit, Save, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getGarageCars, getMemberThreads, updateProfile } from '@/lib/member-data'
import { GarageTab } from './GarageTab'
import { TierBadge } from './TierBadge'
import { formatRelativeTime } from '@/lib/utils'
import { GEN_COLORS } from '@/lib/forum-config'
import { Generation } from '@/types'

type Tab = 'garage' | 'activity' | 'builds' | 'videos'

interface Thread {
  id: string
  title: string
  generation?: string
  category?: string
  reply_count: number
  created_at: string
}

interface GarageCar {
  id: string
  year: number
  model: string
  generation: string
  body_style: string
  color_name: string
  color_code: string
  mileage?: string
  vin_last5?: string
  is_primary: boolean
  build_id?: string
}

export function MyProfile() {
  const { user, profile, isTier2 } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('garage')
  const [cars, setCars] = useState<GarageCar[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ bio: '', location: '' })
  const [saving, setSaving] = useState(false)

  const loadCars = useCallback(async () => {
    if (!user) return
    setLoadingCars(true)
    const data = await getGarageCars(user.id)
    setCars(data as GarageCar[])
    setLoadingCars(false)
  }, [user])

  const loadThreads = useCallback(async () => {
    if (!user) return
    setLoadingThreads(true)
    const data = await getMemberThreads(user.id)
    setThreads(data as Thread[])
    setLoadingThreads(false)
  }, [user])

  useEffect(() => { loadCars() }, [loadCars])

  useEffect(() => {
    if (activeTab === 'activity') loadThreads()
  }, [activeTab, loadThreads])

  useEffect(() => {
    if (profile) {
      setEditForm({ bio: profile.bio ?? '', location: profile.location ?? '' })
    }
  }, [profile])

  async function handleSaveProfile() {
    if (!user) return
    setSaving(true)
    try {
      await updateProfile(user.id, { bio: editForm.bio, location: editForm.location })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-3">You need to be signed in to view your profile.</p>
        <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:underline">Sign in</Link>
      </div>
    )
  }

  const initials = profile.username?.substring(0, 2).toUpperCase() ?? '??'
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'garage', label: 'Garage', icon: <Car size={14} /> },
    { id: 'activity', label: 'Forum activity', icon: <MessageCircle size={14} /> },
    { id: 'builds', label: 'Builds', icon: <Car size={14} /> },
    { id: 'videos', label: 'Videos', icon: <Youtube size={14} /> },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

      {/* ── Left sidebar ── */}
      <aside className="space-y-6">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-semibold mb-3">
            {initials}
          </div>
          <div className="flex items-center gap-2 justify-center">
            <h1 className="text-lg font-semibold text-gray-900">{profile.username}</h1>
            <TierBadge tier={profile.tier ?? 1} size={18} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Member #{profile.member_number}</p>
          <Link
            href={`/members/${profile.username}`}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            View public profile
          </Link>
        </div>

        {/* Edit profile */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit size={13} /> Edit profile
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Tell the community about yourself and your car..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Dallas, TX"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Bio */}
        {!editing && profile.bio && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">About</p>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Info rows */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Info</p>
          {profile.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-gray-400 flex-shrink-0" />
              {profile.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            Member since {joinDate}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle size={14} className="text-gray-400 flex-shrink-0" />
            {profile.post_count} forum posts
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Car size={14} className="text-gray-400 flex-shrink-0" />
            {profile.build_count} builds
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Youtube size={14} className="text-gray-400 flex-shrink-0" />
            {profile.video_count} videos submitted
          </div>
        </div>

        {/* Membership tier */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Membership</p>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isTier2 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {isTier2 ? '✓ Tier 2 — Full access' : '⏳ Tier 1 — Pending approval'}
            </span>
          </div>
          {!isTier2 && (
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Your account is pending Tier 2 approval. An admin will review your account shortly.
            </p>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div>
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'text-gray-900 font-medium border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Garage */}
        {activeTab === 'garage' && (
          loadingCars ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <GarageTab cars={cars} userId={user.id} onRefresh={loadCars} />
          )
        )}

        {/* Activity */}
        {activeTab === 'activity' && (
          loadingThreads ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No forum posts yet.</p>
              <Link href="/forums" className="text-sm text-blue-600 hover:underline mt-1 block">Browse forums</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {threads.map(t => {
                const colors = t.generation ? GEN_COLORS[t.generation as Generation] : null
                return (
                  <Link key={t.id} href={`/forums/thread/${t.id}`}
                    className="flex items-start gap-3 py-3.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors mb-1 leading-snug">
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

        {/* Builds */}
        {activeTab === 'builds' && (
          <div className="text-center py-12">
            <Car size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">Build showcase coming soon</p>
            <p className="text-xs text-gray-400">Upload a build book to create your first build page.</p>
            <Link href="/builds" className="text-sm text-blue-600 hover:underline mt-2 block">Learn more</Link>
          </div>
        )}

        {/* Videos */}
        {activeTab === 'videos' && (
          <div className="text-center py-12">
            <Youtube size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">No videos submitted yet</p>
            <Link href="/videos" className="text-sm text-blue-600 hover:underline mt-1 block">Submit a video</Link>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Play, Heart, Youtube, ChevronRight } from 'lucide-react'
import { getVideos } from '@/lib/video-data'
import { VIDEO_CATEGORIES } from '@/lib/video-config'
import { GEN_COLORS } from '@/lib/forum-config'
import { getYouTubeThumbnail } from '@/lib/utils'
import { GENERATIONS, Generation } from '@/types'
import { useAuth } from '@/components/auth/AuthProvider'
import { SubmitVideoModal } from './SubmitVideoModal'

interface Video {
  id: string
  youtube_id: string
  title: string
  channel_name: string
  category: string
  generation: string
  duration: string
  like_count: number
  created_at: string
  profiles: { username: string } | { username: string }[]
}

function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false)
  const [liked, setLiked] = useState(false)
  const colors = GEN_COLORS[video.generation as Generation]

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors group">
      {/* Thumbnail / player */}
      <div
        className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
        onClick={() => setPlaying(true)}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={getYouTubeThumbnail(video.youtube_id, 'mq')}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { (e.target as HTMLImageElement).src = '' }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play size={16} className="text-gray-900 ml-0.5" />
              </div>
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                {video.duration}
              </div>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 leading-snug mb-1.5 line-clamp-2">
          {video.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
          {colors && (
            <span className="font-medium px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: colors.bg, color: colors.text }}>
              {video.generation}
            </span>
          )}
          <span>{video.channel_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLiked(l => !l)}
            className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart size={12} className={liked ? 'fill-red-500' : ''} />
            {video.like_count + (liked ? 1 : 0)}
          </button>
          <a
            href={`https://youtube.com/watch?v=${video.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <Youtube size={12} /> YouTube
          </a>
        </div>
      </div>
    </div>
  )
}

export function VideoLibrary() {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genFilter, setGenFilter] = useState('')
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const loadVideos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getVideos({
        generation: genFilter || undefined,
        search: search || undefined,
      })
      setVideos(data as Video[])
    } catch {
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [genFilter, search])

  useEffect(() => {
    const t = setTimeout(loadVideos, 300)
    return () => clearTimeout(t)
  }, [loadVideos])

  // Group by category for Netflix-style rows
  const grouped = VIDEO_CATEGORIES.reduce((acc, cat) => {
    const catVideos = videos.filter(v => v.category === cat.id)
    if (catVideos.length > 0) acc[cat.id] = catVideos
    return acc
  }, {} as Record<string, Video[]>)

  const hasVideos = Object.keys(grouped).length > 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Video library</h1>
          <p className="text-sm text-gray-500">Member-submitted, admin-approved. Filter by generation or category.</p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <Youtube size={14} /> Submit video
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8 flex-wrap items-center">
        <div className="relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setGenFilter('')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !genFilter ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            All gens
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
      </div>

      {/* Netflix-style category rows */}
      {loading ? (
        <div className="space-y-10">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-5 bg-gray-100 rounded w-32 mb-4 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="aspect-video bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !hasVideos ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <Youtube size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">No videos yet</p>
          <p className="text-xs text-gray-400 mb-4">
            {search || genFilter ? 'Try adjusting your filters.' : 'Be the first to submit a video.'}
          </p>
          <button onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
            <Youtube size={13} /> Submit a video
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {VIDEO_CATEGORIES.filter(cat => grouped[cat.id]).map(cat => (
            <section key={cat.id}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>{cat.icon}</span>
                  {cat.label}
                  <span className="text-xs font-normal text-gray-400">
                    {grouped[cat.id].length} video{grouped[cat.id].length !== 1 ? 's' : ''}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {grouped[cat.id].map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Submit CTA */}
      <div className="mt-12 border border-gray-100 rounded-xl p-6 bg-gray-50 flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">Know a great video?</p>
          <p className="text-xs text-gray-500">Submit a YouTube link and it&apos;ll appear in the library once approved. DIY guides, build diaries, reviews — all welcome.</p>
        </div>
        <button onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0">
          <Youtube size={13} /> Submit video
        </button>
      </div>

      {showSubmitModal && (
        <SubmitVideoModal
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={loadVideos}
        />
      )}
    </div>
  )
}

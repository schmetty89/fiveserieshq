'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ReviewCard } from '@/components/admin/ReviewCard'
import { getPendingVideos, approveVideo, rejectVideo } from '@/lib/admin-data'
import { Loader2, CheckCircle } from 'lucide-react'

interface Video {
  id: string
  youtube_id: string
  title: string
  channel_name: string
  category: string
  generation: string
  duration: string
  profiles: { username: string } | { username: string }[]
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPendingVideos().then(data => {
      setVideos(data as Video[])
      setLoading(false)
    })
  }, [])

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Video submissions</h1>
        <p className="text-sm text-gray-500 mb-6">Review and approve community-submitted videos before they appear in the library.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">All caught up</p>
            <p className="text-xs text-gray-400 mt-1">No pending video submissions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map(video => {
              const submitter = Array.isArray(video.profiles) ? video.profiles[0] : video.profiles
              return (
                <ReviewCard
                  key={video.id}
                  title={video.title}
                  meta={`${video.channel_name} · ${video.generation} · ${video.category} · submitted by ${submitter?.username ?? 'Unknown'}`}
                  expandContent={
                    <div className="space-y-2">
                      <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtube_id}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <a
                        href={`https://youtube.com/watch?v=${video.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Open on YouTube ↗
                      </a>
                    </div>
                  }
                  onApprove={() => approveVideo(video.id)}
                  onReject={(reason) => rejectVideo(video.id, reason)}
                />
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

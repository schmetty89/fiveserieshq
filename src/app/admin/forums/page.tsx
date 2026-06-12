'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getRecentThreads, pinThread, solveThread, deleteThread } from '@/lib/admin-data'
import { formatRelativeTime } from '@/lib/utils'
import { GEN_COLORS } from '@/lib/forum-config'
import { Generation } from '@/types'
import { Pin, CheckCircle, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Thread {
  id: string
  title: string
  generation?: string
  category?: string
  is_pinned: boolean
  is_solved: boolean
  reply_count: number
  created_at: string
  profiles: { username: string } | { username: string }[]
}

export default function AdminForumsPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    getRecentThreads(50).then(data => {
      setThreads(data as Thread[])
      setLoading(false)
    })
  }, [])

  async function handlePin(id: string, current: boolean) {
    setActionId(id)
    await pinThread(id, !current)
    setThreads(ts => ts.map(t => t.id === id ? { ...t, is_pinned: !current } : t))
    setActionId(null)
  }

  async function handleSolve(id: string, current: boolean) {
    setActionId(id)
    await solveThread(id, !current)
    setThreads(ts => ts.map(t => t.id === id ? { ...t, is_solved: !current } : t))
    setActionId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this thread? This cannot be undone.')) return
    setActionId(id)
    await deleteThread(id)
    setThreads(ts => ts.filter(t => t.id !== id))
    setActionId(null)
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Forum moderation</h1>
        <p className="text-sm text-gray-500 mb-6">Pin, solve, or delete threads. Showing the 50 most recent.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-50">
              {threads.map(thread => {
                const author = Array.isArray(thread.profiles) ? thread.profiles[0] : thread.profiles
                const colors = thread.generation ? GEN_COLORS[thread.generation as Generation] : null
                const busy = actionId === thread.id

                return (
                  <div key={thread.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    {/* Thread info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        {colors && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: colors.bg, color: colors.text }}>
                            {thread.generation}
                          </span>
                        )}
                        {thread.is_pinned && (
                          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Pinned
                          </span>
                        )}
                        {thread.is_solved && (
                          <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            Solved
                          </span>
                        )}
                        <Link href={`/forums/thread/${thread.id}`} target="_blank"
                          className="text-sm font-medium text-gray-900 hover:text-blue-700 transition-colors truncate">
                          {thread.title}
                        </Link>
                      </div>
                      <p className="text-xs text-gray-400">
                        by {author?.username ?? 'Unknown'} · {formatRelativeTime(thread.created_at)} · {thread.reply_count} replies
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handlePin(thread.id, thread.is_pinned)}
                        disabled={busy}
                        title={thread.is_pinned ? 'Unpin' : 'Pin'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          thread.is_pinned
                            ? 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100'
                            : 'border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200'
                        }`}
                      >
                        {busy ? <Loader2 size={13} className="animate-spin" /> : <Pin size={13} />}
                      </button>
                      <button
                        onClick={() => handleSolve(thread.id, thread.is_solved)}
                        disabled={busy}
                        title={thread.is_solved ? 'Mark unsolved' : 'Mark solved'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          thread.is_solved
                            ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                            : 'border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-200'
                        }`}
                      >
                        {busy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                      </button>
                      <button
                        onClick={() => handleDelete(thread.id)}
                        disabled={busy}
                        title="Delete thread"
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                      >
                        {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

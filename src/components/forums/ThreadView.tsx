'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, CheckCircle, Pin, CornerDownRight, Loader2, Youtube } from 'lucide-react'
import { formatRelativeTime, extractYouTubeId } from '@/lib/utils'
import { GEN_COLORS } from '@/lib/forum-config'
import { getThread, getPosts, createPost, markThreadSolved } from '@/lib/forum-data'
import { useAuth } from '@/components/auth/AuthProvider'
import { TierBadge } from '@/components/members/TierBadge'
import { Generation } from '@/types'

interface PostProfile {
  username: string
  avatar_url?: string
  tier?: number
}

interface Post {
  id: string
  body: string
  image_urls?: string[]
  youtube_url?: string
  is_op: boolean
  created_at: string
  profiles: PostProfile | PostProfile[]
}

interface Thread {
  id: string
  title: string
  body: string
  generation?: string
  category?: string
  engine?: string
  transmission?: string
  regional_subforum?: string
  is_pinned: boolean
  is_solved: boolean
  reply_count: number
  view_count: number
  created_at: string
  last_reply_at: string
  profiles: PostProfile | PostProfile[]
}

interface Props { threadId: string }

export function ThreadView({ threadId }: Props) {
  const { user, isTier2 } = useAuth()
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyError, setReplyError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [t, p] = await Promise.all([getThread(threadId), getPosts(threadId)])
        setThread(t as Thread)
        setPosts(p as Post[])
      } catch {
        setThread(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [threadId])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return setReplyError('Reply cannot be empty.')
    if (!user) return setReplyError('You must be signed in to reply.')
    setSubmitting(true)
    setReplyError('')

    const ytId = extractYouTubeId(reply)

    try {
      await createPost({
        threadId,
        body: reply,
        youtubeUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : undefined,
        authorId: user.id,
      })
      const updated = await getPosts(threadId)
      setPosts(updated as Post[])
      setReply('')
    } catch {
      setReplyError('Failed to post reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMarkSolved() {
    if (!thread) return
    const newState = !thread.is_solved
    await markThreadSolved(threadId, newState)
    setThread(t => t ? { ...t, is_solved: newState } : null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-2/3" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-3">Thread not found.</p>
        <Link href="/forums" className="text-sm text-blue-600 hover:underline">Back to forums</Link>
      </div>
    )
  }

  const genColors = thread.generation ? GEN_COLORS[thread.generation as Generation] : null
  const threadAuthor = Array.isArray(thread.profiles) ? thread.profiles[0] : thread.profiles

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link href="/forums" className="hover:text-gray-600">Forums</Link>
        <ChevronRight size={12} />
        {thread.generation && (
          <>
            <Link
              href={`/forums/subforum?gen=${thread.generation}&cat=${thread.category}${thread.engine ? `&engine=${thread.engine}` : ''}${thread.transmission ? `&transmission=${thread.transmission}` : ''}`}
              className="hover:text-gray-600"
            >
              {thread.generation}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-gray-700 truncate max-w-xs">{thread.title}</span>
      </div>

      {/* Thread header */}
      <div className="mb-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {genColors && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: genColors.bg, color: genColors.text }}>
              {thread.generation}
            </span>
          )}
          {thread.is_pinned && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              <Pin size={10} /> Pinned
            </span>
          )}
          {thread.is_solved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
              <CheckCircle size={10} /> Solved
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">{thread.title}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{threadAuthor?.username ?? 'Unknown'}</span>
          <span>{formatRelativeTime(thread.created_at)}</span>
          <span>{thread.reply_count} replies</span>
          <span>{thread.view_count} views</span>
        </div>
      </div>

      {/* Posts */}
      <div className="divide-y divide-gray-100 mb-8">
        {posts.map((post) => {
          const postAuthor = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
          const ytId = post.youtube_url ? extractYouTubeId(post.youtube_url) : null

          return (
            <div key={post.id} className="flex gap-4 py-5">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-semibold">
                  {postAuthor?.username?.substring(0, 2).toUpperCase() ?? '??'}
                </div>
                {post.is_op && (
                  <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">OP</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">{postAuthor?.username ?? 'Unknown'}{postAuthor?.tier && <TierBadge tier={postAuthor.tier} size={13} />}</span>
                  <span className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</span>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                  {post.body}
                </div>
                {ytId && (
                  <div className="rounded-xl overflow-hidden mb-3 max-w-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {user && (
                    <button
                      onClick={() => setReply(`@${postAuthor?.username} `)}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      <CornerDownRight size={11} /> Reply
                    </button>
                  )}
                  {user && !post.is_op && (
                    <button
                      onClick={handleMarkSolved}
                      className={`text-xs flex items-center gap-1 transition-colors ${
                        thread.is_solved ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      <CheckCircle size={11} />
                      {thread.is_solved ? 'Marked as solved' : 'Mark as solved'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply composer */}
      {user && isTier2 ? (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Post a reply</h3>
          <form onSubmit={handleReply}>
            <textarea
              value={reply}
              onChange={e => { setReply(e.target.value); setReplyError('') }}
              placeholder="Write your reply... Paste a YouTube URL on its own line to embed it."
              rows={5}
              className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none mb-3"
            />
            {replyError && <p className="text-xs text-red-500 mb-3">{replyError}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Youtube size={13} />
                <span>Paste a YouTube link to embed inline</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? <><Loader2 size={13} className="animate-spin" /> Posting...</> : 'Post reply'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500">
            {!user ? (
              <><Link href="/auth/join" className="font-medium text-gray-900 hover:underline">Join FiveSeriesHQ</Link>{' '}or{' '}<Link href="/auth/login" className="font-medium text-gray-900 hover:underline">sign in</Link>{' '}to reply.</>
            ) : (
              <>Your account is pending Tier 2 approval. Once approved by an admin you can post and reply.</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

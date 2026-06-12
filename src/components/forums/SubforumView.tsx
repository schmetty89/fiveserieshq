'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Edit, CheckCircle, Pin, Clock, MessageCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { GEN_SUBFORUM_CATS, REGIONAL_SUBFORUMS, GEN_COLORS } from '@/lib/forum-config'
import { getThreads } from '@/lib/forum-data'
import { useAuth } from '@/components/auth/AuthProvider'
import { TierBadge } from '@/components/members/TierBadge'
import { Generation } from '@/types'

interface ThreadRow {
  id: string
  title: string
  generation?: string
  category?: string
  is_pinned: boolean
  is_solved: boolean
  reply_count: number
  last_reply_at: string
  profiles: { username: string; avatar_url?: string } | { username: string; avatar_url?: string }[]
}

interface Props {
  gen?: string
  cat?: string
  region?: string
}

export function SubforumView({ gen, cat, region }: Props) {
  const { user, isTier2 } = useAuth()
  const [threads, setThreads] = useState<ThreadRow[]>([])
  const [loading, setLoading] = useState(true)

  const isRegional = !!region
  const catInfo = GEN_SUBFORUM_CATS.find(c => c.id === cat)
  const regionInfo = REGIONAL_SUBFORUMS.find(r => r.id === region)
  const genColors = gen ? GEN_COLORS[gen as Generation] : null

  const isTechSub = cat && ['powertrain', 'suspension', 'electrical'].includes(cat)
  const techCats = GEN_SUBFORUM_CATS.filter(c => ['powertrain', 'suspension', 'electrical'].includes(c.id))

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getThreads({
          generation: gen,
          category: cat,
          regionalSubforum: region,
        })
        setThreads(data as ThreadRow[])
      } catch {
        setThreads([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [gen, cat, region])

  const title = isRegional
    ? regionInfo?.name ?? 'Regional'
    : catInfo?.name ?? 'Forum'

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link href="/forums" className="hover:text-gray-600 transition-colors">Forums</Link>
        <ChevronRight size={12} />
        {isRegional ? (
          <span className="text-gray-600">Regional</span>
        ) : (
          <>
            <span className="text-gray-600">{gen}</span>
            {isTechSub && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-600">Tech & maintenance</span>
              </>
            )}
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">{title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {genColors && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: genColors.bg, color: genColors.text }}>
              {gen}
            </span>
          )}
          {isRegional && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {regionInfo?.flag} Regional
            </span>
          )}
          <h1 className="text-xl font-medium text-gray-900">{title}</h1>
        </div>
        {user && isTier2 && (
          <Link
            href={`/forums/new?gen=${gen ?? ''}&cat=${cat ?? ''}&region=${region ?? ''}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Edit size={13} /> New thread
          </Link>
        )}
      </div>

      {/* Tech sub-tabs */}
      {isTechSub && gen && (
        <div className="flex gap-2 flex-wrap mb-5">
          {techCats.map(tc => (
            <Link key={tc.id} href={`/forums/subforum?gen=${gen}&cat=${tc.id}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                tc.id === cat ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {tc.icon} {tc.name}
            </Link>
          ))}
        </div>
      )}

      {/* Regional sub-tabs */}
      {isRegional && (
        <div className="flex gap-2 flex-wrap mb-5">
          {REGIONAL_SUBFORUMS.map(r => (
            <Link key={r.id} href={`/forums/subforum?region=${r.id}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                r.id === region ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {r.flag} {r.name}
            </Link>
          ))}
        </div>
      )}

      {/* Thread list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">No threads yet</p>
          <p className="text-xs text-gray-400 mb-4">Be the first to start a discussion.</p>
          {user ? (
            <Link href={`/forums/new?gen=${gen ?? ''}&cat=${cat ?? ''}&region=${region ?? ''}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium">
              <Edit size={13} /> Start a thread
            </Link>
          ) : (
            <Link href="/auth/join" className="text-sm text-blue-600 hover:underline">Join to post</Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {threads.map((thread) => {
            const author = Array.isArray(thread.profiles) ? thread.profiles[0] : thread.profiles
            return (
              <Link key={thread.id} href={`/forums/thread/${thread.id}`}
                className="flex items-start gap-3 py-4 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-semibold flex-shrink-0 mt-0.5">
                  {author?.username?.substring(0, 2).toUpperCase() ?? '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {thread.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                        <Pin size={9} /> Pinned
                      </span>
                    )}
                    {thread.is_solved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600">
                        <CheckCircle size={9} /> Solved
                      </span>
                    )}
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                      {thread.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">{author?.username ?? 'Unknown'}{author?.tier && <TierBadge tier={author.tier} size={12} />}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />{formatRelativeTime(thread.last_reply_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 text-xs text-gray-400">
                  <div className="font-medium text-gray-700 text-sm">{thread.reply_count}</div>
                  <div>replies</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

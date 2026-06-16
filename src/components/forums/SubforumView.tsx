'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Edit, CheckCircle, Pin, Clock, MessageCircle, Info } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { GEN_SUBFORUM_CATS, REGIONAL_SUBFORUMS, GEN_COLORS, GENERATION_ENGINES, GENERATION_TRANSMISSIONS } from '@/lib/forum-config'
import { getThreads } from '@/lib/forum-data'
import { useAuth } from '@/components/auth/AuthProvider'
import { TierBadge } from '@/components/members/TierBadge'
import { Generation } from '@/types'

interface ThreadRow {
  id: string
  title: string
  generation?: string
  category?: string
  engine?: string
  transmission?: string
  is_pinned: boolean
  is_solved: boolean
  reply_count: number
  last_reply_at: string
  profiles: { username: string; avatar_url?: string; tier?: number } | { username: string; avatar_url?: string; tier?: number }[]
}

interface Props {
  gen?: string
  cat?: string
  engine?: string
  transmission?: string
  region?: string
}

export function SubforumView({ gen, cat, engine, transmission, region }: Props) {
  const { user, isTier2 } = useAuth()
  const [threads, setThreads] = useState<ThreadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showInfoBox, setShowInfoBox] = useState(true)

  const isRegional = !!region
  const showCategoryList = !!gen && !cat && !region
  const catInfo = GEN_SUBFORUM_CATS.find(c => c.id === cat)
  const regionInfo = REGIONAL_SUBFORUMS.find(r => r.id === region)
  const genColors = gen ? GEN_COLORS[gen as Generation] : null

  const isTechSub = cat && ['engine', 'drivetrain', 'suspension', 'electrical'].includes(cat)
  const techCats = GEN_SUBFORUM_CATS.filter(c => ['engine', 'drivetrain', 'suspension', 'electrical'].includes(c.id))
  const isEngineSub = cat === 'engine' && !!gen
  const engineOptions = isEngineSub ? GENERATION_ENGINES[gen as Generation] : []
  const engineInfo = engineOptions.find(e => e.id === engine)

  const isDrivetrainSub = cat === 'drivetrain' && !!gen
  const transmissionOptions = isDrivetrainSub ? GENERATION_TRANSMISSIONS[gen as Generation] : []
  const transmissionInfo = transmissionOptions.find(t => t.id === transmission)
  const manualTransmissions = transmissionOptions.filter(t => t.type === 'manual')
  const autoTransmissions = transmissionOptions.filter(t => t.type === 'automatic')

  const subInfo = engineInfo ?? transmissionInfo

  useEffect(() => {
    if (showCategoryList) {
      setThreads([])
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      try {
        const data = await getThreads({
          generation: gen,
          category: cat,
          engine,
          transmission,
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
  }, [gen, cat, engine, transmission, region, showCategoryList])

  const title = isRegional
    ? regionInfo?.name ?? 'Regional'
    : showCategoryList
    ? `BMW ${gen}`
    : subInfo
    ? `${catInfo?.name} — ${subInfo.code}`
    : catInfo?.name ?? 'Forum'

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link href="/forums" className="hover:text-gray-600 transition-colors">Forums</Link>
        <ChevronRight size={12} />
        {isRegional ? (
          <span className="text-gray-600">Regional</span>
        ) : showCategoryList ? (
          <span className="text-gray-900 font-medium">{gen}</span>
        ) : (
          <>
            <span className="text-gray-600">{gen}</span>
            {isTechSub && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-600">Tech & maintenance</span>
              </>
            )}
            {subInfo && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-600">{catInfo?.name}</span>
              </>
            )}
          </>
        )}
        {!showCategoryList && (
          <>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium">{subInfo ? subInfo.code : title}</span>
          </>
        )}
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
        {user && isTier2 && !showCategoryList && (
          <Link
            href={`/forums/new?gen=${gen ?? ''}&cat=${cat ?? ''}&engine=${engine ?? ''}&transmission=${transmission ?? ''}&region=${region ?? ''}`}
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

      {/* Engine sub-tabs */}
      {isEngineSub && (
        <div className="flex gap-2 flex-wrap mb-5">
          <Link href={`/forums/subforum?gen=${gen}&cat=engine`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !engine ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            All
          </Link>
          {engineOptions.map(eng => (
            <Link key={eng.id} href={`/forums/subforum?gen=${gen}&cat=engine&engine=${eng.id}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                eng.id === engine ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {eng.code}
            </Link>
          ))}
        </div>
      )}

      {/* Drivetrain sub-tabs */}
      {isDrivetrainSub && (
        <div className="mb-5 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Link href={`/forums/subforum?gen=${gen}&cat=drivetrain`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                !transmission ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              All
            </Link>
          </div>
          {manualTransmissions.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Manual</div>
              <div className="flex gap-2 flex-wrap">
                {manualTransmissions.map(t => (
                  <Link key={t.id} href={`/forums/subforum?gen=${gen}&cat=drivetrain&transmission=${t.id}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      t.id === transmission ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {t.code}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {autoTransmissions.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Automatic</div>
              <div className="flex gap-2 flex-wrap">
                {autoTransmissions.map(t => (
                  <Link key={t.id} href={`/forums/subforum?gen=${gen}&cat=drivetrain&transmission=${t.id}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      t.id === transmission ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {t.code}
                  </Link>
                ))}
              </div>
            </div>
          )}
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

      {/* Discussion floor info callout */}
      {!!gen && !!cat && !region && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60">
          <button
            type="button"
            onClick={() => setShowInfoBox(s => !s)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-blue-900">
              <Info size={15} className="text-blue-500 flex-shrink-0" />
              This is the discussion floor.
            </span>
            <ChevronDown
              size={14}
              className={`text-blue-400 transition-transform flex-shrink-0 ${showInfoBox ? 'rotate-180' : ''}`}
            />
          </button>
          {showInfoBox && (
            <div className="px-4 pb-4 text-sm text-blue-800/90 leading-relaxed space-y-3">
              <p>
                The forums are for conversation — sharing experiences, debating setups, connecting with other owners, and the kind of back-and-forth that only a community can provide.
              </p>
              <p>
                If you&apos;re looking for a verified answer to a technical question, check the{' '}
                <Link href="/technical" className="font-medium underline hover:text-blue-900">Technical Library</Link>{' '}
                first — built so that knowledge lives somewhere permanent, searchable, and trustworthy rather than buried in a thread. Likewise, if build inspiration is what you&apos;re after, the{' '}
                <Link href="/builds" className="font-medium underline hover:text-blue-900">Build Showcase</Link>{' '}
                exists for exactly that.
              </p>
              <p>
                That said, this community is in its infancy. The technical library grows as the community contributes to it, and as future generations of the 5 Series are added to the site, their technical sections will start the same way — empty, but not for long. If you can&apos;t find what you&apos;re looking for in the tech section, post here — someone in the community will have the answer.
              </p>
              <p>
                But here&apos;s where you can make a real difference: if you get the answer you need, take a few minutes to document it in the Technical Library. What took you an hour to track down might save the next member — and every member after them — from starting from scratch. That one-for-all mentality is what separates a great community from just another forum. If you have knowledge worth sharing — whether it&apos;s a fix you figured out, a spec you confirmed, or a procedure you&apos;ve done a dozen times — please consider submitting it to the{' '}
                <Link href="/technical" className="font-medium underline hover:text-blue-900">Technical Library</Link>. The more members contribute, the faster this becomes the resource the 5 Series community has always needed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Category list — generation landing, no category selected yet */}
      {showCategoryList ? (
        <div className="divide-y divide-gray-100">
          {GEN_SUBFORUM_CATS.map(c => (
            <Link
              key={c.id}
              href={`/forums/subforum?gen=${gen}&cat=${c.id}`}
              className="flex items-center gap-3 py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group"
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center text-base flex-shrink-0"
                style={{ background: genColors?.bg }}
              >
                <span>{c.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400">{c.desc}</div>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      ) : loading ? (
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
            <Link href={`/forums/new?gen=${gen ?? ''}&cat=${cat ?? ''}&engine=${engine ?? ''}&transmission=${transmission ?? ''}&region=${region ?? ''}`}
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

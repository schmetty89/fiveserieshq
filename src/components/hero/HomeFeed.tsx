import Link from 'next/link'
import { MessageCircle, Youtube, Car, Clock, ChevronRight } from 'lucide-react'
import { GenBadge } from '@/components/ui/GenBadge'
import { Generation } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

// Static placeholder data — will be replaced with Supabase queries
const RECENT_THREADS = [
  { id: '1', title: 'M54 oil consumption — valve stem seals or rings?', gen: 'E39' as Generation, author: 'jkoenig', replies: 34, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '2', title: 'BimmerCode G30 hidden features — full list 2025', gen: 'G30' as Generation, author: 'CodeMonkey', replies: 203, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: '3', title: 'E60 M5 V10 build — 3 years in one thread', gen: 'E60' as Generation, author: 'V10Life', replies: 89, created_at: new Date(Date.now() - 21600000).toISOString() },
  { id: '4', title: 'F10 535i coilover recommendations', gen: 'F10' as Generation, author: 'f10builds', replies: 41, created_at: new Date(Date.now() - 28800000).toISOString() },
  { id: '5', title: 'E34 530i touring restoration — respray complete', gen: 'E34' as Generation, author: 'p.walsh', replies: 122, created_at: new Date(Date.now() - 43200000).toISOString() },
]

const RECENT_VIDEOS = [
  { id: '1', title: 'E39 full cooling overhaul', gen: 'E39' as Generation, duration: '32:14', category: 'DIY' },
  { id: '2', title: 'G30 540i stage 2 build diary', gen: 'G30' as Generation, duration: '19:44', category: 'Build' },
  { id: '3', title: 'E60 M5 track day — Barber', gen: 'E60' as Generation, duration: '12:08', category: 'Track' },
  { id: '4', title: 'F10 M5 vs E60 M5 drag race', gen: 'F10' as Generation, duration: '15:22', category: 'Track' },
]

const STATS = [
  { value: '12.4k', label: 'members' },
  { value: '84.2k', label: 'posts' },
  { value: '2,100', label: 'builds' },
  { value: '340',   label: 'online' },
]

const UPCOMING_EVENTS = [
  { name: '5 Series meet — DFW', date: 'Aug 3', location: 'Dallas, TX' },
  { name: 'BMW Fest Southeast',  date: 'Jul 19', location: 'Atlanta, GA' },
  { name: 'Road Atlanta track day', date: 'Sep 6', location: 'Braselton, GA' },
]

const POPULAR_TAGS = ['M54', 'B58 tune', 'coilovers', 'VANOS', 'coding', 'S62 swap', 'BimmerCode', 'rod bearings', 'E39 cooling', 'Dinan', 'touring', 'suspension']

export function HomeFeed() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

        {/* ── Main feed ── */}
        <div className="space-y-8">

          {/* Latest threads */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle size={14} />Latest forum threads
              </h2>
              <Link href="/forums" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                All threads <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {RECENT_THREADS.map(t => (
                <Link key={t.id} href={`/forums/thread/${t.id}`} className="flex items-start gap-3 py-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-1.5">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2.5 text-xs text-gray-400">
                      <GenBadge gen={t.gen} size="sm" />
                      <span>{t.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />{formatRelativeTime(t.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs text-gray-400">
                    <div className="font-medium text-gray-700">{t.replies}</div>
                    <div>replies</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent videos */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Youtube size={14} />Recent videos
              </h2>
              <Link href="/videos" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                Video library <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RECENT_VIDEOS.map(v => (
                <Link key={v.id} href={`/videos?id=${v.id}`} className="group">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative mb-2 overflow-hidden group-hover:bg-gray-200 transition-colors">
                    <Youtube size={22} className="text-gray-400" />
                    <span className="absolute bottom-1.5 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {v.duration}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-800 leading-snug group-hover:text-blue-600 transition-colors mb-1">
                    {v.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <GenBadge gen={v.gen} size="sm" />
                    <span>{v.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured builds placeholder */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Car size={14} />Featured builds
              </h2>
              <Link href="/builds" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                All builds <ChevronRight size={12} />
              </Link>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-12 px-6 text-center">
              <Car size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500 mb-1">Build showcase — coming soon</p>
              <p className="text-xs text-gray-400 max-w-xs">
                The build showcase is under construction. Upload your build book to be among the first featured builds.
              </p>
              <Link href="/builds" className="mt-4 text-xs font-medium px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                Learn more
              </Link>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-6">

          {/* Community stats */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Community</h3>
            <div className="grid grid-cols-2 gap-2">
              {STATS.map(s => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-semibold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming events</h3>
              <Link href="/events" className="text-xs text-gray-400 hover:text-gray-700">All →</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {UPCOMING_EVENTS.map(e => (
                <div key={e.name} className="py-2.5">
                  <p className="text-sm font-medium text-gray-800 mb-0.5">{e.name}</p>
                  <p className="text-xs text-gray-400">{e.date} · {e.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Popular topics */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map(tag => (
                <Link
                  key={tag}
                  href={`/forums?q=${tag}`}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Vendors CTA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trusted vendors</h3>
              <Link href="/vendors" className="text-xs text-gray-400 hover:text-gray-700">All →</Link>
            </div>
            <Link
              href="/vendors"
              className="block rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-800 mb-1">Find a trusted shop or parts supplier</p>
              <p className="text-xs text-gray-400">Every vendor is manually approved. Rated by the community.</p>
            </Link>
          </div>

        </aside>
      </div>
    </div>
  )
}

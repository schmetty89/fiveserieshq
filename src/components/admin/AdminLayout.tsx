'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getMyRole } from '@/lib/admin-data'
import { getAdminCounts } from '@/lib/admin-data'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Building2, Youtube,
  BookOpen, MessageSquare, Users, ArrowLeft, Loader2, Hammer
} from 'lucide-react'

interface Counts {
  vendors: number
  videos: number
  techDocs: number
  forums: number
  builds: number
}

const NAV = [
  { href: '/admin',           label: 'Overview',    icon: LayoutDashboard, exact: true  },
  { href: '/admin/vendors',   label: 'Vendors',     icon: Building2,       exact: false },
  { href: '/admin/videos',    label: 'Videos',      icon: Youtube,         exact: false },
  { href: '/admin/technical', label: 'Technical',   icon: BookOpen,        exact: false },
  { href: '/admin/forums',    label: 'Forums',      icon: MessageSquare,   exact: false },
  { href: '/admin/builds',    label: 'Builds',      icon: Hammer,          exact: false },
  { href: '/admin/members',   label: 'Members',     icon: Users,           exact: false },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Counts>({ vendors: 0, videos: 0, techDocs: 0, forums: 0, builds: 0 })

  useEffect(() => {
    getMyRole().then(r => {
      setRole(r)
      setLoading(false)
      if (r !== 'admin' && r !== 'moderator') router.replace('/')
    })
    getAdminCounts().then(setCounts)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (role !== 'admin' && role !== 'moderator') return null

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#0f0f0f] flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[#0055b3] flex items-center justify-center">
              <span className="text-white font-black text-[10px]" style={{ fontStyle: 'italic' }}>M</span>
            </div>
            <span className="text-white text-sm font-medium">Admin</span>
          </div>
          <p className="text-white/30 text-xs">FiveSeriesHQ</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const badge = label === 'Vendors' ? counts.vendors
              : label === 'Videos' ? counts.videos
              : label === 'Technical' ? counts.techDocs
              : label === 'Builds' ? counts.builds
              : 0

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} />
                  {label}
                </div>
                {badge > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-sm transition-colors">
            <ArrowLeft size={14} /> Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  )
}

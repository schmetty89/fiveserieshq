'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',          label: 'Home',          exact: true  },
  { href: '/forums',    label: 'Forums',        exact: false },
  { href: '/builds',    label: 'Builds',        exact: false },
  { href: '/videos',    label: 'Videos',        exact: false },
  { href: '/vendors',   label: 'Vendors',       exact: false },
  { href: '/events',    label: 'Events',        exact: false },
  { href: '/technical', label: 'Technical info', exact: false },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-[#0f0f0f] sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4"
           style={{ height: '52px' }}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-full border-2 border-white/70 grid grid-cols-2 overflow-hidden">
            <span className="flex items-center justify-center bg-white text-[#0055b3] text-[7px] font-black">B</span>
            <span className="flex items-center justify-center bg-[#0055b3] text-white text-[7px] font-black">M</span>
            <span className="flex items-center justify-center bg-[#0055b3] text-white text-[7px] font-black">W</span>
            <span className="flex items-center justify-center bg-white text-[#0055b3] text-[7px] font-black"></span>
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-white tracking-wide">5 Series</div>
            <div className="text-[9px] text-white/40 tracking-[2px] uppercase">Community</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap',
                isActive(href, exact)
                  ? 'text-white bg-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/7'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            className="text-white/50 hover:text-white transition-colors hidden sm:block"
          >
            <Search size={18} />
          </button>
          <button
            aria-label="Notifications"
            className="text-white/50 hover:text-white transition-colors hidden sm:block"
          >
            <Bell size={18} />
          </button>
          <Link
            href="/members/me"
            aria-label="Profile"
            className="text-white/50 hover:text-white transition-colors hidden sm:block"
          >
            <User size={18} />
          </Link>
          <Link
            href="/join"
            className="hidden sm:block text-xs font-medium px-3.5 py-1.5 rounded-md bg-white text-[#0f0f0f] hover:bg-white/90 transition-colors flex-shrink-0"
          >
            Join
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'text-sm px-3 py-2 rounded-md transition-colors',
                isActive(href, exact)
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white'
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 mt-1 flex gap-2">
            <Link href="/join" className="flex-1 text-center text-sm font-medium py-2 rounded-md bg-white text-[#0f0f0f]">
              Join
            </Link>
            <Link href="/login" className="flex-1 text-center text-sm py-2 rounded-md border border-white/20 text-white/70">
              Sign in
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}

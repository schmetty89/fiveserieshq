'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, User, Menu, X, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/AuthProvider'

const NAV_LINKS = [
  { href: '/',          label: 'Home',           exact: true  },
  { href: '/forums',    label: 'Forums',         exact: false },
  { href: '/builds',    label: 'Builds',         exact: false },
  { href: '/videos',    label: 'Videos',         exact: false },
  { href: '/vendors',   label: 'Vendors',        exact: false },
  { href: '/events',    label: 'Events',         exact: false },
  { href: '/technical', label: 'Technical info', exact: false },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-[#0f0f0f] sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4" style={{ height: '52px' }}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
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

        {/* Desktop nav */}
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button aria-label="Search" className="text-white/50 hover:text-white transition-colors hidden sm:block">
            <Search size={18} />
          </button>

          {user ? (
            <>
              <button aria-label="Notifications" className="text-white/50 hover:text-white transition-colors hidden sm:block relative">
                <Bell size={18} />
              </button>

              {/* User dropdown */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  aria-label="Account menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] text-xs font-semibold">
                    {profile?.username?.substring(0, 2).toUpperCase() ?? <User size={14} />}
                  </div>
                  <ChevronDown size={13} className={cn('transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{profile?.username ?? 'Member'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/members/me"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={14} /> My profile
                    </Link>
                    <Link
                      href="/members/me/garage"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm">🚗</span> My garage
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:block text-xs text-white/60 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/join"
                className="hidden sm:block text-xs font-medium px-3.5 py-1.5 rounded-md bg-white text-[#0f0f0f] hover:bg-white/90 transition-colors flex-shrink-0"
              >
                Join
              </Link>
            </>
          )}

          {/* Mobile toggle */}
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
                isActive(href, exact) ? 'text-white bg-white/10' : 'text-white/60 hover:text-white'
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 mt-1 flex gap-2">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex-1 text-center text-sm py-2 rounded-md border border-white/20 text-white/70"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link href="/auth/join" className="flex-1 text-center text-sm font-medium py-2 rounded-md bg-white text-[#0f0f0f]">
                  Join
                </Link>
                <Link href="/auth/login" className="flex-1 text-center text-sm py-2 rounded-md border border-white/20 text-white/70">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

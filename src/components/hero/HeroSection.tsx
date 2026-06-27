'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Generation, GENERATIONS, GENERATION_YEARS, GENERATION_TAGLINE } from '@/types'
import { GEN_COLORS } from '@/lib/utils'

// Per-generation models offered
const GENERATION_MODELS: Record<Generation, string[]> = {
  E34: ['520i', '525i', '530i', '535i', '540i', 'M5'],
  E39: ['520i', '523i', '525i', '528i', '530i', '535i', '540i', 'M5'],
  E60: ['520i', '523i', '525i', '528i', '530i', '535i', '545i', '550i', 'M5'],
  F10: ['520i', '523i', '525i', '528i', '530i', '535i', '550i', 'M5', 'M5 Competition'],
  G30: ['520i', '523i', '530i', '540i', '545e', '550i', 'M550i', 'M5', 'M5 Competition', 'M5 CS'],
}

// Nürburgring background
const BG_IMAGE = 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/HOMEPAGE-BACKGROUND.png'

// Mobile portrait backgrounds
const BG_IMAGE_MOBILE = 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/HOMEPAGE-BACKGROUND-MOBILE.png'
const PLATE_WALL_IMAGE = 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/HERO%20CAR%20WALLPAPER%20MOBILE.png'

// Per-generation live backgrounds — crossfade in on hover
const GEN_BG_IMAGES: Record<Generation, string> = {
  E34: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E34%20LIVE%20BACKGROUND.png',
  E39: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E39%20LIVE%20BACKGROUND.png',
  E60: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E60%20LIVE%20BACKGROUND.png',
  F10: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/F10%20LIVE%20BACKGROUND.png',
  G30: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/F90%20LIVE%20BACKGROUND.png',
}

// License-plate hotspots overlaid on the live background, positioned in %
// so they scale with the image regardless of viewport size
const DEFAULT_PLATE_HOTSPOTS = [
  { label: 'Forums',  href: '/forums',    left: 7,  top: 53,   width: 13,  height: 8 },
  { label: 'Builds',  href: '/builds',    left: 37, top: 53,   width: 13,  height: 8 },
  { label: 'Tech',    href: '/technical', left: 68, top: 51,   width: 13,  height: 8 },
]

// Mobile plate wall hotspots — same for all gens, centered on pillar
const MOBILE_PLATE_HOTSPOTS = [
  { label: 'Forums', href: '/forums',    top: 27, height: 10 },
  { label: 'Builds', href: '/builds',    top: 47, height: 10 },
  { label: 'Tech',   href: '/technical', top: 66, height: 10 },
]

// Per-generation overrides where the live background's plate placement differs
const GENERATION_PLATE_HOTSPOTS: Record<Generation, typeof DEFAULT_PLATE_HOTSPOTS> = {
  E34: [
    { label: 'Forums',  href: '/forums',    left: 8.5, top: 57.59, width: 4.875, height: 5.36 },
    { label: 'Builds',  href: '/builds',    left: 35, top: 60.5, width: 6.5, height: 6 },
    { label: 'Tech',    href: '/technical', left: 72, top: 62.5, width: 9.1,  height: 8 },
  ],
  E39: DEFAULT_PLATE_HOTSPOTS,
  E60: DEFAULT_PLATE_HOTSPOTS,
  F10: DEFAULT_PLATE_HOTSPOTS,
  G30: DEFAULT_PLATE_HOTSPOTS,
}

export function HeroSection() {
  const [hovered, setHovered] = useState<Generation | null>(null)
  const [selected, setSelected] = useState<Generation | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const lastHoveredGenRef = useRef<Generation | null>(null)
  const heroRef = useRef<HTMLElement>(null)

  const active = hovered ?? selected

  function handleGenHover(gen: Generation | null) {
    if (gen) lastHoveredGenRef.current = gen
    setHovered(gen)
  }

  function handleGenClick(gen: Generation) {
    setSelected(gen)
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      if (heroRef.current && !heroRef.current.contains(e.target as Node)) {
        setSelected(null)
        setHovered(null)
      }
    }
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative bg-[#0a0a0a] overflow-hidden"
    >
      {/* Nürburgring background */}
      <div className="absolute inset-0">
        <Image
          src={isMobile ? BG_IMAGE_MOBILE : BG_IMAGE}
          alt="BMW 5 Series generations"
          fill
          className="object-cover object-center opacity-75"
          priority
        />

        {/* Generation-specific live backgrounds — crossfade in on hover */}
        {isMobile ? (
          <Image
            src={PLATE_WALL_IMAGE}
            alt="FiveSeriesHQ navigation plates"
            fill
            className="object-cover object-center transition-opacity duration-500 ease-in-out"
            style={{ opacity: active ? 1 : 0 }}
          />
        ) : (
          <>
            {GENERATIONS.map(gen => (
              <Image
                key={gen}
                src={GEN_BG_IMAGES[gen]}
                alt={`BMW ${gen} live background`}
                fill
                className="object-cover object-center transition-opacity duration-500 ease-in-out"
                style={{ opacity: active === gen ? 1 : 0 }}
              />
            ))}
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-[#0a0a0a]/10 to-[#0a0a0a]/60" />
      </div>

      {/* License-plate hotspots — only mounted while a gen is active */}
      {active && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {isMobile ? (
            MOBILE_PLATE_HOTSPOTS.map(spot => {
              const glowColor = GEN_COLORS[active].text
              return (
                <Link
                  key={spot.label}
                  href={spot.label === 'Forums' ? `/forums?gen=${active}` : spot.href}
                  aria-label={spot.label}
                  className="absolute pointer-events-auto rounded-md border-2 border-transparent transition-all duration-300"
                  style={{
                    left: '8%',
                    width: '84%',
                    top: `${spot.top}%`,
                    height: `${spot.height}%`,
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = glowColor
                    ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px 6px ${glowColor}55`
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                />
              )
            })
          ) : (
            GENERATION_PLATE_HOTSPOTS[active].map(spot => (
              <Link
                key={spot.label}
                href={spot.label === 'Forums' ? `/forums?gen=${active}` : spot.href}
                aria-label={spot.label}
                onMouseEnter={() => setHovered(lastHoveredGenRef.current)}
                onMouseLeave={() => setHovered(null)}
                className="absolute pointer-events-auto rounded-md border-2 border-transparent transition-all duration-300 hover:border-amber-200/90 hover:shadow-[0_0_20px_6px_rgba(255,215,140,0.55)] hover:backdrop-brightness-125"
                style={{
                  left: `${spot.left}%`,
                  top: `${spot.top}%`,
                  width: `${spot.width}%`,
                  height: `${spot.height}%`,
                }}
              />
            ))
          )}
        </div>
      )}

      <div className="relative z-10 flex flex-col" style={{ minHeight: 'min(680px, 100svh)' }}>

        {/* Active gen overlay */}
        <div className="flex-1 flex flex-col items-center justify-center pt-14 pb-4 px-6 text-center">
          {active && (
            <div className="absolute top-4 sm:top-14 left-0 right-0 text-center pointer-events-none px-4">
              <div className="text-5xl font-black text-white/10 tracking-[8px] uppercase leading-none">
                {active}
              </div>
              <div className="text-xl font-bold text-white tracking-[4px] uppercase -mt-2">
                {GENERATION_TAGLINE[active]}
              </div>
              <div className="text-sm text-white/50 mt-2 tracking-wider">
                {GENERATION_YEARS[active]}
              </div>
              {/* Model list */}
              <div className="hidden sm:flex items-center justify-center gap-2 mt-3 flex-wrap">
                {GENERATION_MODELS[active].map(model => (
                  <span
                    key={model}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hero copy — bottom, above the selector strip */}
        <div
          className="hidden sm:block transition-all duration-300 text-center px-4 sm:px-6 pb-4 sm:pb-6 mb-8 sm:mb-0"
          style={{ opacity: active ? 0 : 1, pointerEvents: active ? 'none' : 'auto' }}
        >
          <h1
            className="text-2xl sm:text-[2.344rem] lg:text-[2.813rem] font-bold text-white leading-tight mb-3"
            style={{ fontVariantCaps: 'small-caps' }}
          >
            Five Generations. One Community.
          </h1>
          <p
            className="text-base sm:text-xl lg:text-[1.969rem] text-white/50"
            style={{ fontVariantCaps: 'small-caps' }}
          >
            The BMW 5 Series has had five generations, countless variants, and millions of passionate owners. It&apos;s never had a hub. Until now.
          </p>
        </div>

        {/* Generation selector strip */}
        <div
          className="grid grid-cols-5"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          {GENERATIONS.map(gen => {
            const isActive = active === gen
            const color = GEN_COLORS[gen].text
            return (
              <button
                key={gen}
                onMouseEnter={() => handleGenHover(gen)}
                onMouseLeave={() => handleGenHover(null)}
                onClick={() => handleGenClick(gen)}
                aria-label={`Explore BMW ${gen} — ${GENERATION_YEARS[gen]}`}
                className="py-3 sm:py-5 text-xs sm:text-sm lg:text-base font-black tracking-[2px] sm:tracking-[3px] uppercase transition-all duration-300 cursor-pointer"
                style={{
                  color: isActive ? color : 'rgba(255,255,255,0.5)',
                  textShadow: isActive ? `0 0 8px ${color}, 0 0 18px ${color}` : 'none',
                }}
              >
                {gen}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

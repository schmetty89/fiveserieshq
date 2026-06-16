'use client'

import { useState, useRef } from 'react'
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

// Per-generation M5 photos — hosted in Supabase storage
const CAR_IMAGES: Record<Generation, string> = {
  E34: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E34%20M5.png',
  E39: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E39%20M5.png',
  E60: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E60%20M5.png',
  F10: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/F10%20M5.png',
  G30: 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/G30%20M5.png',
}

// Nürburgring background
const BG_IMAGE = 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/HOMEPAGE%20BACKGROUND.png?v=2'

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
const PLATE_HOTSPOTS = [
  { label: 'Forums',  href: '/forums',    left: 7,  top: 53, width: 13, height: 8 },
  { label: 'Builds',  href: '/builds',    left: 37, top: 53, width: 13, height: 8 },
  { label: 'Tech',    href: '/technical', left: 68, top: 51, width: 13, height: 8 },
]

export function HeroSection() {
  const [hovered, setHovered] = useState<Generation | null>(null)
  const [selected, setSelected] = useState<Generation | null>(null)
  const lastHoveredGenRef = useRef<Generation | null>(null)

  const active = hovered ?? selected

  function handleCarHover(gen: Generation | null) {
    if (gen) lastHoveredGenRef.current = gen
    setHovered(gen)
  }

  function handleCarClick(gen: Generation) {
    setSelected(s => s === gen ? null : gen)
  }

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Nürburgring background */}
      <div className="absolute inset-0">
        <Image
          src={BG_IMAGE}
          alt="BMW M5 racing at the Nürburgring"
          fill
          className="object-cover object-center opacity-75"
          priority
        />

        {/* Generation-specific live backgrounds — crossfade in on hover */}
        {GENERATIONS.map(gen => (
          <Image
            key={gen}
            src={GEN_BG_IMAGES[gen]}
            alt={`BMW ${gen} live background`}
            fill
            className="object-cover object-center transition-opacity duration-500 ease-in-out"
            style={{ opacity: hovered === gen ? 1 : 0 }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-[#0a0a0a]/10 to-[#0a0a0a]/60" />
      </div>

      {/* License-plate hotspots — invisible until individually hovered */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {PLATE_HOTSPOTS.map(spot => (
          <Link
            key={spot.label}
            href={spot.href}
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
        ))}
      </div>

      <div className="relative z-10 flex flex-col" style={{ minHeight: '680px' }}>

        {/* Hero copy */}
        <div className="flex-1 flex flex-col items-center justify-center pt-14 pb-4 px-6 text-center">
          <div className="transition-all duration-300" style={{ opacity: active ? 0 : 1, pointerEvents: active ? 'none' : 'auto' }}>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-[3px] leading-tight mb-3">
              Every generation.<br />One legend.
            </h1>
            <p className="text-sm text-white/50 tracking-wide">
              Hover a generation to explore · Click to enter
            </p>
          </div>

          {/* Active gen overlay */}
          {active && (
            <div className="absolute top-14 left-0 right-0 text-center pointer-events-none px-4">
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
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
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

        {/* Cars lineup */}
        <div className="flex items-end justify-center gap-1 px-4 pb-0" style={{ height: '338px' }}>
          {GENERATIONS.map(gen => {
            const isDimmed = active !== null && active !== gen
            return (
              <button
                key={gen}
                onMouseEnter={() => handleCarHover(gen)}
                onMouseLeave={() => handleCarHover(null)}
                onClick={() => handleCarClick(gen)}
                aria-label={`Explore BMW ${gen} — ${GENERATION_YEARS[gen]}`}
                className="flex-1 max-w-[195px] flex flex-col items-center justify-end cursor-pointer group relative"
                style={{
                  transform: active === gen
                    ? 'translateY(-14px) scale(1.03)'
                    : isDimmed
                    ? 'translateY(0) scale(0.95)'
                    : 'translateY(0) scale(1)',
                  transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
                }}
              >
                {/* Car image */}
                <div
                  className="w-full relative overflow-hidden"
                  style={{
                    filter: isDimmed
                      ? 'brightness(0.18) saturate(0) contrast(0.8)'
                      : active === gen
                      ? 'brightness(1.08) saturate(1.15) contrast(1.05) drop-shadow(0 8px 24px rgba(0,0,0,0.6))'
                      : 'brightness(0.5) saturate(0.4)',
                    transition: 'filter 0.35s ease',
                  }}
                >
                  <Image
                    src={CAR_IMAGES[gen]}
                    alt={`BMW ${gen} M5`}
                    width={390}
                    height={234}
                    className="w-full h-auto object-cover object-bottom"
                    priority={gen === 'E39'}
                  />
                </div>

                {/* Ground glow */}
                <div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-2 rounded-full"
                  style={{
                    background: GEN_COLORS[gen].text,
                    filter: 'blur(6px)',
                    opacity: active === gen ? 0.65 : 0,
                    transition: 'opacity 0.35s ease',
                  }}
                />

                {/* Gen label */}
                <div
                  className="pb-2 pt-1.5 text-[11px] font-bold tracking-[2px] uppercase transition-colors duration-300"
                  style={{
                    color: active === gen
                      ? GEN_COLORS[gen].text
                      : isDimmed
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {gen}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Generation, GENERATIONS, GENERATION_YEARS, GENERATION_TAGLINE } from '@/types'
import { GEN_COLORS } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

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
const BG_IMAGE = 'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/HOMEPAGE%20BACKGROUND.png'

export function HeroSection() {
  const [hovered, setHovered] = useState<Generation | null>(null)
  const [selected, setSelected] = useState<Generation | null>(null)

  const active = hovered ?? selected

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
          className="object-cover object-center opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/20 to-[#0a0a0a]/85" />
      </div>

      <div className="relative z-10 flex flex-col" style={{ minHeight: '620px' }}>

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
                onMouseEnter={() => setHovered(gen)}
                onMouseLeave={() => setHovered(null)}
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

        {/* Selected gen panel */}
        {selected && (
          <div className="relative z-10 bg-[#0f0f0f]/95 backdrop-blur-sm border-t border-white/10 px-6 py-5">
            <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: GEN_COLORS[selected].bg, color: GEN_COLORS[selected].text }}
                  >
                    {selected}
                  </span>
                  <span className="text-white font-semibold text-sm">
                    {GENERATION_TAGLINE[selected]}
                  </span>
                </div>
                <p className="text-white/40 text-xs">{GENERATION_YEARS[selected]}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Forum',       href: `/forums?gen=${selected}` },
                  { label: 'Builds',      href: `/builds?gen=${selected}` },
                  { label: 'Tech guides', href: `/technical?gen=${selected}` },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <span className="text-xs font-medium text-white/80 group-hover:text-white">{label}</span>
                    <ChevronRight size={12} className="text-white/40 group-hover:text-white/70" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

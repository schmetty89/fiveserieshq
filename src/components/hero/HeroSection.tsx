'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Generation, GENERATIONS, GENERATION_YEARS, GENERATION_ENGINE, GENERATION_TAGLINE } from '@/types'
import { GEN_COLORS } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

// Placeholder car image URLs — replace with real BMW press photos
const CAR_IMAGES: Record<Generation, string> = {
  E34: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80',
  E39: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80',
  E60: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
  F10: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=80',
  G30: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80',
}

export function HeroSection() {
  const [hovered, setHovered] = useState<Generation | null>(null)
  const [selected, setSelected] = useState<Generation | null>(null)

  const active = hovered ?? selected

  function handleCarClick(gen: Generation) {
    setSelected(s => s === gen ? null : gen)
  }

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Background racetrack photo */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&q=80"
          alt="Racetrack background"
          fill
          className="object-cover object-center opacity-35"
          priority
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/80" />
      </div>

      <div className="relative z-10 flex flex-col" style={{ minHeight: '520px' }}>

        {/* Hero copy */}
        <div className="flex-1 flex flex-col items-center justify-center pt-14 pb-4 px-6 text-center">
          <div
            className="transition-all duration-300"
            style={{ opacity: active ? 0 : 1 }}
          >
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-[3px] leading-tight mb-3">
              Every generation.<br />One legend.
            </h1>
            <p className="text-sm text-white/50 tracking-wide">
              Hover a generation to explore · Click to enter
            </p>
          </div>

          {/* Active gen info overlay */}
          {active && (
            <div className="absolute top-14 left-0 right-0 text-center pointer-events-none">
              <div className="text-5xl font-black text-white/10 tracking-[8px] uppercase">{active}</div>
              <div className="text-xl font-bold text-white tracking-[4px] uppercase -mt-2">
                {GENERATION_TAGLINE[active]}
              </div>
              <div className="text-sm text-white/50 mt-1 tracking-wider">
                {GENERATION_YEARS[active]} · {GENERATION_ENGINE[active]}
              </div>
            </div>
          )}
        </div>

        {/* Cars lineup */}
        <div className="flex items-end justify-center gap-1 px-4 pb-0" style={{ height: '240px' }}>
          {GENERATIONS.map(gen => {
            const isDimmed = active !== null && active !== gen
            return (
              <button
                key={gen}
                onMouseEnter={() => setHovered(gen)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleCarClick(gen)}
                aria-label={`Explore BMW ${gen} — ${GENERATION_YEARS[gen]}`}
                className="flex-1 max-w-[140px] flex flex-col items-center justify-end cursor-pointer group relative"
                style={{
                  transform: active === gen ? 'translateY(-12px)' : isDimmed ? 'translateY(0) scale(0.96)' : 'translateY(0)',
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* Car image */}
                <div
                  className="w-full relative"
                  style={{
                    filter: isDimmed
                      ? 'brightness(0.2) saturate(0)'
                      : active === gen
                      ? 'brightness(1.05) saturate(1.1) contrast(1.05)'
                      : 'brightness(0.45) saturate(0.3)',
                    transition: 'filter 0.3s ease',
                  }}
                >
                  <Image
                    src={CAR_IMAGES[gen]}
                    alt={`BMW ${gen}`}
                    width={200}
                    height={130}
                    className="w-full h-auto object-cover object-bottom"
                  />
                </div>

                {/* Ground glow */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1.5 rounded-full"
                  style={{
                    background: GEN_COLORS[gen].text,
                    filter: 'blur(4px)',
                    opacity: active === gen ? 0.7 : 0,
                    transition: 'opacity 0.3s ease',
                  }}
                />

                {/* Gen label */}
                <div
                  className="pb-2 pt-1.5 text-[11px] font-bold tracking-[2px] uppercase transition-colors duration-300"
                  style={{ color: active === gen ? GEN_COLORS[gen].text : isDimmed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)' }}
                >
                  {gen}
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected gen panel */}
        {selected && (
          <div className="relative z-10 bg-[#111] border-t border-white/10 px-6 py-5">
            <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: GEN_COLORS[selected].bg, color: GEN_COLORS[selected].text }}
                  >
                    {selected}
                  </span>
                  <span className="text-white font-semibold text-sm">
                    {GENERATION_TAGLINE[selected]}
                  </span>
                </div>
                <p className="text-white/40 text-xs">
                  {GENERATION_YEARS[selected]} · {GENERATION_ENGINE[selected]}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Forum', href: `/forums?gen=${selected}` },
                  { label: 'Builds', href: `/builds?gen=${selected}` },
                  { label: 'Tech guides', href: `/technical?gen=${selected}` },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 transition-colors group"
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

'use client'

import { useState, useCallback } from 'react'
import {
  Search, ChevronRight, Info, AlertTriangle, CheckCircle2,
  Wrench, Gauge, ExternalLink, Loader2, ChevronDown, X, RotateCcw,
} from 'lucide-react'
import {
  FITMENT_DB, GENERATIONS_LIST, getFitmentByGen,
  type Generation, type GenerationFitment,
} from '@/lib/fitment-data'
import { GEN_COLORS } from '@/lib/forum-config'
import { GenBadge } from '@/components/ui/GenBadge'

// ── Types ────────────────────────────────────────────────

interface ConfirmedFit {
  wheelSpec: string
  tireSize: string
  suspension?: string
  clearance?: string
  stance?: string
  source?: string
  notes?: string
}

interface MarginalFit {
  wheelSpec: string
  tireSize: string
  issue: string
  fix?: string
  source?: string
}

interface PopularCombo {
  label: string
  front: string
  rear?: string
  tire: string
  why: string
}

interface SearchResult {
  confirmedFits: ConfirmedFit[]
  marginalFits: MarginalFit[]
  popularCombos: PopularCombo[]
  brandsMentioned: string[]
  communityTips: string[]
  searchSummary: string
}

// ── Helpers ───────────────────────────────────────────────

const GEN_TAGLINES: Record<Generation, string> = {
  E34: 'The analog icon — 1988–1996',
  E39: 'The golden era — 1995–2003',
  E60: 'The controversial legend — 2003–2010',
  F10: 'The modern classic — 2010–2017',
  G30: 'The modern powerhouse — 2017–present',
}

// ── Main Component ────────────────────────────────────────

export function FitmentTool() {
  const [activeGen, setActiveGen] = useState<Generation>('E39')
  const [wheelWidth, setWheelWidth]   = useState('')
  const [diameter, setDiameter]       = useState('')
  const [offset, setOffset]           = useState('')
  const [tireSize, setTireSize]       = useState('')
  const [result, setResult]           = useState<SearchResult | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [showOem, setShowOem]         = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const fitment: GenerationFitment = getFitmentByGen(activeGen)
  const colors = GEN_COLORS[activeGen]

  const handleGenChange = (gen: Generation) => {
    setActiveGen(gen)
    setResult(null)
    setHasSearched(false)
    setError(null)
  }

  const handleSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setHasSearched(true)

    try {
      const res = await fetch('/api/fitment-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation: activeGen, wheelWidth, diameter, offset, tireSize }),
      })
      if (!res.ok) throw new Error('Search request failed')
      const data: SearchResult = await res.json()
      setResult(data)
    } catch {
      setError('Could not reach the search service. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [activeGen, wheelWidth, diameter, offset, tireSize])

  const handleReset = () => {
    setWheelWidth('')
    setDiameter('')
    setOffset('')
    setTireSize('')
    setResult(null)
    setHasSearched(false)
    setError(null)
  }

  const handlePopularSize = (size: string) => {
    // Parse "18x8.5 ET20 / 225/40R18" → fields
    const match = size.match(/(\d+)×(\d+\.?\d*)\s+(ET\d+)\s*\/\s*(\S+)/)
    if (match) {
      setDiameter(match[1])
      setWheelWidth(match[2] + 'J')
      setOffset(match[3])
      setTireSize(match[4])
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

      {/* ── Left: Gen selector ────────────────────────────── */}
      <aside className="space-y-1">
        <div className="mb-5">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Rim fitment</h1>
          <p className="text-sm text-gray-500">
            Spec database + community verified combos
          </p>
        </div>

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
          Generation
        </p>

        {GENERATIONS_LIST.map(gen => {
          const c = GEN_COLORS[gen]
          const isActive = gen === activeGen
          return (
            <button
              key={gen}
              onClick={() => handleGenChange(gen)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.text }} />
              <span className={`flex-1 ${isActive ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                BMW {gen}
              </span>
              {isActive && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: c.bg, color: c.text }}>
                  {FITMENT_DB[gen].years.split('–')[0]}s
                </span>
              )}
            </button>
          )
        })}

        {/* Quick note card */}
        <div className="mt-6 p-3 rounded-xl border border-amber-100 bg-amber-50">
          <p className="text-[11px] font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
            <AlertTriangle size={11} /> Always verify before ordering
          </p>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Community data is a guide. Test-fit before mounting tires, and check clearance at full lock on lowered cars.
          </p>
        </div>
      </aside>

      {/* ── Right: Main content ───────────────────────────── */}
      <div className="min-w-0">

        {/* Generation header */}
        <div
          className="rounded-2xl p-5 mb-6 border"
          style={{ background: colors.bg, borderColor: colors.border }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <GenBadge gen={activeGen} />
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {GEN_TAGLINES[activeGen]}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                <SpecCell label="Bolt pattern" value={fitment.wheelSpec.boltPattern} color={colors.text} />
                <SpecCell label="Hub bore"     value={fitment.wheelSpec.hubBore}     color={colors.text} />
                <SpecCell label="Stud size"    value={fitment.wheelSpec.studSize}    color={colors.text} />
                <SpecCell label="Max front"    value={fitment.maxWidthFront}         color={colors.text} />
              </div>
              {fitment.wheelSpec.centerBoreNote && (
                <p className="text-[11px] mt-3 flex items-start gap-1.5" style={{ color: colors.text }}>
                  <Info size={11} className="flex-shrink-0 mt-0.5" />
                  {fitment.wheelSpec.centerBoreNote}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowOem(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all flex-shrink-0"
              style={{ borderColor: colors.border, color: colors.text, background: 'rgba(255,255,255,0.5)' }}
            >
              OEM fitments <ChevronDown size={12} className={`transition-transform ${showOem ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showOem && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fitment.oemFitments.map((oem, i) => (
                  <div key={i} className="bg-white/60 rounded-xl p-3 text-xs">
                    <p className="font-semibold text-gray-700 mb-1">{oem.label}</p>
                    <p className="text-gray-600">
                      {oem.width} × {oem.diameter}&quot; &nbsp;·&nbsp; {oem.offset} &nbsp;·&nbsp; {oem.tireSize}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Offset ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <OffsetCard label="Front offset range" data={fitment.frontOffsetRange} />
          <OffsetCard label="Rear offset range"  data={fitment.rearOffsetRange} />
        </div>

        {/* Popular sizes quick-fill */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Community popular sizes — click to pre-fill
          </p>
          <div className="flex flex-wrap gap-2">
            {fitment.popularSizes.map((size, i) => (
              <button
                key={i}
                onClick={() => handlePopularSize(size)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all font-mono"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        {fitment.notes.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
              {activeGen} fitment notes
            </p>
            <ul className="space-y-1.5">
              {fitment.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-gray-300 mt-0.5 flex-shrink-0">·</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── AI Search form ────────────────────────────── */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gray-900 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Search size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-white">Community fitment search</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 font-medium">
                AI + web search
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Searches BMW forums and fitment communities for verified {activeGen} combos.
            </p>
          </div>

          <div className="p-5 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Width
                </label>
                <input
                  type="text"
                  value={wheelWidth}
                  onChange={e => setWheelWidth(e.target.value)}
                  placeholder="e.g. 8.5J"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Diameter
                </label>
                <input
                  type="text"
                  value={diameter}
                  onChange={e => setDiameter(e.target.value)}
                  placeholder='e.g. 19"'
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Offset (ET)
                </label>
                <input
                  type="text"
                  value={offset}
                  onChange={e => setOffset(e.target.value)}
                  placeholder="e.g. ET30"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Tire size
                </label>
                <input
                  type="text"
                  value={tireSize}
                  onChange={e => setTireSize(e.target.value)}
                  placeholder="e.g. 245/35R19"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading
                  ? <><Loader2 size={13} className="animate-spin" /> Searching…</>
                  : <><Search size={13} /> Search community</>
                }
              </button>
              {(wheelWidth || diameter || offset || tireSize) && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              )}
              <p className="text-[11px] text-gray-400 ml-auto hidden sm:block">
                Leave fields blank to find the most popular setups
              </p>
            </div>
          </div>
        </div>

        {/* ── Search results ────────────────────────────── */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
            <X size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 text-center text-sm text-gray-400">
            <Loader2 size={24} className="animate-spin mx-auto mb-3 text-gray-300" />
            Searching BMW forums and fitment communities for {activeGen} data…
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 space-y-6">
            {/* Summary */}
            {result.searchSummary && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800 flex items-start gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-500" />
                {result.searchSummary}
              </div>
            )}

            {/* Popular combos */}
            {result.popularCombos?.length > 0 && (
              <div>
                <SectionHeading icon={<Gauge size={13} />} label="Community recommended setups" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.popularCombos.map((combo, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                          {combo.label}
                        </span>
                      </div>
                      <div className="space-y-1 mb-2">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">Front: </span>
                          <span className="font-mono">{combo.front}</span>
                        </p>
                        {combo.rear && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium text-gray-700">Rear: </span>
                            <span className="font-mono">{combo.rear}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">Tire: </span>
                          <span className="font-mono">{combo.tire}</span>
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400">{combo.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed fits */}
            {result.confirmedFits?.length > 0 && (
              <div>
                <SectionHeading
                  icon={<CheckCircle2 size={13} className="text-green-600" />}
                  label="Confirmed fits"
                  badge={`${result.confirmedFits.length} reported`}
                  badgeColor="green"
                />
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {result.confirmedFits.map((fit, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-mono text-sm font-semibold text-gray-900">{fit.wheelSpec}</span>
                            {fit.tireSize && (
                              <span className="font-mono text-sm text-gray-500">/ {fit.tireSize}</span>
                            )}
                            {fit.stance && (
                              <StanceBadge stance={fit.stance} />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {fit.suspension && (
                              <span className="flex items-center gap-1">
                                <Wrench size={10} /> {fit.suspension}
                              </span>
                            )}
                            {fit.clearance && (
                              <span className="flex items-center gap-1">
                                <ChevronRight size={10} /> {fit.clearance}
                              </span>
                            )}
                          </div>
                          {fit.notes && (
                            <p className="text-[11px] text-gray-400 mt-1.5">{fit.notes}</p>
                          )}
                        </div>
                        {fit.source && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <ExternalLink size={10} /> {fit.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marginal fits */}
            {result.marginalFits?.length > 0 && (
              <div>
                <SectionHeading
                  icon={<AlertTriangle size={13} className="text-amber-500" />}
                  label="Marginal fits — may need modifications"
                  badgeColor="amber"
                />
                <div className="divide-y divide-gray-100 border border-amber-100 rounded-xl overflow-hidden">
                  {result.marginalFits.map((fit, i) => (
                    <div key={i} className="p-4 bg-amber-50/40 hover:bg-amber-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono text-sm font-semibold text-gray-800">{fit.wheelSpec}</span>
                            {fit.tireSize && (
                              <span className="font-mono text-sm text-gray-500">/ {fit.tireSize}</span>
                            )}
                          </div>
                          <p className="text-xs text-amber-700 mb-1">⚠ {fit.issue}</p>
                          {fit.fix && (
                            <p className="text-xs text-gray-500">Fix: {fit.fix}</p>
                          )}
                        </div>
                        {fit.source && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <ExternalLink size={10} /> {fit.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community tips */}
            {result.communityTips?.length > 0 && (
              <div>
                <SectionHeading icon={<Info size={13} />} label="Community tips" />
                <ul className="space-y-2">
                  {result.communityTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="text-gray-300 flex-shrink-0 mt-0.5">·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Brands mentioned */}
            {result.brandsMentioned?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Brands mentioned:</span>
                {result.brandsMentioned.map((brand, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {brand}
                  </span>
                ))}
              </div>
            )}

            {/* No results state */}
            {result.confirmedFits?.length === 0 && result.marginalFits?.length === 0 && result.popularCombos?.length === 0 && (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                <Search size={24} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500 mb-1">No specific community data found</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Try adjusting the wheel size or leaving fields blank to find the most popular setups.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial empty state when not searched yet */}
        {!hasSearched && !loading && (
          <div className="mt-6 text-center py-10 border border-dashed border-gray-200 rounded-xl">
            <Search size={24} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500 mb-1">Search community fitment data</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Enter a wheel spec above, or leave blank and hit Search to see the most popular {activeGen} setups from BMW forums.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────

function SpecCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 opacity-60" style={{ color }}>
        {label}
      </p>
      <p className="text-sm font-semibold font-mono" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function OffsetCard({
  label,
  data,
}: {
  label: string
  data: { minStreet: string; maxFlush: string; sweetSpot: string; notes?: string }
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-1">Min street</p>
          <p className="text-sm font-semibold font-mono text-gray-700">{data.minStreet}</p>
        </div>
        <div className="text-center border-x border-gray-100">
          <p className="text-[10px] text-blue-500 font-semibold mb-1">Sweet spot</p>
          <p className="text-sm font-bold font-mono text-blue-600">{data.sweetSpot}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-1">Max flush</p>
          <p className="text-sm font-semibold font-mono text-gray-700">{data.maxFlush}</p>
        </div>
      </div>
      {data.notes && (
        <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-2">{data.notes}</p>
      )}
    </div>
  )
}

function StanceBadge({ stance }: { stance: string }) {
  const lower = stance.toLowerCase()
  const style =
    lower.includes('flush')   ? 'bg-green-50 text-green-700'  :
    lower.includes('poke')    ? 'bg-amber-50 text-amber-700'  :
    lower.includes('tuck')    ? 'bg-blue-50 text-blue-700'    :
                                'bg-gray-100 text-gray-500'
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style}`}>
      {stance}
    </span>
  )
}

function SectionHeading({
  icon, label, badge, badgeColor,
}: {
  icon: React.ReactNode
  label: string
  badge?: string
  badgeColor?: 'green' | 'amber'
}) {
  const badgeClass =
    badgeColor === 'green' ? 'bg-green-50 text-green-700' :
    badgeColor === 'amber' ? 'bg-amber-50 text-amber-700' :
    'bg-gray-100 text-gray-500'

  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
          {badge}
        </span>
      )}
    </div>
  )
}

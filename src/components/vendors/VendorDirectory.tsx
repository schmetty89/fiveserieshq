'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Star, ExternalLink, MessageCircle, MapPin, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { getVendors, getVendorReviews } from '@/lib/vendor-data'
import { GEN_COLORS } from '@/lib/forum-config'
import { Generation, GENERATIONS } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/components/auth/AuthProvider'
import { VendorApplyModal } from './VendorApplyModal'
import { VendorReviewModal } from './VendorReviewModal'

interface Vendor {
  id: string
  name: string
  type: string
  description: string
  location: string
  website_url?: string
  instagram?: string
  generations: string[]
  years_in_business?: number
  average_rating: number
  review_count: number
}

interface Review {
  id: string
  rating: number
  body: string
  created_at: string
  profiles: { username: string } | { username: string }[]
}

const VENDOR_TYPE_LABELS: Record<string, string> = {
  parts: 'Parts supplier',
  tuner: 'Tuner',
  shop: 'Independent shop',
  fabricator: 'Fabricator',
  other: 'Other',
}

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'parts', label: 'Parts' },
  { value: 'tuner', label: 'Tuner' },
  { value: 'shop', label: 'Shop' },
  { value: 'fabricator', label: 'Fabricator' },
]

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
        />
      ))}
    </div>
  )
}

function VendorCard({ vendor, onReviewAdded }: { vendor: Vendor; onReviewAdded: () => void }) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  async function loadReviews() {
    if (reviews.length > 0) return
    setLoadingReviews(true)
    const data = await getVendorReviews(vendor.id)
    setReviews(data as Review[])
    setLoadingReviews(false)
  }

  function handleExpand() {
    setExpanded(e => !e)
    if (!expanded) loadReviews()
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo placeholder */}
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
            {vendor.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-gray-900">{vendor.name}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
                <CheckCircle size={9} /> Approved
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {VENDOR_TYPE_LABELS[vendor.type] ?? vendor.type}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-2 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin size={11} />{vendor.location}
              </span>
              {vendor.years_in_business && (
                <span>Est. {new Date().getFullYear() - vendor.years_in_business}</span>
              )}
              {vendor.website_url && (
                <a href={vendor.website_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline">
                  <ExternalLink size={11} /> Website
                </a>
              )}
              {vendor.instagram && (
                <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">
                  {vendor.instagram}
                </a>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{vendor.description}</p>

            {/* Generation tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {vendor.generations.map(gen => {
                const colors = GEN_COLORS[gen as Generation]
                return (
                  <span key={gen} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: colors?.bg, color: colors?.text }}>
                    {gen}
                  </span>
                )
              })}
            </div>

            {/* Rating + actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <StarRating rating={vendor.average_rating} />
                <span className="text-sm font-medium text-gray-900">{vendor.average_rating > 0 ? vendor.average_rating.toFixed(1) : '—'}</span>
                <span className="text-xs text-gray-400">
                  {vendor.review_count > 0 ? `${vendor.review_count} review${vendor.review_count !== 1 ? 's' : ''}` : 'No reviews yet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Star size={11} /> Write review
                  </button>
                )}
                {vendor.review_count > 0 && (
                  <button
                    onClick={handleExpand}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle size={11} />
                    {expanded ? 'Hide' : 'Show'} reviews
                    {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews panel */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          {loadingReviews ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => {
                const author = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
                return (
                  <div key={review.id} className="bg-white rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{author?.username ?? 'Member'}</span>
                        <StarRating rating={review.rating} size={12} />
                      </div>
                      <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showReviewModal && (
        <VendorReviewModal
          vendorId={vendor.id}
          vendorName={vendor.name}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={() => {
            setShowReviewModal(false)
            setReviews([])
            setExpanded(true)
            loadReviews()
            onReviewAdded()
          }}
        />
      )}
    </div>
  )
}

export function VendorDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [genFilter, setGenFilter] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)

  const loadVendors = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getVendors({ type: typeFilter || undefined, generation: genFilter || undefined, search: search || undefined })
      setVendors(data as Vendor[])
    } catch {
      setVendors([])
    } finally {
      setLoading(false)
    }
  }, [typeFilter, genFilter, search])

  useEffect(() => {
    const t = setTimeout(loadVendors, 300)
    return () => clearTimeout(t)
  }, [loadVendors])

  const typeGroups = ['parts', 'tuner', 'shop', 'fabricator', 'other']
  const grouped = typeGroups.reduce((acc, type) => {
    const filtered = vendors.filter(v => v.type === type)
    if (filtered.length > 0) acc[type] = filtered
    return acc
  }, {} as Record<string, Vendor[]>)

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Trusted vendor directory</h1>
          <p className="text-sm text-gray-500">Every vendor is manually reviewed and approved before appearing here.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          Apply to be listed
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                typeFilter === f.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setGenFilter('')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !genFilter ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            All gens
          </button>
          {GENERATIONS.map(gen => (
            <button key={gen} onClick={() => setGenFilter(gen === genFilter ? '' : gen)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                genFilter === gen ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {gen}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm font-medium text-gray-500 mb-1">No vendors found</p>
          <p className="text-xs text-gray-400 mb-4">Try adjusting your filters or be the first to apply.</p>
          <button onClick={() => setShowApplyModal(true)}
            className="text-sm font-medium text-blue-600 hover:underline">
            Apply to be listed
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, list]) => (
            <div key={type}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                {VENDOR_TYPE_LABELS[type] ?? type}s
              </h2>
              <div className="space-y-3">
                {list.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} onReviewAdded={loadVendors} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply CTA strip */}
      <div className="mt-10 border border-gray-100 rounded-xl p-6 bg-gray-50 flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">Are you a vendor?</p>
          <p className="text-xs text-gray-500">Submit an application to be listed in the directory. Approved vendors appear here with community ratings and reviews.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          Apply to be listed
        </button>
      </div>

      {showApplyModal && <VendorApplyModal onClose={() => setShowApplyModal(false)} />}
    </div>
  )
}

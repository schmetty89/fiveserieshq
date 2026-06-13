'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Upload, CheckCircle, Eye, Download, ChevronRight, ArrowLeft, FileText, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { GENERATIONS, Generation } from '@/types'
import { GEN_COLORS } from '@/lib/forum-config'
import { MAINTENANCE_SYSTEMS, PERFORMANCE_SYSTEMS, TechSection } from '@/lib/technical-config'
import { getTechDocuments, getTechArticles, getTechArticle } from '@/lib/technical-data'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/components/auth/AuthProvider'
import { TechSubmitModal } from './TechSubmitModal'

interface TechDoc {
  id: string
  name: string
  generation: string
  category: string
  file_url: string
  file_size_mb?: number
  year_range: string
  verified: boolean
  created_at: string
}

interface TechArticle {
  id: string
  title: string
  generation: string
  section: string
  system: string
  content_type: string
  verified: boolean
  view_count: number
  created_at: string
  profiles: { username: string } | { username: string }[]
}

interface ArticleDetail extends TechArticle {
  body?: string
  file_url?: string
}

function TechnicalInfoInner() {
  const { user, isTier2 } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeGen = (searchParams.get('gen') as Generation) || 'E39'
  const activeSection = (searchParams.get('section') as TechSection) || 'documents'
  const [activeSystem, setActiveSystem] = useState<string | null>(null)
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null)

  function setActiveGen(gen: Generation) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('gen', gen)
    params.set('section', activeSection)
    router.push(`/technical?${params.toString()}`, { scroll: false })
  }

  function setActiveSection(section: TechSection) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('gen', activeGen)
    params.set('section', section)
    router.push(`/technical?${params.toString()}`, { scroll: false })
  }

  const [docs, setDocs] = useState<TechDoc[]>([])
  const [articles, setArticles] = useState<TechArticle[]>([])
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const genColors = GEN_COLORS[activeGen]

  const loadDocs = useCallback(async () => {
    setLoading(true)
    const data = await getTechDocuments(activeGen)
    setDocs(data as TechDoc[])
    setLoading(false)
  }, [activeGen])

  const loadArticles = useCallback(async () => {
    if (activeSection === 'documents') return
    setLoading(true)
    const data = await getTechArticles({
      generation: activeGen,
      section: activeSection as 'maintenance' | 'performance',
      system: activeSystem || undefined,
    })
    setArticles(data as TechArticle[])
    setLoading(false)
  }, [activeGen, activeSection, activeSystem])

  const loadArticle = useCallback(async () => {
    if (!activeArticleId) return
    setLoading(true)
    const data = await getTechArticle(activeArticleId)
    setArticle(data as ArticleDetail)
    setLoading(false)
  }, [activeArticleId])

  useEffect(() => {
    setActiveSystem(null)
    setActiveArticleId(null)
    setArticle(null)
    if (activeSection === 'documents') loadDocs()
    else loadArticles()
  }, [activeGen, activeSection, loadDocs, loadArticles])

  useEffect(() => {
    if (activeSystem !== null) loadArticles()
  }, [activeSystem, loadArticles])

  useEffect(() => {
    if (activeArticleId) loadArticle()
  }, [activeArticleId, loadArticle])

  const systems = activeSection === 'performance' ? PERFORMANCE_SYSTEMS : MAINTENANCE_SYSTEMS
  const docCategories = Array.from(new Set(docs.map(d => d.category)))

  // ── Article detail view ──
  if (activeArticleId && article) {
    const author = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <GenSidebar activeGen={activeGen} setActiveGen={g => { setActiveGen(g); setActiveArticleId(null) }}
          activeSection={activeSection} setActiveSection={s => { setActiveSection(s); setActiveArticleId(null) }}
          onSubmit={() => setShowSubmitModal(true)} user={!!user} />
        <div>
          <button onClick={() => setActiveArticleId(null)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: genColors.bg, color: genColors.text }}>{activeGen}</span>
            {article.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                <CheckCircle size={10} /> Verified
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{article.content_type}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">{article.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-6 pb-5 border-b border-gray-100">
            <span>by {author?.username ?? 'Unknown'}</span>
            <span>{formatRelativeTime(article.created_at)}</span>
            <span className="flex items-center gap-1"><Eye size={11} />{article.view_count.toLocaleString()} views</span>
          </div>
          {article.body ? (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {article.body}
            </div>
          ) : article.file_url ? (
            <div className="border border-gray-200 rounded-xl p-8 text-center">
              <FileText size={28} className="text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-4">This article is a PDF document.</p>
              <a href={article.file_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
                <Download size={14} /> Download PDF
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Content not available.</p>
          )}
        </div>
        {showSubmitModal && <TechSubmitModal defaultGen={activeGen} defaultSection={activeSection} onClose={() => setShowSubmitModal(false)} />}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
      <GenSidebar activeGen={activeGen} setActiveGen={g => { setActiveGen(g); setActiveSystem(null) }}
        activeSection={activeSection} setActiveSection={s => { setActiveSection(s); setActiveSystem(null) }}
        onSubmit={() => setShowSubmitModal(true)} user={!!user} />

      <div>
        {/* Header */}
        <div className="flex items-end justify-between mb-6 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: genColors.bg, color: genColors.text }}>
                {activeGen}
              </span>
              <span className="text-xl font-medium text-gray-900 capitalize">
                {activeSection === 'documents' ? 'Technical documents' : activeSection}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {activeSection === 'documents'
                ? 'Factory service manuals, wiring diagrams, and OEM technical references.'
                : activeSection === 'maintenance'
                ? 'Verified guides and procedures for keeping your ' + activeGen + ' in top condition.'
                : 'Upgrade guides and performance build documentation for the ' + activeGen + '.'}
            </p>
          </div>
          {user && (
            <button onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0">
              <Upload size={13} /> Submit
            </button>
          )}
        </div>

        {/* ── Fitment tool callout (documents section only) ── */}
        {activeSection === 'documents' && (
          <Link
            href={`/technical/fitment?gen=${activeGen}`}
            className="flex items-center justify-between gap-4 p-4 mb-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: genColors.bg }}>
                🔩
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Rim fitment guide</p>
                <p className="text-xs text-gray-400">Bolt patterns, offset ranges, OEM specs, and community-verified wheel combos for the {activeGen}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
          </Link>
        )}

        {/* ── Documents section ── */}
        {activeSection === 'documents' && (
          loading ? <LoadingSkeleton /> : docs.length === 0 ? (
            <EmptyState label="No documents yet" sub="Be the first to submit a factory manual or wiring diagram." onSubmit={user && isTier2 ? () => setShowSubmitModal(true) : undefined} />
          ) : (
            <div className="space-y-6">
              {docCategories.map(cat => (
                <div key={cat}>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">{cat}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {docs.filter(d => d.category === cat).map(doc => (
                      <div key={doc.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: genColors.bg }}>
                            <FileText size={16} style={{ color: genColors.text }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 mb-1 leading-snug">{doc.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 flex-wrap">
                              <span>{doc.year_range}</span>
                              {doc.file_size_mb && <span>{doc.file_size_mb} MB</span>}
                              {doc.verified
                                ? <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-1.5 py-0.5 rounded"><CheckCircle size={9} /> Verified</span>
                                : <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>}
                            </div>
                            <div className="flex gap-2">
                              {doc.file_url && doc.file_url !== '#pending' ? (
                                <>
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                                    <Download size={11} /> Download
                                  </a>
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                    <Eye size={11} /> Preview
                                  </a>
                                </>
                              ) : (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-100">
                                  File upload pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Maintenance / Performance sections ── */}
        {(activeSection === 'maintenance' || activeSection === 'performance') && !activeSystem && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {systems.map(sys => {
              const sysArticles = articles.filter(a => a.system === sys.id)
              return (
                <button key={sys.id} onClick={() => setActiveSystem(sys.id)}
                  className="border border-gray-100 rounded-xl p-4 text-left hover:border-gray-200 hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl mb-3" style={{ background: genColors.bg }}>
                    {sys.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 mb-1">{sys.name}</p>
                  <p className="text-xs text-gray-400 mb-2 leading-snug">{sys.desc}</p>
                  <p className="text-xs text-gray-400">{sysArticles.length > 0 ? `${sysArticles.length} article${sysArticles.length !== 1 ? 's' : ''}` : 'No articles yet'}</p>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Article list for a system ── */}
        {(activeSection === 'maintenance' || activeSection === 'performance') && activeSystem && (
          <div>
            <button onClick={() => setActiveSystem(null)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
              <ArrowLeft size={14} /> All systems
            </button>

            {/* System sub-tabs */}
            <div className="flex gap-2 flex-wrap mb-5">
              {systems.map(s => (
                <button key={s.id} onClick={() => setActiveSystem(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    s.id === activeSystem ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  {s.icon} {s.name}
                </button>
              ))}
            </div>

            {loading ? <LoadingSkeleton /> : articles.length === 0 ? (
              <EmptyState
                label="No articles yet for this system"
                sub="Be the first to contribute a guide or document."
                onSubmit={user && isTier2 ? () => setShowSubmitModal(true) : undefined}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {articles.map(a => {
                  const author = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
                  const isPdf = a.content_type === 'pdf'
                  return (
                    <button key={a.id} onClick={() => setActiveArticleId(a.id)}
                      className="w-full flex items-start gap-3 py-4 text-left hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: isPdf ? '#E6F1FB' : '#E1F5EE' }}>
                        {isPdf ? <FileText size={14} style={{ color: '#185FA5' }} /> : <BookOpen size={14} style={{ color: '#0F6E56' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors mb-1 leading-snug">
                          {a.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isPdf ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                            {isPdf ? 'PDF' : 'Guide'}
                          </span>
                          {a.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                              <CheckCircle size={9} /> Verified
                            </span>
                          )}
                          <span>by {author?.username ?? 'Unknown'}</span>
                          <span>{formatRelativeTime(a.created_at)}</span>
                          <span className="flex items-center gap-1"><Eye size={10} />{a.view_count.toLocaleString()}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-1" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showSubmitModal && (
        <TechSubmitModal
          defaultGen={activeGen}
          defaultSection={activeSection}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  )
}

export function TechnicalInfo() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-xl" />}>
      <TechnicalInfoInner />
    </Suspense>
  )
}

function GenSidebar({ activeGen, setActiveGen, activeSection, setActiveSection, onSubmit, user }: {
  activeGen: Generation
  setActiveGen: (g: Generation) => void
  activeSection: TechSection
  setActiveSection: (s: TechSection) => void
  onSubmit: () => void
  user: boolean
}) {
  return (
    <aside className="space-y-1">
      <div className="mb-4">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Technical info</h1>
        <p className="text-sm text-gray-500">The source for answers — not a forum.</p>
      </div>

      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">Generation</p>
      {GENERATIONS.map(gen => {
        const c = GEN_COLORS[gen]
        return (
          <button key={gen} onClick={() => setActiveGen(gen)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeGen === gen ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.text }} />
            <span className={`flex-1 text-left ${activeGen === gen ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              BMW {gen}
            </span>
            {activeGen === gen && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
        )
      })}

      <div className="pt-4 pb-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">Section</p>
      </div>

      {([
        { id: 'documents',   label: 'Technical documents', icon: '📄' },
        { id: 'maintenance', label: 'Maintenance',          icon: '🔧' },
        { id: 'performance', label: 'Performance',          icon: '🚀' },
      ] as const).map(s => (
        <button key={s.id} onClick={() => setActiveSection(s.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeSection === s.id
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}>
          <span>{s.icon}</span>
          <span>{s.label}</span>
        </button>
      ))}

      <div className="pt-2">
        <Link
          href={`/technical/fitment`}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span>🔩</span>
          <span>Rim fitment</span>
        </Link>
      </div>

      {user && (
        <div className="pt-2">
          <button onClick={onSubmit}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors border border-dashed border-gray-200">
            <Upload size={13} /> Submit content
          </button>
        </div>
      )}
    </aside>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  )
}

function EmptyState({ label, sub, onSubmit }: { label: string; sub: string; onSubmit?: () => void }) {
  return (
    <div className="text-center py-14 border border-dashed border-gray-200 rounded-xl">
      <FileText size={24} className="text-gray-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">{sub}</p>
      {onSubmit && (
        <button onClick={onSubmit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
          <Upload size={13} /> Submit content
        </button>
      )}
    </div>
  )
}

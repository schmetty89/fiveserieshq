'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ReviewCard } from '@/components/admin/ReviewCard'
import {
  getPendingTechDocs, getPendingTechArticles,
  approveTechDoc, rejectTechDoc,
  approveTechArticle, rejectTechArticle,
} from '@/lib/admin-data'
import { Loader2, CheckCircle } from 'lucide-react'

interface TechDoc {
  id: string
  name: string
  generation: string
  category: string
  year_range: string
  profiles: { username: string } | { username: string }[]
}

interface TechArticle {
  id: string
  title: string
  generation: string
  section: string
  system: string
  content_type: string
  body?: string
  profiles: { username: string } | { username: string }[]
}

export default function AdminTechnicalPage() {
  const [docs, setDocs] = useState<TechDoc[]>([])
  const [articles, setArticles] = useState<TechArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'docs' | 'articles'>('docs')

  useEffect(() => {
    Promise.all([getPendingTechDocs(), getPendingTechArticles()]).then(([d, a]) => {
      setDocs(d as TechDoc[])
      setArticles(a as TechArticle[])
      setLoading(false)
    })
  }, [])

  const totalPending = docs.length + articles.length

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Technical content</h1>
        <p className="text-sm text-gray-500 mb-6">Review and verify submitted technical documents and guides.</p>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          {([
            { id: 'docs' as const,     label: `Documents (${docs.length})` },
            { id: 'articles' as const, label: `Guides (${articles.length})` },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : totalPending === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">All caught up</p>
            <p className="text-xs text-gray-400 mt-1">No pending technical submissions.</p>
          </div>
        ) : activeTab === 'docs' ? (
          docs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No pending documents.</p>
          ) : (
            <div className="space-y-3">
              {docs.map(doc => {
                const submitter = Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles
                return (
                  <ReviewCard
                    key={doc.id}
                    title={doc.name}
                    meta={`${doc.generation} · ${doc.category} · ${doc.year_range} · submitted by ${submitter?.username ?? 'Unknown'}`}
                    onApprove={() => approveTechDoc(doc.id)}
                    onReject={(reason) => rejectTechDoc(doc.id, reason)}
                  />
                )
              })}
            </div>
          )
        ) : (
          articles.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No pending guides.</p>
          ) : (
            <div className="space-y-3">
              {articles.map(article => {
                const author = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles
                return (
                  <ReviewCard
                    key={article.id}
                    title={article.title}
                    meta={`${article.generation} · ${article.section} · ${article.system} · ${article.content_type} · by ${author?.username ?? 'Unknown'}`}
                    detail={article.body ? article.body.substring(0, 200) + (article.body.length > 200 ? '...' : '') : undefined}
                    onApprove={() => approveTechArticle(article.id)}
                    onReject={(reason) => rejectTechArticle(article.id, reason)}
                  />
                )
              })}
            </div>
          )
        )}
      </div>
    </AdminLayout>
  )
}

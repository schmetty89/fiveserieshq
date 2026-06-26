'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PendingBuild {
  id: string
  build_name: string
  moderation_status: string
  build_status: string
  created_at: string
  admin_notes: string | null
  profiles: { username: string }
}

const MODERATION_LABELS: Record<string, string> = {
  draft:              'Draft',
  pending_initial:    'Pending initial review',
  in_progress_shared: 'In progress (shared)',
  proofreading:       'Proofreading',
  pending_final:      'Pending final approval',
  verified:           'Verified',
  rejected:           'Rejected',
}

const NEXT_STATUS: Record<string, string> = {
  pending_initial:    'in_progress_shared',
  in_progress_shared: 'proofreading',
  proofreading:       'pending_final',
  pending_final:      'verified',
}

export default function AdminBuildsPage() {
  const [builds, setBuilds] = useState<PendingBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  async function loadBuilds() {
    const supabase = createClient()
    const { data } = await supabase
      .from('builds')
      .select('id, build_name, moderation_status, build_status, created_at, admin_notes, profiles(username)')
      .not('moderation_status', 'in', '("draft","verified")')
      .order('created_at', { ascending: true })
    setBuilds((data as PendingBuild[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadBuilds() }, [])

  async function advanceStatus(build: PendingBuild) {
    const next = NEXT_STATUS[build.moderation_status]
    if (!next) return
    setActionLoading(build.id)
    const supabase = createClient()
    await supabase.from('builds').update({
      moderation_status: next,
      ...(next === 'verified' ? { verified_at: new Date().toISOString() } : {}),
    }).eq('id', build.id)
    await loadBuilds()
    setActionLoading(null)
  }

  async function rejectBuild(build: PendingBuild) {
    setActionLoading(build.id)
    const supabase = createClient()
    await supabase.from('builds').update({
      moderation_status: 'rejected',
      admin_notes: rejectionReason || null,
    }).eq('id', build.id)
    setRejectingId(null)
    setRejectionReason('')
    await loadBuilds()
    setActionLoading(null)
  }

  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Build moderation</h1>
          <p className="text-sm text-gray-500 mb-6">Review and advance builds through the moderation pipeline.</p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : builds.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
              <CheckCircle size={28} className="text-green-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No builds pending review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {builds.map(build => (
                <div key={build.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{build.build_name}</p>
                        <span className="text-xs text-gray-400">
                          by @{Array.isArray(build.profiles) ? build.profiles[0]?.username : build.profiles?.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          {MODERATION_LABELS[build.moderation_status] ?? build.moderation_status}
                        </span>
                        <span className="text-xs text-gray-400">
                          Submitted {new Date(build.created_at).toLocaleDateString()}
                        </span>
                        <Link href={`/builds/${build.id}`} target="_blank"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5">
                          View <ChevronRight size={10} />
                        </Link>
                      </div>
                      {rejectingId === build.id && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            placeholder="Rejection reason (optional)"
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => rejectBuild(build)}
                              disabled={actionLoading === build.id}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60">
                              Confirm rejection
                            </button>
                            <button onClick={() => { setRejectingId(null); setRejectionReason('') }}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {rejectingId !== build.id && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setRejectingId(build.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">
                          <XCircle size={13} /> Reject
                        </button>
                        {NEXT_STATUS[build.moderation_status] && (
                          <button
                            onClick={() => advanceStatus(build)}
                            disabled={actionLoading === build.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors disabled:opacity-60">
                            <CheckCircle size={13} />
                            {NEXT_STATUS[build.moderation_status] === 'verified' ? 'Verify' : 'Advance →'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}

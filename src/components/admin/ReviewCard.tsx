'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  title: string
  meta?: string
  detail?: string
  expandContent?: React.ReactNode
  onApprove: () => Promise<void>
  onReject: (reason: string) => Promise<void>
  approved?: boolean
  rejected?: boolean
  rejectionReason?: string
}

export function ReviewCard({
  title, meta, detail, expandContent,
  onApprove, onReject, approved, rejected, rejectionReason
}: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(
    approved ? 'approved' : rejected ? 'rejected' : null
  )

  async function handleApprove() {
    setLoading('approve')
    await onApprove()
    setDone('approved')
    setLoading(null)
  }

  async function handleReject() {
    if (!reason.trim()) return
    setLoading('reject')
    await onReject(reason.trim())
    setDone('rejected')
    setLoading(null)
    setShowReject(false)
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      done === 'approved' ? 'border-green-200 bg-green-50/30'
      : done === 'rejected' ? 'border-red-100 bg-red-50/30 opacity-60'
      : 'border-gray-100 bg-white'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-0.5 leading-snug">{title}</p>
            {meta && <p className="text-xs text-gray-500">{meta}</p>}
            {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
          </div>

          {done ? (
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              done === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {done === 'approved' ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {done === 'approved' ? 'Approved' : 'Rejected'}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              {expandContent && (
                <button onClick={() => setExpanded(e => !e)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 border border-gray-200 px-2 py-1.5 rounded-lg transition-colors">
                  Details {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              )}
              <button
                onClick={() => setShowReject(s => !s)}
                disabled={!!loading}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <XCircle size={12} /> Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={!!loading}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                Approve
              </button>
            </div>
          )}
        </div>

        {/* Expand content */}
        {expanded && expandContent && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {expandContent}
          </div>
        )}

        {/* Reject form */}
        {showReject && !done && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for rejection (optional but recommended)..."
              rows={2}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowReject(false)}
                className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!!loading}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {loading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : null}
                Confirm rejection
              </button>
            </div>
          </div>
        )}

        {done === 'rejected' && rejectionReason && (
          <p className="text-xs text-red-500 mt-2">Reason: {rejectionReason}</p>
        )}
      </div>
    </div>
  )
}

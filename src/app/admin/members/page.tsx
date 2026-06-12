'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getAllMembers, setMemberRole, getPendingTierRequests, approveTier2 } from '@/lib/admin-data'
import { Search, Shield, ShieldOff, Loader2, CheckCircle, XCircle, UserCheck } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Member {
  id: string
  username: string
  role: string
  tier: number
  location?: string
  post_count: number
  created_at: string
}

const ROLE_BADGE: Record<string, { label: string; style: string }> = {
  admin:     { label: 'Admin',     style: 'bg-red-50 text-red-600 border-red-100' },
  moderator: { label: 'Moderator', style: 'bg-blue-50 text-blue-600 border-blue-100' },
  member:    { label: 'Member',    style: 'bg-gray-50 text-gray-500 border-gray-200' },
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [pendingTier, setPendingTier] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTier, setLoadingTier] = useState(true)
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tier' | 'all'>('tier')

  const loadMembers = useCallback(async () => {
    setLoading(true)
    const data = await getAllMembers(search || undefined)
    setMembers(data as Member[])
    setLoading(false)
  }, [search])

  const loadPending = useCallback(async () => {
    setLoadingTier(true)
    const data = await getPendingTierRequests()
    setPendingTier(data as Member[])
    setLoadingTier(false)
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  useEffect(() => {
    const t = setTimeout(loadMembers, 300)
    return () => clearTimeout(t)
  }, [loadMembers])

  async function handleApproveTier(id: string) {
    setActionId(id)
    await approveTier2(id)
    setPendingTier(ts => ts.filter(t => t.id !== id))
    setMembers(ms => ms.map(m => m.id === id ? { ...m, tier: 2 } : m))
    setActionId(null)
  }

  async function handleDenyTier(id: string) {
    // Just remove from queue UI — member stays at tier 1
    setActionId(id)
    setPendingTier(ts => ts.filter(t => t.id !== id))
    setActionId(null)
  }

  async function handleRoleChange(id: string, currentRole: string) {
    if (currentRole === 'admin') return
    const newRole = currentRole === 'moderator' ? 'member' : 'moderator'
    setActionId(id)
    await setMemberRole(id, newRole as 'member' | 'moderator')
    setMembers(ms => ms.map(m => m.id === id ? { ...m, role: newRole } : m))
    setActionId(null)
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Member management</h1>
        <p className="text-sm text-gray-500 mb-6">
          Approve Tier 2 posting access and manage moderator roles.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          <button onClick={() => setActiveTab('tier')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
              activeTab === 'tier'
                ? 'border-gray-900 text-gray-900 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <UserCheck size={14} />
            Tier 2 approvals
            {pendingTier.length > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {pendingTier.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
              activeTab === 'all'
                ? 'border-gray-900 text-gray-900 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            All members
          </button>
        </div>

        {/* Tier 2 approvals tab */}
        {activeTab === 'tier' && (
          loadingTier ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          ) : pendingTier.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
              <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">All caught up</p>
              <p className="text-xs text-gray-400 mt-1">No members waiting for Tier 2 approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-4">
                These members signed up and are currently Tier 1 (view only). Approve to grant full posting access.
              </p>
              {pendingTier.map(member => {
                const busy = actionId === member.id
                return (
                  <div key={member.id}
                    className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0">
                      {member.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.username}</p>
                      <p className="text-xs text-gray-400">
                        Joined {formatRelativeTime(member.created_at)}
                        {member.location ? ` · ${member.location}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDenyTier(member.id)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                        Deny
                      </button>
                      <button
                        onClick={() => handleApproveTier(member.id)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve Tier 2
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* All members tab */}
        {activeTab === 'all' && (
          <>
            <div className="relative max-w-xs mb-6">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by username..."
                className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading...
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No members found.</p>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {members.map(member => {
                    const badge = ROLE_BADGE[member.role] ?? ROLE_BADGE.member
                    const busy = actionId === member.id
                    const isSelf = member.role === 'admin'

                    return (
                      <div key={member.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-semibold flex-shrink-0">
                          {member.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-gray-900">{member.username}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.style}`}>
                              {badge.label}
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              member.tier === 2
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              Tier {member.tier}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {member.post_count} posts
                            {member.location ? ` · ${member.location}` : ''}
                            {` · joined ${formatRelativeTime(member.created_at)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.tier === 1 && (
                            <button
                              onClick={() => handleApproveTier(member.id)}
                              disabled={!!busy}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              Approve Tier 2
                            </button>
                          )}
                          {!isSelf && (
                            <button
                              onClick={() => handleRoleChange(member.id, member.role)}
                              disabled={!!busy}
                              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                                member.role === 'moderator'
                                  ? 'border-blue-200 text-blue-600 hover:bg-blue-50'
                                  : 'border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200'
                              }`}
                            >
                              {busy ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : member.role === 'moderator' ? (
                                <><ShieldOff size={12} /> Revoke mod</>
                              ) : (
                                <><Shield size={12} /> Make mod</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

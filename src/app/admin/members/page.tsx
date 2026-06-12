'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getAllMembers, setMemberRole } from '@/lib/admin-data'
import { Search, Shield, ShieldOff, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Member {
  id: string
  username: string
  role: string
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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    const data = await getAllMembers(search || undefined)
    setMembers(data as Member[])
    setLoading(false)
  }, [search])

  useEffect(() => {
    const t = setTimeout(loadMembers, 300)
    return () => clearTimeout(t)
  }, [loadMembers])

  async function handleRoleChange(id: string, currentRole: string) {
    // Toggle between member and moderator (only admin can be set via SQL)
    const newRole = currentRole === 'moderator' ? 'member' : 'moderator'
    if (currentRole === 'admin') return // Can't demote admin from UI
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
          Grant or revoke moderator status. Moderators can pin, solve, and delete forum threads.
          Admin role can only be set directly in Supabase.
        </p>

        {/* Search */}
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
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-semibold flex-shrink-0">
                      {member.username.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-900">{member.username}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.style}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {member.post_count} posts
                        {member.location ? ` · ${member.location}` : ''}
                        {` · joined ${formatRelativeTime(member.created_at)}`}
                      </p>
                    </div>

                    {/* Role action */}
                    {!isSelf && (
                      <button
                        onClick={() => handleRoleChange(member.id, member.role)}
                        disabled={busy}
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
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

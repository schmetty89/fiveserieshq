import { AdminLayout } from '@/components/admin/AdminLayout'
import { Navbar } from '@/components/layout/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — FiveSeriesHQ' }

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Admin dashboard</h1>
          <p className="text-sm text-gray-500 mb-8">Manage content, members, and moderation.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Pending vendors',   href: '/admin/vendors',   color: 'bg-amber-50 border-amber-100 text-amber-700' },
              { label: 'Pending videos',    href: '/admin/videos',    color: 'bg-blue-50 border-blue-100 text-blue-700' },
              { label: 'Pending tech',      href: '/admin/technical', color: 'bg-purple-50 border-purple-100 text-purple-700' },
              { label: 'Forum threads',     href: '/admin/forums',    color: 'bg-green-50 border-green-100 text-green-700' },
            ].map(item => (
              <a key={item.href} href={item.href}
                className={`border rounded-xl p-5 hover:opacity-80 transition-opacity ${item.color}`}>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs opacity-60 mt-1">Click to manage →</p>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/admin/members"
              className="border border-gray-100 rounded-xl p-5 bg-white hover:border-gray-200 transition-colors">
              <p className="text-sm font-medium text-gray-900 mb-1">Member management</p>
              <p className="text-xs text-gray-500">Grant or revoke moderator status, manage member roles.</p>
            </a>
            <a href="/forums"
              className="border border-gray-100 rounded-xl p-5 bg-white hover:border-gray-200 transition-colors">
              <p className="text-sm font-medium text-gray-900 mb-1">Browse forums</p>
              <p className="text-xs text-gray-500">Go to the live forums to moderate threads in context.</p>
            </a>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ReviewCard } from '@/components/admin/ReviewCard'
import { getPendingVendors, approveVendor, rejectVendor } from '@/lib/admin-data'
import { Loader2, CheckCircle } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  type: string
  description: string
  location: string
  website_url?: string
  instagram?: string
  contact_email: string
  generations: string[]
  years_in_business?: number
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPendingVendors().then(data => {
      setVendors(data as Vendor[])
      setLoading(false)
    })
  }, [])

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Vendor applications</h1>
        <p className="text-sm text-gray-500 mb-6">Review and approve vendor applications before they appear in the directory.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">All caught up</p>
            <p className="text-xs text-gray-400 mt-1">No pending vendor applications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map(vendor => (
              <ReviewCard
                key={vendor.id}
                title={vendor.name}
                meta={`${vendor.type} · ${vendor.location} · ${vendor.contact_email}`}
                detail={vendor.description}
                expandContent={
                  <div className="space-y-1 text-xs text-gray-500">
                    <p><span className="font-medium text-gray-700">Generations:</span> {vendor.generations.join(', ')}</p>
                    {vendor.website_url && <p><span className="font-medium text-gray-700">Website:</span> {vendor.website_url}</p>}
                    {vendor.instagram && <p><span className="font-medium text-gray-700">Instagram:</span> {vendor.instagram}</p>}
                    {vendor.years_in_business && <p><span className="font-medium text-gray-700">Years in business:</span> {vendor.years_in_business}</p>}
                  </div>
                }
                onApprove={() => approveVendor(vendor.id)}
                onReject={(reason) => rejectVendor(vendor.id, reason)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

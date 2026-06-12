import { createClient } from '@/lib/supabase'

export async function getVendors({
  type,
  generation,
  search,
}: {
  type?: string
  generation?: string
  search?: string
} = {}) {
  const supabase = createClient()
  let query = supabase
    .from('vendors')
    .select('*')
    .eq('approved', true)
    .order('average_rating', { ascending: false })

  if (type) query = query.eq('type', type)
  if (generation) query = query.contains('generations', [generation])
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getVendorReviews(vendorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vendor_reviews')
    .select(`
      id, rating, body, created_at,
      profiles:author_id ( username )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function submitVendorApplication(app: {
  name: string
  type: string
  description: string
  location: string
  websiteUrl?: string
  instagram?: string
  generations: string[]
  yearsInBusiness?: number
  contactEmail: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('vendors')
    .insert({
      name: app.name,
      type: app.type,
      description: app.description,
      location: app.location,
      website_url: app.websiteUrl || null,
      instagram: app.instagram || null,
      generations: app.generations,
      years_in_business: app.yearsInBusiness || null,
      contact_email: app.contactEmail,
      approved: false,
    })

  if (error) throw error
}

export async function submitVendorReview(review: {
  vendorId: string
  authorId: string
  rating: number
  body: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('vendor_reviews')
    .insert({
      vendor_id: review.vendorId,
      author_id: review.authorId,
      rating: review.rating,
      body: review.body,
    })

  if (error) throw error

  // Recalculate average rating
  const { data: reviews } = await supabase
    .from('vendor_reviews')
    .select('rating')
    .eq('vendor_id', review.vendorId)

  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await supabase
      .from('vendors')
      .update({ average_rating: Math.round(avg * 10) / 10, review_count: reviews.length })
      .eq('id', review.vendorId)
  }
}

import { createClient } from '@/lib/supabase'

// ── Auth check ────────────────────────────────────────────
export async function getMyRole(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return data?.role ?? null
}

export async function requireAdmin(): Promise<boolean> {
  const role = await getMyRole()
  return role === 'admin'
}

export async function requireModerator(): Promise<boolean> {
  const role = await getMyRole()
  return role === 'admin' || role === 'moderator'
}

// ── Dashboard counts ──────────────────────────────────────
export async function getAdminCounts() {
  const supabase = createClient()
  const [vendors, videos, techDocs, techArticles, threads] = await Promise.all([
    supabase.from('vendors').select('id', { count: 'exact' }).eq('approved', false).eq('rejected', false),
    supabase.from('videos').select('id', { count: 'exact' }).eq('approved', false).eq('rejected', false),
    supabase.from('tech_documents').select('id', { count: 'exact' }).eq('verified', false).eq('rejected', false),
    supabase.from('tech_articles').select('id', { count: 'exact' }).eq('verified', false).eq('rejected', false),
    supabase.from('forum_threads').select('id', { count: 'exact' }),
  ])
  return {
    vendors: vendors.count ?? 0,
    videos: videos.count ?? 0,
    techDocs: (techDocs.count ?? 0) + (techArticles.count ?? 0),
    forums: threads.count ?? 0,
  }
}

// ── Vendors ───────────────────────────────────────────────
export async function getPendingVendors() {
  const supabase = createClient()
  const { data } = await supabase
    .from('vendors')
    .select('*')
    .eq('approved', false)
    .eq('rejected', false)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function approveVendor(id: string) {
  const supabase = createClient()
  await supabase.from('vendors').update({ approved: true }).eq('id', id)
}

export async function rejectVendor(id: string, reason: string) {
  const supabase = createClient()
  await supabase.from('vendors').update({ rejected: true, rejection_reason: reason }).eq('id', id)
}

// ── Videos ────────────────────────────────────────────────
export async function getPendingVideos() {
  const supabase = createClient()
  const { data } = await supabase
    .from('videos')
    .select(`*, profiles:submitted_by ( username )`)
    .eq('approved', false)
    .eq('rejected', false)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function approveVideo(id: string) {
  const supabase = createClient()
  await supabase.from('videos').update({ approved: true }).eq('id', id)
}

export async function rejectVideo(id: string, reason: string) {
  const supabase = createClient()
  await supabase.from('videos').update({ rejected: true, rejection_reason: reason }).eq('id', id)
}

// ── Technical content ─────────────────────────────────────
export async function getPendingTechDocs() {
  const supabase = createClient()
  const { data } = await supabase
    .from('tech_documents')
    .select(`*, profiles:submitted_by ( username )`)
    .eq('verified', false)
    .eq('rejected', false)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getPendingTechArticles() {
  const supabase = createClient()
  const { data } = await supabase
    .from('tech_articles')
    .select(`*, profiles:author_id ( username )`)
    .eq('verified', false)
    .eq('rejected', false)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function approveTechDoc(id: string) {
  const supabase = createClient()
  await supabase.from('tech_documents').update({ verified: true }).eq('id', id)
}

export async function rejectTechDoc(id: string, reason: string) {
  const supabase = createClient()
  await supabase.from('tech_documents').update({ rejected: true, rejection_reason: reason }).eq('id', id)
}

export async function approveTechArticle(id: string) {
  const supabase = createClient()
  await supabase.from('tech_articles').update({ verified: true }).eq('id', id)
}

export async function rejectTechArticle(id: string, reason: string) {
  const supabase = createClient()
  await supabase.from('tech_articles').update({ rejected: true, rejection_reason: reason }).eq('id', id)
}

// ── Forums ────────────────────────────────────────────────
export async function getRecentThreads(limit = 30) {
  const supabase = createClient()
  const { data } = await supabase
    .from('forum_threads')
    .select(`id, title, generation, category, is_pinned, is_solved, reply_count, created_at, profiles:author_id ( username )`)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function pinThread(id: string, pinned: boolean) {
  const supabase = createClient()
  await supabase.from('forum_threads').update({ is_pinned: pinned }).eq('id', id)
}

export async function solveThread(id: string, solved: boolean) {
  const supabase = createClient()
  await supabase.from('forum_threads').update({ is_solved: solved }).eq('id', id)
}

export async function deleteThread(id: string) {
  const supabase = createClient()
  await supabase.from('forum_threads').delete().eq('id', id)
}

// ── Members ───────────────────────────────────────────────
export async function getAllMembers(search?: string) {
  const supabase = createClient()
  let query = supabase
    .from('profiles')
    .select('id, username, role, location, post_count, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (search) query = query.ilike('username', `%${search}%`)

  const { data } = await query
  return data ?? []
}

export async function setMemberRole(id: string, role: 'member' | 'moderator' | 'admin') {
  const supabase = createClient()
  await supabase.from('profiles').update({ role }).eq('id', id)
}

// ── Member tiers ──────────────────────────────────────────
export async function getPendingTierRequests() {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, role, location, post_count, created_at, tier')
    .eq('tier', 1)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function approveTier2(id: string) {
  const supabase = createClient()
  await supabase.from('profiles').update({ tier: 2 }).eq('id', id)
}

export async function denyTier2(id: string) {
  // Stays at tier 1 — no action needed, but we log the decision
  // In future this could set a denied_tier2 flag
  console.log('Tier 2 denied for user:', id)
}

import { createClient } from '@/lib/supabase'

export async function getThreads({
  generation,
  category,
  engine,
  regionalSubforum,
  limit = 25,
  offset = 0,
}: {
  generation?: string
  category?: string
  engine?: string
  regionalSubforum?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('forum_threads')
    .select(`
      id, title, generation, category, engine, regional_subforum,
      is_pinned, is_solved, reply_count, view_count,
      last_reply_at, created_at,
      profiles:author_id ( username, avatar_url )
    `)
    .order('is_pinned', { ascending: false })
    .order('last_reply_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (generation) query = query.eq('generation', generation)
  if (category) query = query.eq('category', category)
  if (engine) query = query.eq('engine', engine)
  if (regionalSubforum) query = query.eq('regional_subforum', regionalSubforum)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getThread(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`
      id, title, body, generation, category, engine, regional_subforum,
      is_pinned, is_solved, reply_count, view_count,
      last_reply_at, created_at,
      profiles:author_id ( username, avatar_url )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getPosts(threadId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      id, body, image_urls, youtube_url, is_op, created_at,
      profiles:author_id ( username, avatar_url )
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createThread({
  title,
  body,
  generation,
  category,
  engine,
  regionalSubforum,
  authorId,
}: {
  title: string
  body: string
  generation?: string
  category: string
  engine?: string
  regionalSubforum?: string
  authorId: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_threads')
    .insert({
      title,
      body,
      generation: generation || null,
      category,
      engine: engine || null,
      regional_subforum: regionalSubforum || null,
      author_id: authorId,
    })
    .select('id')
    .single()

  if (error) throw error
  return data
}

export async function createPost({
  threadId,
  body,
  imageUrls,
  youtubeUrl,
  isOp,
  authorId,
}: {
  threadId: string
  body: string
  imageUrls?: string[]
  youtubeUrl?: string
  isOp?: boolean
  authorId: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      thread_id: threadId,
      body,
      image_urls: imageUrls || null,
      youtube_url: youtubeUrl || null,
      is_op: isOp || false,
      author_id: authorId,
    })
    .select('id')
    .single()

  if (error) throw error
  return data
}

export async function markThreadSolved(threadId: string, solved: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('forum_threads')
    .update({ is_solved: solved })
    .eq('id', threadId)

  if (error) throw error
}

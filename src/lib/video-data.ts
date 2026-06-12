import { createClient } from '@/lib/supabase'

export async function getVideos({
  category,
  generation,
  search,
}: {
  category?: string
  generation?: string
  search?: string
} = {}) {
  const supabase = createClient()
  let query = supabase
    .from('videos')
    .select(`
      id, youtube_id, title, channel_name,
      category, generation, duration,
      like_count, created_at,
      profiles:submitted_by ( username )
    `)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (generation) query = query.eq('generation', generation)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function submitVideo(video: {
  youtubeId: string
  title: string
  channelName: string
  category: string
  generation: string
  duration: string
  submittedBy: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('videos')
    .insert({
      youtube_id: video.youtubeId,
      title: video.title,
      channel_name: video.channelName,
      category: video.category,
      generation: video.generation,
      duration: video.duration,
      submitted_by: video.submittedBy,
      approved: false,
    })
  if (error) throw error
}

export async function likeVideo(videoId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('increment_video_likes', { video_id: videoId })
  if (error) throw error
}

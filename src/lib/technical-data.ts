import { createClient } from '@/lib/supabase'

export async function getTechDocuments(generation: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tech_documents')
    .select('*')
    .eq('generation', generation)
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getTechArticles({
  generation,
  section,
  system,
}: {
  generation: string
  section: 'maintenance' | 'performance'
  system?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('tech_articles')
    .select(`
      id, title, generation, section, system,
      content_type, verified, view_count, created_at,
      profiles:author_id ( username )
    `)
    .eq('generation', generation)
    .eq('section', section)
    .order('verified', { ascending: false })
    .order('view_count', { ascending: false })

  if (system) query = query.eq('system', system)

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function getTechArticle(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tech_articles')
    .select(`
      id, title, generation, section, system,
      content_type, body, file_url, verified, view_count, created_at,
      profiles:author_id ( username )
    `)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function submitTechDocument(doc: {
  name: string
  generation: string
  category: string
  fileUrl: string
  fileSizeMb?: number
  yearRange: string
  submittedBy: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tech_documents')
    .insert({
      name: doc.name,
      generation: doc.generation,
      category: doc.category,
      file_url: doc.fileUrl,
      file_size_mb: doc.fileSizeMb || null,
      year_range: doc.yearRange,
      submitted_by: doc.submittedBy,
      verified: false,
    })
  if (error) throw error
}

export async function submitTechArticle(article: {
  title: string
  generation: string
  section: 'maintenance' | 'performance'
  system: string
  contentType: 'guide' | 'pdf'
  body?: string
  fileUrl?: string
  authorId: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tech_articles')
    .insert({
      title: article.title,
      generation: article.generation,
      section: article.section,
      system: article.system,
      content_type: article.contentType,
      body: article.body || null,
      file_url: article.fileUrl || null,
      author_id: article.authorId,
      verified: false,
    })
  if (error) throw error
}

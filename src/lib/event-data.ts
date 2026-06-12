import { createClient } from '@/lib/supabase'

export async function getEvents({
  type,
  region,
}: {
  type?: string
  region?: string
} = {}) {
  const supabase = createClient()
  let query = supabase
    .from('events')
    .select(`
      id, name, description, type, event_date,
      location, region, attendee_count, created_at,
      profiles:organizer_id ( username )
    `)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  if (type) query = query.eq('type', type)
  if (region) query = query.eq('region', region)

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function submitEvent(event: {
  name: string
  description: string
  type: string
  eventDate: string
  location: string
  region?: string
  organizerId: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('events')
    .insert({
      name: event.name,
      description: event.description,
      type: event.type,
      event_date: event.eventDate,
      location: event.location,
      region: event.region || null,
      organizer_id: event.organizerId,
      attendee_count: 0,
    })
  if (error) throw error
}

export async function attendEvent(eventId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('increment_attendee_count', { event_id: eventId })
  if (error) throw error
}

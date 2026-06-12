import { createClient } from '@/lib/supabase'

export async function getProfile(username: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  if (error) return null
  return data
}

export async function getMyProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function updateProfile(userId: string, updates: {
  bio?: string
  location?: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  if (error) throw error
}

export async function getGarageCars(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('garage_cars')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function addGarageCar(car: {
  userId: string
  year: number
  model: string
  generation: string
  bodyStyle: string
  colorName: string
  colorCode: string
  mileage?: string
  vinLast5?: string
  isPrimary?: boolean
}) {
  const supabase = createClient()

  // If setting as primary, unset all others first
  if (car.isPrimary) {
    await supabase
      .from('garage_cars')
      .update({ is_primary: false })
      .eq('user_id', car.userId)
  }

  const { data, error } = await supabase
    .from('garage_cars')
    .insert({
      user_id: car.userId,
      year: car.year,
      model: car.model,
      generation: car.generation,
      body_style: car.bodyStyle,
      color_name: car.colorName,
      color_code: car.colorCode,
      mileage: car.mileage || null,
      vin_last5: car.vinLast5 || null,
      is_primary: car.isPrimary || false,
    })
    .select('id')
    .single()

  if (error) throw error
  return data
}

export async function updateGarageCar(carId: string, userId: string, updates: {
  year?: number
  model?: string
  generation?: string
  bodyStyle?: string
  colorName?: string
  colorCode?: string
  mileage?: string
  vinLast5?: string
  isPrimary?: boolean
}) {
  const supabase = createClient()

  if (updates.isPrimary) {
    await supabase
      .from('garage_cars')
      .update({ is_primary: false })
      .eq('user_id', userId)
  }

  const { error } = await supabase
    .from('garage_cars')
    .update({
      year: updates.year,
      model: updates.model,
      generation: updates.generation,
      body_style: updates.bodyStyle,
      color_name: updates.colorName,
      color_code: updates.colorCode,
      mileage: updates.mileage,
      vin_last5: updates.vinLast5,
      is_primary: updates.isPrimary,
    })
    .eq('id', carId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteGarageCar(carId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('garage_cars')
    .delete()
    .eq('id', carId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function setPrimarycar(carId: string, userId: string) {
  const supabase = createClient()
  await supabase.from('garage_cars').update({ is_primary: false }).eq('user_id', userId)
  const { error } = await supabase.from('garage_cars').update({ is_primary: true }).eq('id', carId).eq('user_id', userId)
  if (error) throw error
}

export async function getMemberThreads(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_threads')
    .select('id, title, generation, category, reply_count, created_at, last_reply_at')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) return []
  return data ?? []
}

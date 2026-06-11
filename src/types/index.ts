// ── Generation types ──────────────────────────────────────
export type Generation = 'E34' | 'E39' | 'E60' | 'F10' | 'G30'

export const GENERATIONS: Generation[] = ['E34', 'E39', 'E60', 'F10', 'G30']

export const GENERATION_YEARS: Record<Generation, string> = {
  E34: '1988–1996',
  E39: '1995–2003',
  E60: '2003–2010',
  F10: '2010–2017',
  G30: '2017–present',
}

export const GENERATION_ENGINE: Record<Generation, string> = {
  E34: 'M50 / M54 inline-6',
  E39: 'M52 / M54 / M62 V8',
  E60: 'N52 / S85 V10',
  F10: 'N55 / S63 twin-turbo',
  G30: 'B48 / B58 twin-turbo',
}

export const GENERATION_TAGLINE: Record<Generation, string> = {
  E34: 'The analog icon',
  E39: 'The golden era',
  E60: 'The controversial legend',
  F10: 'The modern classic',
  G30: 'The modern powerhouse',
}

// ── User / Auth ──────────────────────────────────────────
export interface Profile {
  id: string
  username: string
  avatar_url?: string
  bio?: string
  location?: string
  member_number: number
  created_at: string
  post_count: number
  build_count: number
  video_count: number
}

// ── Garage ────────────────────────────────────────────────
export interface GarageCar {
  id: string
  user_id: string
  year: number
  model: string
  generation: Generation
  body_style: 'Sedan' | 'Touring' | 'M5'
  color_name: string
  color_code: string
  mileage?: string
  vin_last5?: string
  is_primary: boolean
  build_id?: string
  created_at: string
}

// ── Forums ────────────────────────────────────────────────
export type ForumCategory =
  | 'powertrain'
  | 'suspension'
  | 'electrical'
  | 'builds'
  | 'general'
  | 'marketplace'

export type RegionalSubforum =
  | 'northeast-us'
  | 'southeast-us'
  | 'midwest-us'
  | 'southwest-us'
  | 'west-coast-us'
  | 'eastern-canada'
  | 'western-canada'

export interface ForumThread {
  id: string
  title: string
  body: string
  author_id: string
  author_username: string
  generation?: Generation
  category: ForumCategory
  regional_subforum?: RegionalSubforum
  is_pinned: boolean
  is_solved: boolean
  reply_count: number
  view_count: number
  last_reply_at: string
  created_at: string
}

export interface ForumPost {
  id: string
  thread_id: string
  author_id: string
  author_username: string
  body: string
  image_urls?: string[]
  youtube_url?: string
  is_op: boolean
  created_at: string
}

// ── Videos ────────────────────────────────────────────────
export type VideoCategory =
  | 'diy'
  | 'build-progress'
  | 'reviews'
  | 'track-performance'

export interface Video {
  id: string
  youtube_id: string
  title: string
  channel_name: string
  category: VideoCategory
  generation: Generation
  duration: string
  submitted_by: string
  approved: boolean
  like_count: number
  created_at: string
}

// ── Vendors ───────────────────────────────────────────────
export type VendorType = 'parts' | 'tuner' | 'shop' | 'fabricator' | 'other'

export interface Vendor {
  id: string
  name: string
  type: VendorType
  description: string
  location: string
  website_url?: string
  instagram?: string
  generations: Generation[]
  years_in_business?: number
  approved: boolean
  average_rating: number
  review_count: number
  created_at: string
}

export interface VendorReview {
  id: string
  vendor_id: string
  author_id: string
  author_username: string
  rating: number
  body: string
  created_at: string
}

// ── Technical Info ────────────────────────────────────────
export type TechSection = 'documents' | 'maintenance' | 'performance'

export type TechSystem =
  | 'powertrain'
  | 'suspension'
  | 'electrical'
  | 'body'
  | 'fuel'
  | 'transmission'

export type PerfSystem =
  | 'engine-perf'
  | 'suspension-perf'
  | 'brakes-perf'
  | 'exhaust-perf'
  | 'trans-perf'
  | 'ecu'

export interface TechDocument {
  id: string
  name: string
  generation: Generation
  category: string
  file_url: string
  file_size_mb: number
  year_range: string
  verified: boolean
  submitted_by: string
  created_at: string
}

export interface TechArticle {
  id: string
  title: string
  generation: Generation
  section: 'maintenance' | 'performance'
  system: TechSystem | PerfSystem
  content_type: 'guide' | 'pdf'
  body?: string
  file_url?: string
  author_id: string
  author_username: string
  verified: boolean
  view_count: number
  created_at: string
}

// ── Events ────────────────────────────────────────────────
export type EventType = 'meetup' | 'track-day' | 'show'

export interface CommunityEvent {
  id: string
  name: string
  description: string
  type: EventType
  date: string
  location: string
  region?: RegionalSubforum
  organizer_id: string
  attendee_count: number
  created_at: string
}

// ── Builds ────────────────────────────────────────────────
export interface Build {
  id: string
  user_id: string
  car_id: string
  title: string
  generation: Generation
  status: 'under-construction' | 'complete'
  created_at: string
}

// ── Utility ───────────────────────────────────────────────
export type SortOrder = 'asc' | 'desc'
export type PaginatedResponse<T> = {
  data: T[]
  count: number
  page: number
  per_page: number
}

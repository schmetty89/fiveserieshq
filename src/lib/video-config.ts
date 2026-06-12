export const VIDEO_CATEGORIES = [
  { id: 'diy',              label: 'DIY / How-to',            icon: '🔧' },
  { id: 'build-progress',   label: 'Build progress',          icon: '🚗' },
  { id: 'reviews',          label: 'Reviews & walkthroughs',  icon: '👁️' },
  { id: 'track-performance', label: 'Track & performance',    icon: '🏁' },
] as const

export type VideoCategory = typeof VIDEO_CATEGORIES[number]['id']

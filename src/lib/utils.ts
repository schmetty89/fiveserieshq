import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Generation } from '@/types'

// ── Tailwind class merge helper ───────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Generation color helpers ──────────────────────────────
export const GEN_COLORS: Record<Generation, { bg: string; text: string; border: string }> = {
  E34: { bg: '#FAECE7', text: '#993C1D', border: '#F0997B' },
  E39: { bg: '#E6F1FB', text: '#185FA5', border: '#85B7EB' },
  E60: { bg: '#EEEDFE', text: '#534AB7', border: '#AFA9EC' },
  F10: { bg: '#E1F5EE', text: '#0F6E56', border: '#5DCAA5' },
  G30: { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27' },
}

export function getGenBadgeStyle(gen: Generation) {
  const c = GEN_COLORS[gen]
  return { backgroundColor: c.bg, color: c.text }
}

// ── Format helpers ────────────────────────────────────────
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function formatFileSize(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
  return `${mb} MB`
}

// ── YouTube helpers ───────────────────────────────────────
export function getYouTubeThumbnail(videoId: string, quality: 'mq' | 'hq' = 'mq'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// ── Slug helpers ──────────────────────────────────────────
export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

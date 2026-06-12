'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import { createThread, createPost } from '@/lib/forum-data'
import { useAuth } from '@/components/auth/AuthProvider'
import { GENERATIONS } from '@/types'
import { GEN_SUBFORUM_CATS, REGIONAL_SUBFORUMS } from '@/lib/forum-config'
import { Suspense } from 'react'

function NewThreadFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()

  const defaultGen = searchParams.get('gen') || ''
  const defaultCat = searchParams.get('cat') || 'general'
  const defaultRegion = searchParams.get('region') || ''

  const [form, setForm] = useState({
    title: '',
    body: '',
    generation: defaultGen,
    category: defaultCat,
    region: defaultRegion,
    isRegional: !!defaultRegion,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!user || !profile) return setError('You must be signed in to post.')
    if (!form.title.trim()) return setError('Please enter a thread title.')
    if (form.title.length < 10) return setError('Title must be at least 10 characters.')
    if (!form.body.trim()) return setError('Please write something in the body.')
    if (!form.isRegional && !form.generation) return setError('Please select a generation.')

    setSubmitting(true)

    try {
      const thread = await createThread({
        title: form.title.trim(),
        body: form.body.trim(),
        generation: form.isRegional ? undefined : form.generation,
        category: form.isRegional ? 'general' : form.category,
        regionalSubforum: form.isRegional ? form.region : undefined,
        authorId: user.id,
      })

      await createPost({
        threadId: thread.id,
        body: form.body.trim(),
        isOp: true,
        authorId: user.id,
      })

      router.push(`/forums/thread/${thread.id}`)
    } catch {
      setError('Failed to create thread. Please try again.')
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-3">You need to be signed in to post.</p>
        <Link href="/auth/login?redirect=/forums/new" className="text-sm font-medium text-blue-600 hover:underline">
          Sign in to continue
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/forums" className="hover:text-gray-600">Forums</Link>
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">New thread</span>
      </div>

      <h1 className="text-xl font-medium text-gray-900 mb-6">Start a new thread</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thread type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isRegional: false }))}
              className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                !form.isRegional ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Generation subforum
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isRegional: true }))}
              className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                form.isRegional ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              📍 Regional
            </button>
          </div>
        </div>

        {/* Gen + category OR regional */}
        {!form.isRegional ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Generation</label>
              <select
                name="generation"
                value={form.generation}
                onChange={handleChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select generation</option>
                {GENERATIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {GEN_SUBFORUM_CATS.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
            <select
              name="region"
              value={form.region}
              onChange={handleChange}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select region</option>
              {REGIONAL_SUBFORUMS.map(r => (
                <option key={r.id} value={r.id}>{r.flag} {r.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Thread title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Be specific — good titles get more helpful replies"
            className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Body</label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="Describe the issue, question, or topic in detail. Paste a YouTube URL on its own line to embed it."
            rows={8}
            className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Paste a YouTube link on its own line to embed the video in your post.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/forums" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Posting...</> : 'Post thread'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function NewThreadForm() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-xl" />}>
      <NewThreadFormInner />
    </Suspense>
  )
}

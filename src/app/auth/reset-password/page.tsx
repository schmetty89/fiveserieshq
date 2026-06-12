'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) return setError('Please enter your email address.')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    })

    if (resetError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset link sent</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Check your inbox at <span className="font-medium text-gray-700">{email}</span> for a password reset link.
          </p>
          <Link href="/auth/login" className="text-sm font-medium text-gray-900 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reset your password</h1>
          <p className="text-sm text-gray-500">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : 'Send reset link'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">
          <Link href="/auth/login" className="font-medium text-gray-900 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

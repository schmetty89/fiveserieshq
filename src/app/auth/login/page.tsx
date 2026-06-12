'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.email.trim()) return setError('Please enter your email.')
    if (!form.password) return setError('Please enter your password.')

    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full border-2 border-[#0f0f0f] grid grid-cols-2 overflow-hidden">
              <span className="flex items-center justify-center bg-[#0f0f0f] text-white text-[8px] font-black">B</span>
              <span className="flex items-center justify-center bg-[#0055b3] text-white text-[8px] font-black">M</span>
              <span className="flex items-center justify-center bg-[#0055b3] text-white text-[8px] font-black">W</span>
              <span className="flex items-center justify-center bg-[#0f0f0f] text-white text-[8px] font-black"></span>
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold text-gray-900 tracking-wide">FiveSeriesHQ</div>
              <div className="text-[10px] text-gray-400 tracking-widest uppercase">Community</div>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-6 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Join link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/auth/join" className="font-medium text-gray-900 hover:underline">
            Join FiveSeriesHQ
          </Link>
        </p>
      </div>
    </div>
  )
}

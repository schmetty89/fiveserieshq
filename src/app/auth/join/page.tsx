'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function JoinPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation
    if (!form.username.trim()) return setError('Please choose a username.')
    if (form.username.length < 3) return setError('Username must be at least 3 characters.')
    if (!/^[a-zA-Z0-9_.-]+$/.test(form.username)) return setError('Username can only contain letters, numbers, underscores, dots, and dashes.')
    if (!form.email.trim()) return setError('Please enter your email.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')

    setLoading(true)

    try {
      // Check username availability
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', form.username.toLowerCase())
        .single()

      if (existing) {
        setError('That username is already taken. Please choose another.')
        setLoading(false)
        return
      }

      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { username: form.username.toLowerCase() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              We sent a verification link to <span className="font-medium text-gray-700">{form.email}</span>.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Click the link in that email to verify your account and start posting. You can browse the site in the meantime.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Back to FiveSeriesHQ
            </Link>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-semibold text-gray-900 mt-6 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500">Join the BMW 5 Series community</p>
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

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. e39_mike"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Letters, numbers, underscores, dots, and dashes only.</p>
            </div>

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
              <p className="text-xs text-gray-400 mt-1">You'll need to verify this before you can post.</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Terms note */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By joining you agree to our community rules. This is a BMW 5 Series enthusiast community — keep it respectful and on-topic.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Creating account...</>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

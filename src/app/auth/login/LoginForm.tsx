'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

export function LoginForm() {
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

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#0055b3] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-[15px]" style={{ fontStyle: 'italic' }}>M</span>
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold text-gray-900 tracking-wide">The Five Series HQ</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
                : 'Sign in'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/auth/join" className="font-medium text-gray-900 hover:underline">
            Join FiveSeriesHQ
          </Link>
        </p>

        <p className="text-center mt-3">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}

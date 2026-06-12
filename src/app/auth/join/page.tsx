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

    if (!form.username.trim()) return setError('Please choose a username.')
    if (form.username.length < 3) return setError('Username must be at least 3 characters.')
    if (!/^[a-zA-Z0-9_.-]+$/.test(form.username)) return setError('Username can only contain letters, numbers, underscores, dots, and dashes.')
    if (!form.email.trim()) return setError('Please enter your email.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')

    setLoading(true)

    try {
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

  // After successful signup, redirect to verify page
  if (success) {
    router.push('/auth/verify')
    return null
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
          </Link>
        </p>
      </div>
    </div>
  )
}

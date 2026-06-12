import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Verify your email' }

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Check your inbox</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs mx-auto">
          We sent you a verification link. Click it to confirm your email and unlock posting.
          You can browse the site in the meantime.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Browse FiveSeriesHQ
        </Link>
        <p className="text-xs text-gray-400 mt-6">
          Didn&apos;t get the email? Check your spam folder, or{' '}
          <Link href="/auth/join" className="underline hover:text-gray-600">try again</Link>.
        </p>
      </div>
    </div>
  )
}

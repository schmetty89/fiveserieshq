import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Construction, Upload } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Showcase',
  description: 'BMW 5 Series member build showcase — coming soon.',
}

export default function BuildsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">

        {/* Title section */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-medium text-gray-900 mb-1">Build showcase</h1>
            <p className="text-sm text-gray-500">
              Member-documented builds across every generation — E34 to G30.
            </p>
          </div>
        </div>

        {/* Under construction state */}
        <div className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
            <Construction size={28} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-3">
            Under construction
          </h2>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-2">
            The build showcase is being developed. We&apos;re working on a standardized build book
            template so every showcase page has consistent, detailed information.
          </p>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
            Once the template is finalized, members will be able to download it, fill it out,
            and upload their PDF — the site will generate a dedicated showcase page automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/forums/builds"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Browse build threads in the forum
            </Link>
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed"
            >
              <Upload size={15} />
              Upload build book — coming soon
            </button>
          </div>

          {/* Timeline of what's coming */}
          <div className="mt-16 w-full max-w-lg text-left">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              What&apos;s coming
            </h3>
            <div className="space-y-4">
              {[
                { step: '01', label: 'Build book template', desc: 'A standardized Word document covering vehicle info, mods, dyno numbers, maintenance, and free-form notes.' },
                { step: '02', label: 'PDF upload flow', desc: 'Members upload their completed build book PDF. The site parses the data and generates a showcase page.' },
                { step: '03', label: 'Showcase page', desc: 'A dedicated page per build with photo gallery, mod list, timeline, and dyno numbers.' },
                { step: '04', label: 'Community interaction', desc: 'Comments, reactions, and save-to-favorites on each build page.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="text-xs font-mono text-gray-300 pt-0.5 w-5 flex-shrink-0">{item.step}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

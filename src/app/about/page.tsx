import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind FiveSeriesHQ — the one-stop hub for BMW 5 Series owners across every generation.',
}

const STATS = [
  { value: '5',        label: 'Generations covered',    sub: 'E34 through G30' },
  { value: '11+',      label: 'Forum sections',          sub: 'Tech, builds, regional & more' },
  { value: '1',        label: 'Goal',                    sub: 'The definitive 5 Series resource' },
]

const PILLARS = [
  {
    icon: '💬',
    title: 'Community forums',
    desc: 'Generation-specific subforums covering powertrain, suspension, electrical, builds, and general discussion — plus regional forums for every corner of the US and Canada. A place to ask questions, share knowledge, and connect with owners who\'ve been where you are.',
  },
  {
    icon: '🔧',
    title: 'Technical library',
    desc: 'The most thorough technical resource for the 5 Series anywhere online. Factory service manuals, wiring diagrams, step-by-step maintenance guides, and performance documentation — covering everything from an oil service to a complete drivetrain swap.',
  },
  {
    icon: '🚗',
    title: 'Build showcase',
    desc: 'A dedicated space for members to document and display their builds. Standardized build books capture the full story of a car — the modifications, the milestones, the dyno numbers. Rate, review, and get inspired by what the community is building.',
  },
  {
    icon: '▶️',
    title: 'Curated video library',
    desc: 'A member-submitted, admin-approved library of the best BMW 5 Series content on YouTube. DIY guides, build diaries, reviews, and track footage — organized by generation and category so the best content is always easy to find.',
  },
  {
    icon: '🏪',
    title: 'Trusted vendors',
    desc: 'A hand-curated directory of parts suppliers, tuners, and independent shops that know the 5 Series inside and out. Every vendor is reviewed and approved before listing. Rated and reviewed by the community.',
  },
  {
    icon: '📍',
    title: 'Events & community',
    desc: 'Meetups, track days, and shows organized by region. A garage section where members register their cars. Member profiles that tell the story of an owner and their cars across time.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <div className="bg-[#0f0f0f] py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-[3px] mb-4">About FiveSeriesHQ</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
              There was no single place<br className="hidden sm:block" /> for all of this.
            </h1>
            <p className="text-base text-white/55 leading-relaxed max-w-2xl mx-auto">
              Forums exist. YouTube channels exist. Social media groups exist. But nothing brought it all together — not for the BMW 5 Series, not across every generation, not at the depth this car deserves.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2px_1fr] gap-10 items-start mb-16">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Where it started</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                The passion really ignited in 2022 with the purchase of a 2011 F10 535i. Anyone who has owned one knows what happens — you start digging, asking questions, watching videos, joining groups. You find incredible pockets of knowledge scattered across the internet but no single place that ties it all together.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                That gap is what FiveSeriesHQ was built to fill. Not just for the F10, and not just for one generation — but for every 5 Series owner, whether you&apos;re nursing a high-mileage E34 back to life or extracting every last horsepower from a G30 M5 Competition.
              </p>
            </div>
            <div className="hidden md:block bg-gray-100 self-stretch" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">The generations</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Every generation of the 5 Series has its own character, its own community, its own quirks and strengths. The E39 is simply iconic — widely regarded as one of the greatest executive cars ever built. The F10 brought it roaring into the modern era with twin-turbo power and a level of refinement that still turns heads.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                From the analog purity of the E34 to the technology-forward G30, this platform has always been about the right balance — performance, practicality, and character. Every generation deserves a home.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="border-l-4 border-[#0f0f0f] pl-6 mb-16">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">The mission</p>
            <p className="text-xl font-medium text-gray-900 leading-relaxed">
              To build the most comprehensive, community-driven resource for BMW 5 Series owners that has ever existed — covering every generation, every system, every build, every question.
            </p>
          </div>

          {/* Honest note */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-16">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">An honest note</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              This is a grandiose goal and it won&apos;t happen overnight. Building the most thorough technical library for five generations of a car, a meaningful build showcase, a genuinely useful vendor directory — that takes time, and more importantly, it takes a community willing to contribute.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              What exists today is a foundation. What it becomes depends on the owners, wrenchers, tuners, and enthusiasts who show up and make it theirs. If you know something worth sharing — a fix that took you three weekends to figure out, a build that deserves to be seen, a vendor who went above and beyond — this is the place for it.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 border-y border-gray-100 py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{s.value}</div>
                  <div className="text-sm font-medium text-gray-700 mb-0.5">{s.label}</div>
                  <div className="text-xs text-gray-400">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's being built */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">What we&apos;re building</h2>
          <p className="text-sm text-gray-500 mb-10">Six core sections — each designed to be the best version of that thing for the 5 Series community.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PILLARS.map(p => (
              <div key={p.title} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0f0f0f] py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Join the community</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-lg mx-auto">
              Whether you own an E34 with 250,000 miles or a G30 fresh off the lot — there&apos;s a place for you here. Create an account, register your car, and start contributing to something worth building.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/join"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-gray-900 text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Create an account
              </Link>
              <Link
                href="/forums"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Browse the forums
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}

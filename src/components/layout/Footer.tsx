import Link from 'next/link'

const FOOTER_LINKS = {
  Community: [
    { label: 'Forums', href: '/forums' },
    { label: 'Build showcase', href: '/builds' },
    { label: 'Member garage', href: '/members' },
    { label: 'Events', href: '/events' },
  ],
  Resources: [
    { label: 'Video library', href: '/videos' },
    { label: 'Technical info', href: '/technical' },
    { label: 'Trusted vendors', href: '/vendors' },
    { label: 'Build books', href: '/builds/library' },
  ],
  Generations: [
    { label: 'E34 (1988–1996)', href: '/forums?gen=E34' },
    { label: 'E39 (1995–2003)', href: '/forums?gen=E39' },
    { label: 'E60 (2003–2010)', href: '/forums?gen=E60' },
    { label: 'F10 (2010–2017)', href: '/forums?gen=F10' },
    { label: 'G30 (2017–)', href: '/forums?gen=G30' },
  ],
  Site: [
    { label: 'About', href: '/about' },
    { label: 'Join', href: '/auth/join' },
    { label: 'Terms of Use', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white/50 mt-16">
      <div className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-white/40 grid grid-cols-2 overflow-hidden">
              <span className="flex items-center justify-center bg-white text-[#0055b3] text-[5px] font-black">B</span>
              <span className="flex items-center justify-center bg-[#0055b3] text-white text-[5px] font-black">M</span>
              <span className="flex items-center justify-center bg-[#0055b3] text-white text-[5px] font-black">W</span>
              <span className="flex items-center justify-center bg-white"></span>
            </div>
            <span className="text-xs text-white/40">FiveSeriesHQ — not affiliated with BMW AG</span>
          </div>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} FiveSeriesHQ. Community-run, passion-driven.
          </p>
        </div>
      </div>
    </footer>
  )
}

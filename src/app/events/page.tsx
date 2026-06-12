import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EventsCalendar } from '@/components/events/EventsCalendar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
  description: 'BMW 5 Series meetups, track days, and shows — find events near you or submit your own.',
}

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <EventsCalendar />
      </main>
      <Footer />
    </>
  )
}

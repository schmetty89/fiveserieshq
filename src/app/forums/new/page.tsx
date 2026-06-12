import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { NewThreadForm } from '@/components/forums/NewThreadForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New thread' }

export default function NewThreadPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <NewThreadForm />
      </main>
      <Footer />
    </>
  )
}

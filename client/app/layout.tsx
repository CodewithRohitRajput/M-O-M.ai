import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteNav } from '@/components/site-nav'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'mom.ai — meeting notes',
  description:
    'Upload a client call and get structured meeting notes, decisions, action items and risks.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col">
        {/* Ambient backdrop: drifting colour blobs behind a masked grid. */}
        <div className="aurora" aria-hidden="true">
          <span />
        </div>
        <div className="grid-bg" aria-hidden="true" />

        <SiteNav />

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          {children}
        </main>

        <footer className="mt-8 border-t border-[rgb(var(--border))]">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-faint">
            <p>© {new Date().getFullYear()} mom.ai — meeting notes, minus the note-taking.</p>
            <p className="inline-flex items-center gap-2">
              <span className="dot-live" />
              All systems operational
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}

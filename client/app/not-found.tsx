import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="reveal mx-auto max-w-md space-y-6 py-16 text-center">
      <p className="gradient-text text-7xl font-bold tracking-tighter sm:text-8xl">
        404
      </p>

      <div className="space-y-2.5">
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm leading-relaxed text-muted">
          That route does not exist.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          <BackIcon />
          Back to meetings
        </Link>
        <Link href="/upload" className="btn btn-ghost">
          New meeting
        </Link>
      </div>
    </main>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M19 12H5m6 6-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

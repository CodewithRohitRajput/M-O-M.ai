'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="reveal mx-auto max-w-md space-y-6 py-16 text-center">
      <span className="bob mx-auto grid size-16 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500">
        <BoltIcon />
      </span>

      <div className="space-y-2.5">
        <h1 className="text-3xl font-semibold tracking-tight">
          Something <span className="gradient-text">broke</span>
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-faint">ref {error.digest}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary">
          <RetryIcon />
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Back to meetings
        </Link>
      </div>
    </main>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
      <path
        d="M13 3 5.5 13.5H11l-1 7.5L18.5 10H13l1-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M20 12a8 8 0 1 1-2.7-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 4v4.5h-4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

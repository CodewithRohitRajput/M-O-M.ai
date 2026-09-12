'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

type ActionItem = {
  task?: string
  owner?: string | null
  deadline?: string | null
}

type Meeting = {
  _id: string
  clientId?: { _id: string; email?: string } | string | null
  analysis?: {
    summary?: string | null
    actionItems?: ActionItem[] | null
    risks?: string[] | null
    decisions?: string[] | null
    problems?: string[] | null
  } | null
  status?: string
  createdAt?: string
}

const STATUS_TEXT: Record<string, string> = {
  queued: 'Waiting for the bot',
  recording: 'Bot is recording',
  transcribing: 'Writing notes',
  failed: 'Failed',
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/meet/get`, { credentials: 'include' })
      .then((response) => response.json())
      .then((body) => setMeetings(body.data ?? []))
      .catch(() => setError('Could not load meetings.'))
      .finally(() => setLoading(false))
  }, [])

  const analysed = meetings.filter((meeting) => meeting.analysis?.summary).length
  const clients = new Set(
    meetings
      .map((meeting) =>
        typeof meeting.clientId === 'object' ? meeting.clientId?._id : meeting.clientId
      )
      .filter(Boolean)
  ).size

  /* Every action item across every meeting, so the dashboard shows what is
     actually outstanding rather than just how many calls happened. */
  const allTasks = meetings.flatMap((meeting) =>
    (meeting.analysis?.actionItems ?? [])
      .filter((item) => item?.task)
      .map((item) => ({
        ...item,
        meetingId: meeting._id,
        client:
          typeof meeting.clientId === 'object' ? meeting.clientId?.email : undefined,
      }))
  )

  const withDeadline = allTasks
    .filter((task) => task.deadline)
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))

  return (
    <section className="space-y-10">
      <header className="reveal space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-glow)/0.3)] bg-[rgb(var(--accent-glow)/0.09)] px-3 py-1 text-xs font-medium text-accent">
          <span className="dot-live" />
          Notes generated automatically
        </span>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Your <span className="gradient-text">meetings</span>
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-muted">
              Every client call, distilled into summaries, decisions, action items
              and risks.
            </p>
          </div>
          <Link href="/upload" className="btn btn-primary">
            <PlusIcon />
            New meeting
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Meetings" value={loading ? null : meetings.length} delay={0} />
          <Stat label="With notes" value={loading ? null : analysed} delay={70} />
          <Stat label="Action items" value={loading ? null : allTasks.length} delay={140} />
          <Stat label="Clients" value={loading ? null : clients} delay={210} />
        </div>
      </header>

      {!loading && withDeadline.length > 0 && (
        <section className="reveal space-y-3" style={{ '--d': '120ms' } as React.CSSProperties}>
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
            <span className="text-accent">
              <ClockIcon />
            </span>
            Upcoming deadlines
            <span className="rounded-full border border-[rgb(var(--border-strong))] px-2 py-0.5 text-[10px] tabular-nums">
              {withDeadline.length}
            </span>
          </h2>

          <div className="surface divide-y divide-[rgb(var(--border))] overflow-hidden rounded-2xl">
            {withDeadline.slice(0, 6).map((task, index) => (
              <Link
                key={`${task.meetingId}-${index}`}
                href={`/meetings/${task.meetingId}`}
                className="flex items-start gap-3 px-5 py-4 transition-colors duration-300 hover:bg-[rgb(var(--accent-glow)/0.06)]"
              >
                <span className="mt-0.5 shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                  {task.deadline}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{task.task}</p>
                  <p className="mt-0.5 truncate text-xs text-faint">
                    {task.owner ?? 'Unassigned'}
                    {task.client ? ` · ${task.client}` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {error && (
        <div className="reveal flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.07] p-4 text-sm text-red-500">
          <AlertIcon />
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="grid gap-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="surface reveal space-y-3 rounded-2xl p-6"
              style={{ '--d': `${index * 90}ms` } as React.CSSProperties}
            >
              <div className="skeleton h-3.5 w-44" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-3/5" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid gap-4">
          {meetings.map((meeting, index) => {
            const client =
              typeof meeting.clientId === 'object' ? meeting.clientId : null
            const summary = meeting.analysis?.summary

            return (
              <Link
                key={meeting._id}
                href={`/meetings/${meeting._id}`}
                style={{ '--d': `${Math.min(index, 8) * 70}ms` } as React.CSSProperties}
                className="surface lift edge-glow reveal group block rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[rgb(var(--accent-glow)/0.25)] bg-[rgb(var(--accent-glow)/0.1)] text-sm font-semibold text-accent transition-transform duration-500 group-hover:scale-105">
                    {initials(client?.email)}
                  </span>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="truncate text-sm font-semibold text-accent">
                        {client?.email ?? 'Client email unavailable'}
                      </p>
                      {meeting.status === 'failed' ? (
                        <Badge tone="failed">Failed</Badge>
                      ) : summary ? (
                        <Badge tone="ready">Notes ready</Badge>
                      ) : (
                        <Badge tone="pending">
                          {STATUS_TEXT[meeting.status ?? ''] ?? 'Processing'}
                        </Badge>
                      )}
                    </div>

                    <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                      {summary ?? 'Meeting notes are still processing.'}
                    </p>

                    {summary && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                        <Meta count={meeting.analysis?.actionItems?.length}>tasks</Meta>
                        <Meta count={meeting.analysis?.decisions?.length}>decisions</Meta>
                        <Meta count={meeting.analysis?.problems?.length}>pain points</Meta>
                        <Meta count={meeting.analysis?.risks?.length}>risks</Meta>
                      </div>
                    )}

                    {!summary && meeting.status !== 'failed' && (
                      <div className="rail mt-3 max-w-xs" />
                    )}
                  </div>

                  <span className="mt-3 shrink-0 text-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-accent">
                    <ArrowIcon />
                  </span>
                </div>
              </Link>
            )
          })}

          {meetings.length === 0 && !error && (
            <div className="surface reveal grid place-items-center gap-4 rounded-2xl px-6 py-16 text-center">
              <span className="bob grid size-16 place-items-center rounded-2xl border border-[rgb(var(--accent-glow)/0.25)] bg-[rgb(var(--accent-glow)/0.08)] text-accent">
                <WaveIcon />
              </span>
              <div className="space-y-1.5">
                <p className="text-lg font-semibold">No meetings yet</p>
                <p className="text-sm text-muted">
                  Upload your first recording and the notes write themselves.
                </p>
              </div>
              <Link href="/upload" className="btn btn-primary">
                <PlusIcon />
                Upload a recording
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
  delay,
}: {
  label: string
  value: number | null
  delay: number
}) {
  return (
    <div
      className="surface lift reveal rounded-2xl px-5 py-4"
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      {value === null ? (
        <div className="skeleton h-7 w-10" />
      ) : (
        <p className="reveal-pop text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      )}
      <p className="mt-1 text-xs uppercase tracking-wider text-faint">{label}</p>
    </div>
  )
}

/** One "3 tasks" pill; renders nothing when the count is zero or missing. */
function Meta({ count, children }: { count?: number | null; children: string }) {
  if (!count) return null
  return (
    <span className="tabular-nums">
      <span className="font-semibold text-muted">{count}</span> {children}
    </span>
  )
}

function Badge({
  tone,
  children,
}: {
  tone: 'ready' | 'pending' | 'failed'
  children: string
}) {
  const styles =
    tone === 'ready'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
      : tone === 'failed'
        ? 'border-red-500/30 bg-red-500/10 text-red-500'
        : 'border-amber-500/30 bg-amber-500/10 text-amber-500'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles}`}
    >
      {tone === 'pending' && <span className="spinner !size-2.5 !border-current !border-t-transparent" />}
      {children}
    </span>
  )
}

/** Two letters from the local part of an email, for the avatar tile. */
function initials(email?: string) {
  if (!email) return '—'
  const local = email.split('@')[0]
  const parts = local.split(/[._-]/).filter(Boolean)
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : local.slice(0, 2)
  return letters.toUpperCase()
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mt-px size-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
      <path
        d="M4 12h1.5M8 8v8M12 5v14M16 8v8M18.5 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

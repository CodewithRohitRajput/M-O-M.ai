'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiError, deleteMeeting, getMeeting } from '@/lib/api'
import {
  dateFromObjectId,
  formatDate,
  googleDocUrl,
  shortId,
} from '@/lib/format'
import type { ActionItem, Meeting, MeetingAnalysis } from '@/lib/types'

const panelClass = 'rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'

/** Rendered in this order; keys that come back empty are skipped. */
const LIST_SECTIONS: { key: keyof MeetingAnalysis; title: string }[] = [
  { key: 'requirements', title: 'Requirements' },
  { key: 'decisions', title: 'Decisions' },
  { key: 'risks', title: 'Risks' },
  { key: 'clientWants', title: 'What the client wants' },
  { key: 'clientNeeds', title: 'What the client needs' },
  { key: 'problems', title: 'Problems raised' },
  { key: 'preferences', title: 'Preferences' },
  { key: 'clientPromises', title: 'Client promises' },
  { key: 'ourPromises', title: 'Our promises' },
  { key: 'decisionMakers', title: 'Decision makers' },
  { key: 'changesFromPreviousMeetings', title: 'Changes since last meeting' },
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  )
}

function clientIdOf(meeting: Meeting): string {
  return typeof meeting.clientId === 'string'
    ? meeting.clientId
    : meeting.clientId?._id ?? ''
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className={`${panelClass} divide-y divide-zinc-100 dark:divide-zinc-900`}>
      {items.map((item, index) => (
        <p
          key={index}
          className="px-5 py-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300"
        >
          {item}
        </p>
      ))}
    </div>
  )
}

function ActionItems({ items }: { items: ActionItem[] }) {
  return (
    <div className={`${panelClass} overflow-x-auto`}>
      <table className="w-full min-w-lg text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Task</th>
            <th className="px-5 py-3 font-semibold">Owner</th>
            <th className="px-5 py-3 font-semibold">Deadline</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {items.map((item, index) => (
            <tr key={index}>
              <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
                {item.task ?? '—'}
              </td>
              <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                {item.owner ?? 'Unassigned'}
              </td>
              <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                {item.deadline ?? 'No deadline'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Transcript({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`${panelClass} p-5`}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-sm font-medium text-zinc-900 dark:text-zinc-100"
        aria-expanded={open}
      >
        <span>Full transcript</span>
        <span className="text-xs font-normal text-zinc-500">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>
      {open && (
        <p className="mt-4 whitespace-pre-wrap border-t border-zinc-100 pt-4 font-mono text-xs leading-6 text-zinc-600 dark:border-zinc-900 dark:text-zinc-400">
          {text}
        </p>
      )}
    </div>
  )
}

export function MeetingDetail({ id }: { id: string }) {
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getMeeting(id, controller.signal)
      .then((data) => {
        setMeeting(data ?? null)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(
          err instanceof ApiError ? err.message : 'Failed to load this meeting.'
        )
        setMeeting(null)
      })

    return () => controller.abort()
  }, [id, reloadKey])

  const handleDelete = async () => {
    if (!window.confirm('Delete this meeting? This cannot be undone.')) return

    setDeleting(true)
    try {
      await deleteMeeting(id)
      router.push('/')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to delete meeting.'
      )
      setDeleting(false)
    }
  }

  if (meeting === undefined) {
    return (
      <div className="grid gap-4">
        <div className={`${panelClass} h-24 animate-pulse`} />
        <div className={`${panelClass} h-24 animate-pulse`} />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button onClick={() => {
              setMeeting(undefined)
              setReloadKey((key) => key + 1)
            }} className="font-medium underline">Try again</button>
          </div>
        )}
        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Meeting not found</h1>
          <p className="text-zinc-500">This meeting may have been deleted, or the id in the URL is wrong.</p>
          <a href="/" className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Back to meetings</a>
        </div>
      </div>
    )
  }

  const created = dateFromObjectId(meeting._id)
  const analysis = meeting.analysis
  const actionItems = analysis?.actionItems ?? []

  const populatedLists = LIST_SECTIONS.map((section) => ({
    ...section,
    items: (analysis?.[section.key] as string[] | undefined) ?? [],
  })).filter((section) => section.items.length > 0)

  return (
    <div className="space-y-8">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500 dark:text-zinc-500">
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700">Client {shortId(clientIdOf(meeting))}</span>
          {typeof meeting.clientId !== 'string' && meeting.clientId?.email && (
            <span>{meeting.clientId.email}</span>
          )}
          <span>{formatDate(created)}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Meeting notes
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {meeting.googleDocId && (
              <a
                href={googleDocUrl(meeting.googleDocId)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium"
              >
                Open Google Doc
              </a>
            )}
            <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white" onClick={handleDelete} disabled={deleting}>
              Delete
            </button>
          </div>
        </div>
      </header>

      {analysis?.summary ? (
        <Section title="Summary">
          <div className={`${panelClass} p-5`}>
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {analysis.summary}
            </p>
          </div>
        </Section>
      ) : (
        <p className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">This meeting has a transcript but no analysis was saved for it.</p>
      )}

      {actionItems.length > 0 && (
        <Section title="Action items">
          <ActionItems items={actionItems} />
        </Section>
      )}

      {populatedLists.map((section) => (
        <Section key={section.key as string} title={section.title}>
          <BulletList items={section.items} />
        </Section>
      ))}

      {meeting.transcript && <Transcript text={meeting.transcript} />}
    </div>
  )
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type Meeting = {
  _id: string;
  clientId?: { _id: string; email?: string } | string | null;
  transcript?: string;
  analysis?: { summary?: string; requirements?: string[] } | null;
};

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  return <MeetingView id={id} />;
}

function MeetingView({ id }: { id: string }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`${API}/meet/get/${id}`, { credentials: "include" })
      .then((response) => response.json())
      .then((body) => setMeeting(body.data))
      .catch(() => setError("Could not load this meeting."));
  }, [id]);

  if (error)
    return (
      <div className="reveal mx-auto max-w-md space-y-4 py-14 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500">
          <AlertIcon large />
        </span>
        <p className="text-lg font-semibold">{error}</p>
        <Link href="/" className="btn btn-ghost">
          <BackIcon />
          Back to meetings
        </Link>
      </div>
    );

  if (!meeting)
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-9 w-72" />
          <div className="skeleton h-3 w-48" />
        </div>
        {[0, 1].map((index) => (
          <div
            key={index}
            className="surface reveal space-y-3 rounded-2xl p-6"
            style={{ "--d": `${index * 110}ms` } as React.CSSProperties}
          >
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-11/12" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
        <p className="flex items-center justify-center gap-2 text-sm text-muted">
          <span className="spinner !border-current !border-t-transparent" />
          Loading meeting notes...
        </p>
      </div>
    );

  const client = typeof meeting.clientId === "object" ? meeting.clientId : null;
  const requirements = meeting.analysis?.requirements ?? [];

  return (
    <article className="space-y-10">
      <header className="reveal space-y-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-sm text-accent"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            <BackIcon />
          </span>
          Back to meetings
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[rgb(var(--accent-glow)/0.25)] bg-[rgb(var(--accent-glow)/0.1)] text-accent">
              <DocIcon />
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Meeting <span className="gradient-text">notes</span>
              </h1>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <MailIcon />
                {client?.email ?? "Client email unavailable"}
              </p>
            </div>
          </div>

          <button
            className="btn btn-danger"
            disabled={deleting}
            onClick={() => {
              setDeleting(true);
              fetch(`${API}/meet/get/${id}`, { method: "DELETE" })
                .then(() => router.push("/"))
                .catch(() => {
                  setDeleting(false);
                  setError("Could not delete this meeting.");
                });
            }}
          >
            {deleting ? (
              <span className="spinner !border-current !border-t-transparent" />
            ) : (
              <TrashIcon />
            )}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </header>

      <Section title="Summary" delay={90} icon={<SparkIcon />}>
        <div className="surface edge-glow rounded-2xl p-6 text-[15px] leading-7 text-muted">
          {meeting.analysis?.summary ?? "No summary available."}
        </div>
      </Section>

      {requirements.length > 0 && (
        <Section
          title="Requirements"
          delay={170}
          icon={<ListIcon />}
          count={requirements.length}
        >
          <div className="surface divide-y divide-[rgb(var(--border))] overflow-hidden rounded-2xl">
            {requirements.map((item: string, index: number) => (
              <div
                key={item}
                style={{ "--d": `${200 + Math.min(index, 12) * 55}ms` } as React.CSSProperties}
                className="reveal-x flex items-start gap-3 px-6 py-4 transition-colors duration-300 hover:bg-[rgb(var(--accent-glow)/0.06)]"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-[rgb(var(--accent-glow)/0.3)] bg-[rgb(var(--accent-glow)/0.1)] text-[10px] font-bold text-accent">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {meeting.transcript && (
        <details
          style={{ "--d": "250ms" } as React.CSSProperties}
          className="surface lift reveal group rounded-2xl p-6"
        >
          <summary className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="flex items-center gap-2.5">
              <span className="text-accent">
                <TranscriptIcon />
              </span>
              Full transcript
            </span>
            <span className="flex items-center gap-2 text-xs font-normal text-faint">
              {meeting.transcript.split(/\s+/).length.toLocaleString()} words
              <span className="transition-transform duration-300 group-open:rotate-180">
                <ChevronIcon />
              </span>
            </span>
          </summary>
          <p className="reveal mt-5 max-h-96 overflow-y-auto whitespace-pre-wrap border-t border-[rgb(var(--border))] pt-5 font-mono text-xs leading-6 text-muted">
            {meeting.transcript}
          </p>
        </details>
      )}
    </article>
  );
}

function Section({
  title,
  icon,
  count,
  delay,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="reveal space-y-3"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
        <span className="text-accent">{icon}</span>
        {title}
        {count !== undefined && (
          <span className="rounded-full border border-[rgb(var(--border-strong))] px-2 py-0.5 text-[10px] tabular-nums">
            {count}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
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
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path
        d="M6 3.5h7L18.5 9v11.5H6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13 3.5V9h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M9 13h6M9 16.5h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m4 8 7.1 4.8a1.6 1.6 0 0 0 1.8 0L20 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M9 6h11M9 12h11M9 18h11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="4.5" cy="6" r="1.3" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1.3" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1.3" fill="currentColor" />
    </svg>
  );
}

function TranscriptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M4 11.5V10a8 8 0 0 1 16 0v1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="2.5" y="11" width="4" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="17.5" y="11" width="4" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function AlertIcon({ large }: { large?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={large ? "size-7" : "size-4 shrink-0"}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

"use client";

import { DragEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type Client = {
  _id: string;
  email: string;
};

const STEPS = ["Uploading audio", "Transcribing", "Writing notes"];

export default function UploadPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    fetch(`${API}/client/get`, {
      credentials: "include",
    })
      .then(async (response) => {
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.message ?? "Could not load clients.");
        }

        setClients(body.data ?? []);
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error ? error.message : "Could not load clients.",
        );
      });
  }, []);

  /* The request gives no progress events, so walk the labels on a timer
     just to show the pipeline is alive. */
  useEffect(() => {
    if (!submitting) return;

    const timer = setInterval(
      () => setStep((value) => Math.min(value + 1, STEPS.length - 1)),
      2600,
    );
    return () => clearInterval(timer);
  }, [submitting]);

  function pickFile(file: File | null | undefined) {
    if (!file) return;
    setAudio(file);
    setMessage("");
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientId || !audio) {
      setMessage("Select a client and choose an audio file.");
      return;
    }

    setStep(0);
    setSubmitting(true);
    setMessage("");

    try {
      const form = new FormData();
      form.append("audio", audio);
      form.append("clientId", clientId);

      const response = await fetch(`${API}/meet/transcribe`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.message ?? "Could not process recording.");
      }

      router.push(`/meetings/${body.data._id}`);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-9">
      <header className="reveal space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-glow)/0.3)] bg-[rgb(var(--accent-glow)/0.09)] px-3 py-1 text-xs font-medium text-accent">
          <span className="eq flex h-3 items-end gap-[3px]">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          Audio in, notes out
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          New <span className="gradient-text">meeting</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Drop a recording and we&apos;ll transcribe it, then pull out the
          summary, decisions, action items and risks.
        </p>
      </header>

      <form
        onSubmit={submit}
        style={{ "--d": "90ms" } as React.CSSProperties}
        className="surface edge-glow reveal space-y-7 rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-3">
          <label
            htmlFor="client"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint"
          >
            <StepDot>1</StepDot>
            Select client
          </label>
          <div className="relative">
            <select
              id="client"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              required
              className="field cursor-pointer appearance-none pr-10"
            >
              <option value="">Choose a client</option>

              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.email}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-faint">
              <ChevronIcon />
            </span>
          </div>
          {clients.length === 0 && (
            <p className="text-xs text-muted">
              No clients loaded yet —{" "}
              <Link href="/clients" className="text-accent underline underline-offset-2">
                add one first
              </Link>
              .
            </p>
          )}
        </div>

        <div className="space-y-3">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
            <StepDot>2</StepDot>
            Audio recording
          </span>

          <label
            htmlFor="audio"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`group grid cursor-pointer place-items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-11 text-center transition-all duration-300 ${
              dragging
                ? "scale-[1.01] border-[rgb(var(--accent-glow)/0.9)] bg-[rgb(var(--accent-glow)/0.1)]"
                : audio
                  ? "border-emerald-500/45 bg-emerald-500/[0.06]"
                  : "border-[rgb(var(--border-strong))] hover:border-[rgb(var(--accent-glow)/0.6)] hover:bg-[rgb(var(--accent-glow)/0.05)]"
            }`}
          >
            <span
              className={`grid size-14 place-items-center rounded-2xl border transition-all duration-500 ${
                audio
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-500"
                  : "border-[rgb(var(--accent-glow)/0.25)] bg-[rgb(var(--accent-glow)/0.09)] text-accent group-hover:scale-110"
              } ${dragging ? "scale-110" : ""}`}
            >
              {audio ? <CheckIcon /> : <UploadIcon />}
            </span>

            {audio ? (
              <span className="reveal-pop space-y-1">
                <span className="block truncate text-sm font-semibold">
                  {audio.name}
                </span>
                <span className="block text-xs text-muted">
                  {formatSize(audio.size)} · click or drop to replace
                </span>
              </span>
            ) : (
              <span className="space-y-1">
                <span className="block text-sm font-semibold">
                  {dragging ? "Drop it here" : "Drag an audio file here"}
                </span>
                <span className="block text-xs text-muted">
                  or click to browse — mp3, m4a, wav, webm
                </span>
              </span>
            )}

            <input
              id="audio"
              type="file"
              accept="audio/*"
              required
              className="sr-only"
              onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {message && (
          <p className="reveal-x flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.07] px-4 py-3 text-sm text-red-500">
            <AlertIcon />
            {message}
          </p>
        )}

        {submitting && (
          <div className="reveal space-y-3 rounded-xl border border-[rgb(var(--accent-glow)/0.25)] bg-[rgb(var(--accent-glow)/0.06)] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-accent">
                {STEPS[step]}...
              </span>
              <span className="text-faint">
                {step + 1} / {STEPS.length}
              </span>
            </div>
            <div className="rail" />
            <p className="text-xs text-muted">
              Long recordings can take a couple of minutes. Keep this tab open.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-[rgb(var(--border))] pt-6">
          <button
            type="submit"
            disabled={submitting || clients.length === 0}
            className="btn btn-primary"
          >
            {submitting ? <span className="spinner" /> : <SparkIcon />}
            {submitting ? "Processing..." : "Create notes"}
          </button>
          <Link href="/" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

function StepDot({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-5 place-items-center rounded-full border border-[rgb(var(--accent-glow)/0.3)] bg-[rgb(var(--accent-glow)/0.1)] text-[10px] font-bold text-accent">
      {children}
    </span>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15v2.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V15"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

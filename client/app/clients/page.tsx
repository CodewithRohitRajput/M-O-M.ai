"use client";

import { FormEvent, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function ClientsPage() {
  const [clients, setClients] = useState<{ _id: string; email: string }[]>([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadClients = () => {
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
        setOk(false);
        setMessage(error instanceof Error ? error.message : "Could not load clients.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadClients, []);

  async function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/client/create`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await response.json();
      if (!response.ok) {
        setOk(false);
        setMessage(body.message ?? "Could not create client.");
        return;
      }
      setEmail("");
      setOk(true);
      setMessage("Client added.");
      loadClients();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-10">
      <header className="reveal flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <span className="gradient-text">Clients</span>
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-muted">
            Client records connect meetings with email addresses.
          </p>
        </div>
        <p className="surface rounded-xl px-4 py-2 text-xs uppercase tracking-wider text-faint">
          {loading ? "—" : clients.length}{" "}
          {clients.length === 1 ? "client" : "clients"}
        </p>
      </header>

      <form
        onSubmit={createClient}
        style={{ "--d": "80ms" } as React.CSSProperties}
        className="surface edge-glow reveal rounded-2xl p-6"
      >
        <label
          htmlFor="client-email"
          className="text-xs font-semibold uppercase tracking-wider text-faint"
        >
          Add a client
        </label>
        <div className="mt-3 flex flex-wrap gap-3 sm:flex-nowrap">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
              <MailIcon />
            </span>
            <input
              id="client-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="client@example.com"
              className="field !pl-10"
            />
          </div>
          <button disabled={saving} className="btn btn-primary">
            {saving ? <span className="spinner" /> : <PlusIcon />}
            {saving ? "Adding..." : "Add client"}
          </button>
        </div>

        {message && (
          <p
            className={`reveal-x mt-4 flex items-center gap-2 text-sm ${
              ok ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {ok ? <CheckIcon /> : <AlertIcon />}
            {message}
          </p>
        )}
      </form>

      <div
        style={{ "--d": "160ms" } as React.CSSProperties}
        className="surface reveal divide-y divide-[rgb(var(--border))] overflow-hidden rounded-2xl"
      >
        {loading &&
          [0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-3 p-4">
              <div className="skeleton size-9 !rounded-full" />
              <div className="skeleton h-3 w-48" />
            </div>
          ))}

        {!loading &&
          clients.map((client, index) => (
            <div
              key={client._id}
              style={{ "--d": `${Math.min(index, 10) * 55}ms` } as React.CSSProperties}
              className="reveal-x group flex items-center gap-3 p-4 transition-colors duration-300 hover:bg-[rgb(var(--accent-glow)/0.06)]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[rgb(var(--accent-glow)/0.25)] bg-[rgb(var(--accent-glow)/0.1)] text-xs font-semibold text-accent transition-transform duration-500 group-hover:scale-110">
                {client.email.slice(0, 2).toUpperCase()}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm">{client.email}</p>
              <span className="text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <MailIcon />
              </span>
            </div>
          ))}

        {!loading && clients.length === 0 && (
          <div className="grid place-items-center gap-3 px-6 py-14 text-center">
            <span className="bob grid size-14 place-items-center rounded-2xl border border-[rgb(var(--accent-glow)/0.25)] bg-[rgb(var(--accent-glow)/0.08)] text-accent">
              <MailIcon large />
            </span>
            <p className="text-sm font-semibold">No clients yet</p>
            <p className="text-sm text-muted">
              Add an email above to start attaching meetings to it.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function MailIcon({ large }: { large?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={large ? "size-6" : "size-4"}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m4 8 7.1 4.8a1.6 1.6 0 0 0 1.8 0L20 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
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
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

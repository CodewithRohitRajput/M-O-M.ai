"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type User = {
  _id: string;
  name: string;
  email: string;
  picture?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Loading profile...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/me`, {
      credentials: "include",
    })
      .then(async (response) => {
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.message ?? "Could not load profile.");
        }

        const profile = body.user ?? body.data;

        if (!profile) {
          throw new Error("Profile data was not returned.");
        }

        setUser(profile);
        setMessage("");
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error ? error.message : "Could not load profile.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-xl space-y-7">
        <div className="skeleton h-10 w-44" />
        <div className="surface reveal rounded-2xl p-7">
          <div className="flex items-center gap-5">
            <div className="skeleton size-20 !rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-56" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="reveal mx-auto max-w-md space-y-5 py-14 text-center">
        <span className="bob mx-auto grid size-16 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500">
          <LockIcon />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile unavailable
          </h1>
          <p className="text-sm text-muted">{message}</p>
        </div>
        <Link href="/connect" className="btn btn-primary">
          Sign in with Google
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl space-y-8">
      <header className="reveal space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-[15px] text-muted">
          The Google account meeting notes are saved under.
        </p>
      </header>

      <div
        style={{ "--d": "90ms" } as React.CSSProperties}
        className="surface lift edge-glow reveal overflow-hidden rounded-2xl"
      >
        {/* Colour banner so the avatar has something to sit against. */}
        <div className="h-24 bg-gradient-to-r from-indigo-500/70 via-violet-500/70 to-fuchsia-500/70" />

        <div className="-mt-11 space-y-5 p-7">
          {user.picture ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.picture}
              alt={user.name}
              className="reveal-pop size-20 rounded-full border-4 border-[var(--bg-elevated)] object-cover shadow-lg"
            />
          ) : (
            <span className="reveal-pop grid size-20 place-items-center rounded-full border-4 border-[var(--bg-elevated)] bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-semibold text-white shadow-lg">
              {user.name?.slice(0, 1).toUpperCase() ?? "?"}
            </span>
          )}

          <div className="space-y-1.5">
            <p className="text-2xl font-semibold tracking-tight">{user.name}</p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <MailIcon />
              {user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[rgb(var(--border))] pt-5 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-500">
              <span className="dot-live" />
              Google connected
            </span>
            <span className="rounded-full border border-[rgb(var(--border-strong))] px-2.5 py-1 font-mono text-faint">
              {user._id?.slice(-6)}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{ "--d": "170ms" } as React.CSSProperties}
        className="reveal flex flex-wrap gap-3"
      >
        <Link href="/upload" className="btn btn-primary">
          New meeting
        </Link>
        <Link href="/clients" className="btn btn-ghost">
          Manage clients
        </Link>
      </div>
    </section>
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
      <rect x="4.5" y="10" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

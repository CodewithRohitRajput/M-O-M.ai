const PERKS = [
  "Notes saved straight to Google Docs",
  "Summaries, decisions, risks and action items",
  "Every call linked back to the right client",
];

export default function ConnectPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  return (
    <section className="mx-auto max-w-md py-10">
      <div className="surface edge-glow reveal relative overflow-hidden rounded-3xl p-8 text-center sm:p-10">
        {/* Soft halo behind the mark, clipped by the card. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/35 via-violet-500/25 to-fuchsia-500/20 blur-3xl"
        />

        <div className="relative space-y-7">
          <span className="bob mx-auto grid size-16 place-items-center rounded-2xl bg-white shadow-[0_16px_40px_-16px_rgb(99_102_241/0.8)] ring-1 ring-zinc-200">
            <GoogleLogo />
          </span>

          <div className="space-y-2.5">
            <h1 className="text-3xl font-semibold tracking-tight">
              Sign in with <span className="gradient-text">Google</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted">
              Connect your Google account so meeting notes can be saved to
              Google Docs.
            </p>
          </div>

          <ul className="space-y-2.5 text-left">
            {PERKS.map((perk, index) => (
              <li
                key={perk}
                style={{ "--d": `${140 + index * 80}ms` } as React.CSSProperties}
                className="reveal-x flex items-start gap-2.5 text-sm text-muted"
              >
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[rgb(var(--accent-glow)/0.15)] text-accent">
                  <CheckIcon />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <a
            href={`${API}/auth/google`}
            className="btn btn-primary w-full !py-3.5"
          >
            <GoogleLogo small />
            Continue with Google
          </a>

          <p className="text-xs text-faint">
            You will be redirected to Google to authorize access.
          </p>
        </div>
      </div>
    </section>
  );
}

function GoogleLogo({ small }: { small?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={small ? "size-4" : "size-8"}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M45 24c0-1.6-.1-2.7-.4-4H24v8h11.9c-.5 2.9-2.2 5.4-4.7 7l6.6 5.1C41.7 36.4 45 30.9 45 24Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.6-5.1c-2 1.3-4.6 2.1-7.9 2.1-6.1 0-11.2-4.1-13.1-9.6l-6.9 5.3C7.6 41 15.2 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M10.9 28.1a13.9 13.9 0 0 1 0-8.9l-6.9-5.3a22 22 0 0 0 0 19.5l6.9-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.4c3.4 0 6.5 1.2 8.9 3.5l5.9-5.9C35 4.6 30 2 24 2 15.2 2 7.6 7 4 14l6.9 5.3C12.8 13.8 17.9 10.4 24 10.4Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3" aria-hidden="true">
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

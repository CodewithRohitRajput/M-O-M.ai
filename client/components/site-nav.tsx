'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '/', label: 'Meetings' },
  { href: '/clients', label: 'Clients' },
  { href: '/upload', label: 'New meeting' },
  { href: '/profile', label: 'Profile' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  /* The bar tightens and deepens its blur once the page moves. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`border-b transition-all duration-500 ${
          scrolled
            ? 'border-[rgb(var(--border))] bg-[rgb(var(--surface)/0.82)] shadow-[0_8px_32px_-24px_rgb(0_0_0/0.5)] backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-[rgb(var(--surface)/0.35)] backdrop-blur-md'
        }`}
      >
        <div
          className={`mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 transition-all duration-500 ${
            scrolled ? 'py-3' : 'py-4'
          }`}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_8px_20px_-8px_rgb(99_102_241/0.9)] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              <span className="eq flex h-3.5 items-end gap-[3px] text-white">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </span>
            <span className="text-base font-semibold tracking-tight">
              mom<span className="gradient-text">.ai</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-active={isActive(link.href)}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/connect" className="btn btn-primary !px-4 !py-2">
              <GoogleMark />
              Google Login
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="btn btn-ghost !px-2.5 !py-2 md:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 h-[1.5px] w-5 rounded bg-current transition-all duration-300 ${
                  open ? 'top-[7px] rotate-45' : 'top-0.5'
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-[1.5px] w-5 rounded bg-current transition-all duration-300 ${
                  open ? 'scale-x-0 opacity-0' : ''
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-5 rounded bg-current transition-all duration-300 ${
                  open ? 'top-[7px] -rotate-45' : 'top-[13.5px]'
                }`}
              />
            </span>
          </button>
        </div>

        {/* Mobile sheet: animates its own height so nothing jumps. */}
        <div
          className={`overflow-hidden border-t border-[rgb(var(--border))] transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
            open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-6 py-4 text-sm">
            {LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{ '--d': `${index * 45}ms` } as React.CSSProperties}
                className={`reveal-x rounded-lg px-3 py-2.5 transition-colors ${
                  isActive(link.href)
                    ? 'bg-[rgb(var(--accent-glow)/0.12)] font-semibold text-accent'
                    : 'text-muted hover:bg-[rgb(var(--accent-glow)/0.08)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/connect"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-2"
            >
              <GoogleMark />
              Google Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#fff"
        d="M12 10.2v3.9h5.4a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2.1H12Z"
      />
      <path
        fill="#fff"
        opacity=".75"
        d="M6.6 13.9l-.5.4-1.8 1.4A8 8 0 0 0 12 20a8 8 0 0 0 6.6-3.1l-3.2-2.5A5 5 0 0 1 6.6 14Z"
      />
      <path
        fill="#fff"
        opacity=".55"
        d="M4.3 8.3A8 8 0 0 0 4.3 15.7l2.9-2.3a4.8 4.8 0 0 1 0-3.1Z"
      />
      <path
        fill="#fff"
        opacity=".9"
        d="M12 7.4a4.4 4.4 0 0 1 3 1.2l2.6-2.6A8 8 0 0 0 4.3 8.3l2.9 2.3A4.8 4.8 0 0 1 12 7.4Z"
      />
    </svg>
  )
}

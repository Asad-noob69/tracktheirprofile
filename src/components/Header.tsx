"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogoMark from "@/components/BrandLogoMark";

interface AuthUser {
  userId: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
}

export default function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    setMobileNavOpen(false);
    window.location.href = "/";
  };

  const shellStyle = {
    width: isCompact ? "calc(100% - 1rem)" : "100%",
    maxWidth: isCompact ? "64rem" : "100%",
    marginTop: isCompact ? "0.5rem" : "0rem",
    borderRadius: isCompact ? "1rem" : "0rem",
    boxShadow: isCompact
      ? "0 8px 30px rgba(0,0,0,0.35)"
      : "0 0 0 rgba(0,0,0,0)",
    transition:
      "width 620ms cubic-bezier(0.22,1,0.36,1), max-width 620ms cubic-bezier(0.22,1,0.36,1), margin-top 560ms cubic-bezier(0.22,1,0.36,1), border-radius 560ms cubic-bezier(0.22,1,0.36,1), box-shadow 560ms ease",
    willChange: "width, max-width, margin-top, border-radius, box-shadow",
  } as const;

  const barStyle = {
    height: isCompact ? "3.5rem" : "4rem",
    maxWidth: isCompact ? "100%" : "72rem",
    transition:
      "height 560ms cubic-bezier(0.22,1,0.36,1), max-width 620ms cubic-bezier(0.22,1,0.36,1)",
    willChange: "height, max-width",
  } as const;

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto border border-card-border bg-background/85 backdrop-blur-md" style={shellStyle}>
        <div className="mx-auto flex items-center justify-between px-4 sm:px-6" style={barStyle}>
          <Link href="/" className="flex items-center gap-2">
            <BrandLogoMark className="h-8 w-8 rounded-lg" iconClassName="h-5 w-5 text-black" />
            <span className="text-base font-bold text-foreground sm:text-lg">
              Track<span className="text-green-accent">Their</span>Profile
            </span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <div
              className={`flex items-center gap-4 overflow-hidden transition-[max-width,opacity] duration-500 ease-out ${
                isCompact ? "max-w-0 opacity-0" : "max-w-sm opacity-100"
              }`}
            >
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="whitespace-nowrap text-sm text-zinc-400 transition-colors hover:text-green-accent"
              >
                Home
              </Link>
              <Link
                href="/#features"
                onClick={() => setMenuOpen(false)}
                className="whitespace-nowrap text-sm text-zinc-400 transition-colors hover:text-green-accent"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMenuOpen(false)}
                className="whitespace-nowrap text-sm text-zinc-400 transition-colors hover:text-green-accent"
              >
                Pricing
              </Link>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-sm transition-colors hover:border-green-accent/30"
                >
                  <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-green-accent text-xs font-bold text-black">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <span className="text-zinc-300">{user.username}</span>
                  <svg
                    className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-card-border bg-card-bg py-1 shadow-xl">
                    <div className="border-b border-card-border px-4 py-2.5">
                      <p className="text-sm font-medium text-foreground">{user.username}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <Link
                      href="/history"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-green-accent/5 hover:text-green-accent"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Search History
                    </Link>
                    <div className="border-t border-card-border">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-red-500/5 hover:text-red-400"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="rounded-lg border border-card-border px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-green-accent/30 hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-green-accent px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-[#00e68d]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-card-bg text-zinc-300 transition-colors hover:border-green-accent/30 hover:text-green-accent md:hidden"
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-card-border md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-green-accent/5 hover:text-green-accent"
              >
                Home
              </Link>
              <Link
                href="/#features"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-green-accent/5 hover:text-green-accent"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-green-accent/5 hover:text-green-accent"
              >
                Pricing
              </Link>

              {user ? (
                <>
                  <div className="mt-2 rounded-xl border border-card-border bg-card-bg px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{user.username}</p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <Link
                    href="/history"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-green-accent/5 hover:text-green-accent"
                  >
                    Search History
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/signin"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-lg border border-card-border px-3 py-2 text-center text-sm text-zinc-300 transition-colors hover:border-green-accent/30 hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-lg bg-green-accent px-3 py-2 text-center text-sm font-semibold text-black transition-colors hover:bg-[#00e68d]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

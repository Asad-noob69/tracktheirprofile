"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import RedditPostCard from "@/components/RedditPostCard";
import RedditCommentCard from "@/components/RedditCommentCard";
import Pagination from "@/components/Pagination";
import { RedditPost, RedditComment } from "@/lib/reddit";

interface SearchResult {
  username: string;
  postCount: number;
  commentCount: number;
  posts: RedditPost[];
  comments: RedditComment[];
  creditsRemaining: number;
  canSeeAll: boolean;
  fromCache?: boolean;
}

interface CreditInfo {
  credits: number;
  isLoggedIn: boolean;
  isPaid: boolean;
}

const SEARCH_STAGES = [
  "Gathering Reddit discussions across all sort orders...",
  "Scanning archive for historical community data...",
  "Searching community discussions with multiple strategies...",
  "Extracting comments from relevant threads...",
  "Merging and deduplicating results...",
];

const FREE_PREVIEW_COUNT = 10;
const RESULTS_PER_PAGE = 20;

const BLOCKED_USERNAMES = new Set(["jumpy_paramedic2552", "no-tiger7949"]);

function PaywallOverlay() {
  return (
    <div className="relative mt-4">
      {/* Blurred ghost cards — 5 cards mimicking real posts */}
      <div className="space-y-4 select-none" aria-hidden="true">
        {[
          { w1: "w-28", w2: "w-3/4", w3: "w-full", w4: "w-5/6" },
          { w1: "w-24", w2: "w-2/3", w3: "w-11/12", w4: "w-4/5" },
          { w1: "w-32", w2: "w-4/5", w3: "w-full", w4: "w-3/4" },
          { w1: "w-20", w2: "w-3/5", w3: "w-10/12", w4: "w-full" },
          { w1: "w-28", w2: "w-2/4", w3: "w-full", w4: "w-5/6" },
        ].map((widths, i) => (
          <div
            key={i}
            className="rounded-xl border border-card-border bg-card-bg p-5 blur-sm"
          >
            {/* Header row */}
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-5 ${widths.w1} rounded-md bg-green-accent/10`} />
              <div className="h-4 w-1 rounded bg-zinc-800" />
              <div className="h-4 w-20 rounded bg-zinc-800" />
              <div className="h-4 w-1 rounded bg-zinc-800" />
              <div className="h-4 w-14 rounded bg-zinc-800" />
            </div>
            {/* Title */}
            <div className={`mb-2 h-5 ${widths.w2} rounded bg-zinc-700`} />
            {/* Body */}
            <div className="mb-1 space-y-1.5">
              <div className={`h-3.5 ${widths.w3} rounded bg-zinc-800`} />
              <div className={`h-3.5 ${widths.w4} rounded bg-zinc-800`} />
            </div>
            {/* Footer */}
            <div className="mt-4 flex items-center gap-4">
              <div className="h-3.5 w-12 rounded bg-zinc-800" />
              <div className="h-3.5 w-16 rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Lock overlay — centered over the blurred cards */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-card-border bg-background/90 px-8 py-7 shadow-2xl backdrop-blur-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-accent/10 ring-8 ring-green-accent/5">
            <svg
              className="h-7 w-7 text-green-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              Unlock Full Results
            </p>
            <p className="mt-1 max-w-xs text-sm text-zinc-400">
              You&apos;ve seen the first 10 results. Upgrade to{" "}
              <span className="font-semibold text-green-accent">Lifetime Pro</span>{" "}
              for just <span className="font-semibold text-green-accent">$5</span>{" "}
              to view every post &amp; comment.
            </p>
          </div>
          <a
            href="/api/checkout"
            className="mt-1 rounded-lg bg-green-accent px-7 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#00e68d] hover:shadow-[0_0_20px_rgba(0, 255, 157,0.3)]"
          >
            Upgrade to Pro — $5
          </a>
          <p className="text-xs text-zinc-600">One-time payment. No subscription. <a href="/refund-policy" className="text-zinc-500 hover:text-green-accent">Refund policy</a></p>
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
  const isBlocked = BLOCKED_USERNAMES.has(username.trim().toLowerCase());

  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [stageIdx, setStageIdx] = useState(0);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);

  // Fetch credit info on mount
  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => setCreditInfo(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!username) return;
    if (isBlocked) return;

    const controller = new AbortController();
    let stageTimer: ReturnType<typeof setInterval> | null = null;

    async function fetchResults() {
      setLoading(true);
      setError(null);
      setResults(null);
      setActiveTab("posts");
      setStageIdx(0);
      setPostsPage(1);
      setCommentsPage(1);

      stageTimer = setInterval(() => {
        setStageIdx((i) => (i + 1) % SEARCH_STAGES.length);
      }, 3500);

      // Abort after 90 seconds if search hangs
      const timeout = setTimeout(() => controller.abort(), 90_000);

      try {
        const res = await fetch(
          `/api/search?username=${encodeURIComponent(username)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Search failed");
        }

        const data: SearchResult = await res.json();
        setResults(data);

        // Refresh credits after search
        fetch("/api/credits")
          .then((r) => r.json())
          .then((d) => setCreditInfo(d))
          .catch(() => {});
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            setError("Search timed out. The user may have too much activity — please try again.");
          } else {
            setError(err.message || "Something went wrong");
          }
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
        if (stageTimer) clearInterval(stageTimer);
      }
    }

    fetchResults();

    return () => {
      controller.abort();
      if (stageTimer) clearInterval(stageTimer);
    };
  }, [username, isBlocked]);

  const canSeeAll = results?.canSeeAll ?? false;

  function exportToCSV(data: SearchResult) {
    const rows = [["Type", "Subreddit", "Title/Body", "Score", "Date", "URL"]];
    data.posts.forEach((p) => {
      rows.push(["Post", p.subreddit_name_prefixed, `"${p.title.replace(/"/g, '""')}"`, String(p.score), new Date(p.created_utc * 1000).toISOString(), p.permalink]);
    });
    data.comments.forEach((c) => {
      rows.push(["Comment", c.subreddit_name_prefixed, `"${c.body.slice(0, 200).replace(/"/g, '""')}"`, String(c.score), new Date(c.created_utc * 1000).toISOString(), c.permalink]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reddit_${data.username}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      {/* Search bar at top */}
      <div className="mb-3 flex justify-center">
        <SearchBar initialValue={username} size="small" />
      </div>

      {/* Credits indicator */}
      {creditInfo && (
        <div className="mb-8 flex justify-center">
          {creditInfo.isPaid ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-accent/10 px-3 py-1 text-xs font-medium text-green-accent border border-green-accent/20">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited Searches
            </span>
          ) : (
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 border border-zinc-700">
                <svg className="h-3 w-3 text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {creditInfo.credits} search{creditInfo.credits !== 1 ? "es" : ""} remaining
              </span>
              {!creditInfo.isLoggedIn && (
                <p className="mt-1.5 text-xs text-zinc-500">
                  <Link href="/signup" className="text-green-accent hover:underline">Sign up</Link> to get 15 more free credits
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Blocked username */}
      {isBlocked && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-accent/10">
            <svg className="h-6 w-6 text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-center text-lg font-semibold text-foreground">
            Why are you trying to stalk the admin, huh?
          </p>
        </div>
      )}

      {/* Loading state */}
      {!isBlocked && loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-5 w-5 text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-green-accent tracking-wide uppercase mb-2">
            Researching Topic
          </p>
          <p className="mb-1 text-center text-base font-medium text-foreground">
            Gathering community data for{" "}
            <span className="text-green-accent">u/{username}</span>
          </p>
          <p className="mt-2 min-h-[1.25rem] text-center text-xs text-zinc-500 transition-all duration-700">
            {SEARCH_STAGES[stageIdx]}
          </p>
          <p className="mt-3 text-center text-xs text-zinc-600">
            Checking multiple public sources — this usually takes 10–30 seconds.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold text-foreground">
            {error.includes("credit") ? "No Credits Left" : "Search Failed"}
          </p>
          <p className="text-center text-zinc-400">{error}</p>
          {error.includes("Sign up") && (
            <Link href="/signup" className="mt-4 rounded-lg bg-green-accent px-5 py-2 text-sm font-bold text-black hover:bg-[#00e68d]">
              Sign Up Free
            </Link>
          )}
          {error.includes("Upgrade") && (
            <a href="/api/checkout" className="mt-4 rounded-lg bg-green-accent px-5 py-2 text-sm font-bold text-black hover:bg-[#00e68d]">
              Pay $5 — Upgrade to Pro
            </a>
          )}
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  Results for{" "}
                  <span className="text-green-accent">u/{results.username}</span>
                </h1>
                {results.fromCache && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-accent/10 px-2 py-0.5 text-xs font-medium text-green-accent border border-green-accent/20">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Instant
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Found {results.postCount} post{results.postCount !== 1 ? "s" : ""} and{" "}
                {results.commentCount} comment{results.commentCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => exportToCSV(results)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-green-accent/30 hover:text-green-accent sm:w-auto"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg border border-card-border bg-card-bg p-1">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 rounded-md px-2 py-2.5 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                activeTab === "posts"
                  ? "bg-green-accent text-black shadow-sm"
                  : "text-zinc-400 hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Posts ({results.postCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`flex-1 rounded-md px-2 py-2.5 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                activeTab === "comments"
                  ? "bg-green-accent text-black shadow-sm"
                  : "text-zinc-400 hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments ({results.commentCount})
              </span>
            </button>
          </div>

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <>
              {results.posts.length === 0 ? (
                <EmptyState
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />}
                  title="No posts found"
                  subtitle="This user may not exist or has no public posts."
                />
              ) : (() => {
                  const showPaywall = !canSeeAll && results.postCount > FREE_PREVIEW_COUNT;
                  const visiblePosts = showPaywall ? results.posts.slice(0, FREE_PREVIEW_COUNT) : results.posts;
                  const totalPages = Math.max(1, Math.ceil(visiblePosts.length / RESULTS_PER_PAGE));
                  const safePage = Math.min(postsPage, totalPages);
                  const start = (safePage - 1) * RESULTS_PER_PAGE;
                  const pagePosts = visiblePosts.slice(start, start + RESULTS_PER_PAGE);
                  const showPagination = !showPaywall && totalPages > 1;
                  return (
                    <>
                      {showPagination && (
                        <p className="mb-3 text-xs text-zinc-500">
                          Showing {start + 1}–{Math.min(start + RESULTS_PER_PAGE, visiblePosts.length)} of {visiblePosts.length}
                        </p>
                      )}
                      <div className="space-y-4">
                        {pagePosts.map((post, i) => (
                          <div key={post.id} style={{ animationDelay: `${Math.min(i, 20) * 50}ms` }}>
                            <RedditPostCard post={post} />
                          </div>
                        ))}
                      </div>
                      {showPagination && (
                        <Pagination
                          page={safePage}
                          totalPages={totalPages}
                          onPageChange={(p) => {
                            setPostsPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="mt-6"
                        />
                      )}
                      {showPaywall && <PaywallOverlay />}
                    </>
                  );
                })()}
            </>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <>
              {results.comments.length === 0 ? (
                <EmptyState
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
                  title="No comments found"
                  subtitle="This user may not have any public comments."
                />
              ) : (() => {
                  const showPaywall = !canSeeAll && results.commentCount > FREE_PREVIEW_COUNT;
                  const visibleComments = showPaywall ? results.comments.slice(0, FREE_PREVIEW_COUNT) : results.comments;
                  const totalPages = Math.max(1, Math.ceil(visibleComments.length / RESULTS_PER_PAGE));
                  const safePage = Math.min(commentsPage, totalPages);
                  const start = (safePage - 1) * RESULTS_PER_PAGE;
                  const pageComments = visibleComments.slice(start, start + RESULTS_PER_PAGE);
                  const showPagination = !showPaywall && totalPages > 1;
                  return (
                    <>
                      {showPagination && (
                        <p className="mb-3 text-xs text-zinc-500">
                          Showing {start + 1}–{Math.min(start + RESULTS_PER_PAGE, visibleComments.length)} of {visibleComments.length}
                        </p>
                      )}
                      <div className="space-y-4">
                        {pageComments.map((comment, i) => (
                          <div key={comment.id} style={{ animationDelay: `${Math.min(i, 20) * 50}ms` }}>
                            <RedditCommentCard comment={comment} />
                          </div>
                        ))}
                      </div>
                      {showPagination && (
                        <Pagination
                          page={safePage}
                          totalPages={totalPages}
                          onPageChange={(p) => {
                            setCommentsPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="mt-6"
                        />
                      )}
                      {showPaywall && <PaywallOverlay />}
                    </>
                  );
                })()}
            </>
          )}
        </>
      )}

      {/* Empty state - no search yet */}
      {!username && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-center text-lg text-zinc-400">
            Enter a Reddit username above to get started.
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
      </div>
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}

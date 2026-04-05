"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import RedditPostCard from "@/components/RedditPostCard";
import RedditCommentCard from "@/components/RedditCommentCard";
import { RedditPost, RedditComment } from "@/lib/reddit";

interface SearchResult {
  username: string;
  postCount: number;
  commentCount: number;
  posts: RedditPost[];
  comments: RedditComment[];
  creditsRemaining: number;
  canSeeAll: boolean;
}

interface CreditInfo {
  credits: number;
  isLoggedIn: boolean;
  isPaid: boolean;
}

const SEARCH_STAGES = [
  "Fetching Reddit activity across all sort orders...",
  "Scanning Arctic Shift archive for historical data...",
  "Searching Reddit with multiple strategies...",
  "Extracting comments from post threads...",
  "Merging and deduplicating results...",
];

const FREE_PREVIEW_COUNT = 10;

function PaywallOverlay() {
  return (
    <div className="relative mt-4">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-card-border bg-card-bg px-8 py-6 shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-accent/10">
            <svg className="h-6 w-6 text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-foreground">Unlock Full Results</p>
          <p className="text-sm text-zinc-400 text-center max-w-xs">
            Pay <span className="text-green-accent font-semibold">$5</span> to unlock all posts and comments for every search.
          </p>
          <button className="mt-2 rounded-lg bg-green-accent px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-green-400">
            Pay $5 to Unlock
          </button>
        </div>
      </div>
      {/* Blurred placeholder cards */}
      <div className="space-y-4 pointer-events-none select-none blur-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-card-border bg-card-bg p-5 h-32" />
        ))}
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [stageIdx, setStageIdx] = useState(0);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);

  // Fetch credit info on mount
  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => setCreditInfo(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();
    let stageTimer: ReturnType<typeof setInterval> | null = null;

    async function fetchResults() {
      setLoading(true);
      setError(null);
      setResults(null);
      setActiveTab("posts");
      setStageIdx(0);

      stageTimer = setInterval(() => {
        setStageIdx((i) => (i + 1) % SEARCH_STAGES.length);
      }, 3500);

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
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
        if (stageTimer) clearInterval(stageTimer);
      }
    }

    fetchResults();

    return () => {
      controller.abort();
      if (stageTimer) clearInterval(stageTimer);
    };
  }, [username]);

  const canSeeAll = results?.canSeeAll ?? false;

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

      {/* Loading state */}
      {loading && (
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
            Deep Search Active
          </p>
          <p className="text-base text-foreground font-medium mb-1">
            Searching everywhere for{" "}
            <span className="text-green-accent">u/{username}</span>
          </p>
          <p className="mt-2 text-xs text-zinc-500 transition-all duration-700 min-h-[1.25rem]">
            {SEARCH_STAGES[stageIdx]}
          </p>
          <p className="mt-3 text-xs text-zinc-600">
            Checking 6+ sources — this usually takes 10–30 seconds.
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
          <p className="text-zinc-400">{error}</p>
          {error.includes("Sign up") && (
            <Link href="/signup" className="mt-4 rounded-lg bg-green-accent px-5 py-2 text-sm font-bold text-black hover:bg-green-400">
              Sign Up Free
            </Link>
          )}
          {error.includes("Upgrade") && (
            <button className="mt-4 rounded-lg bg-green-accent px-5 py-2 text-sm font-bold text-black hover:bg-green-400">
              Pay $5 to Unlock
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Results for{" "}
              <span className="text-green-accent">u/{results.username}</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Found {results.postCount} post{results.postCount !== 1 ? "s" : ""} and{" "}
              {results.commentCount} comment{results.commentCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg border border-card-border bg-card-bg p-1">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "posts"
                  ? "bg-green-accent text-black shadow-sm"
                  : "text-zinc-400 hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Posts ({results.postCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "comments"
                  ? "bg-green-accent text-black shadow-sm"
                  : "text-zinc-400 hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              ) : (
                <>
                  <div className="space-y-4">
                    {results.posts.slice(0, canSeeAll ? results.posts.length : FREE_PREVIEW_COUNT).map((post, i) => (
                      <div key={post.id} style={{ animationDelay: `${Math.min(i, 20) * 50}ms` }}>
                        <RedditPostCard post={post} />
                      </div>
                    ))}
                  </div>
                  {!canSeeAll && results.posts.length > FREE_PREVIEW_COUNT && <PaywallOverlay />}
                </>
              )}
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
              ) : (
                <>
                  <div className="space-y-4">
                    {results.comments.slice(0, canSeeAll ? results.comments.length : FREE_PREVIEW_COUNT).map((comment, i) => (
                      <div key={comment.id} style={{ animationDelay: `${Math.min(i, 20) * 50}ms` }}>
                        <RedditCommentCard comment={comment} />
                      </div>
                    ))}
                  </div>
                  {!canSeeAll && results.comments.length > FREE_PREVIEW_COUNT && <PaywallOverlay />}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Empty state - no search yet */}
      {!username && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-zinc-400">
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

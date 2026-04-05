"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
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
}

function SearchContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");

  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();

    async function fetchResults() {
      setLoading(true);
      setError(null);
      setResults(null);
      setActiveTab("posts");

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
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchResults();

    return () => controller.abort();
  }, [username]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      {/* Search bar at top */}
      <div className="mb-8 flex justify-center">
        <SearchBar initialValue={username} size="small" />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
          <p className="text-zinc-400">
            Searching Reddit for{" "}
            <span className="font-semibold text-green-accent">
              u/{username}
            </span>
            ...
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Fetching posts and comments across multiple pages
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold text-foreground">
            Search Failed
          </p>
          <p className="text-zinc-400">{error}</p>
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
              Found {results.postCount} post
              {results.postCount !== 1 ? "s" : ""} and{" "}
              {results.commentCount} comment
              {results.commentCount !== 1 ? "s" : ""}
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
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
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
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
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
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  }
                  title="No posts found"
                  subtitle="This user may not exist or has no public posts."
                />
              ) : (
                <div className="space-y-4">
                  {results.posts.map((post, i) => (
                    <div
                      key={post.id}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <RedditPostCard post={post} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <>
              {results.comments.length === 0 ? (
                <EmptyState
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  }
                  title="No comments found"
                  subtitle="This user may not have any public comments."
                />
              ) : (
                <div className="space-y-4">
                  {results.comments.map((comment, i) => (
                    <div
                      key={comment.id}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <RedditCommentCard comment={comment} />
                    </div>
                  ))}
                </div>
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

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        <svg
          className="h-6 w-6 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {icon}
        </svg>
      </div>
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface SearchLog {
  id: string;
  searchedUsername: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  username: string;
  role: string;
  isPaid: boolean;
  searchCredits: number;
  createdAt: string;
  searchLogs: SearchLog[];
}

export default function AdminUserDetail() {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user || meData.user.role !== "admin") {
          router.push("/");
          return;
        }

        const res = await fetch(`/api/admin/users/${userId}`);
        if (!res.ok) { setError("User not found"); return; }

        const data = await res.json();
        setUser(data.user);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router, userId]);

  async function togglePaid() {
    if (!user) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !user.isPaid }),
    });
    setUser({ ...user, isPaid: !user.isPaid });
  }

  async function resetCredits() {
    if (!user) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchCredits: 20 }),
    });
    setUser({ ...user, searchCredits: 20 });
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-400">{error || "User not found"}</p>
      </div>
    );
  }

  const uniqueSearched = [...new Set(user.searchLogs.map((s) => s.searchedUsername))];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-green-accent">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* User Header */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-card-border bg-card-bg p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-accent text-xl font-bold text-black">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{user.username}</h1>
            <p className="break-all text-sm text-zinc-400">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-400"}`}>
                {user.role}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.isPaid ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-800 text-zinc-400"}`}>
                {user.isPaid ? "Paid" : "Free"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <button
            onClick={togglePaid}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${user.isPaid ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"}`}
          >
            {user.isPaid ? "Revoke Paid" : "Make Paid"}
          </button>
          {!user.isPaid && user.role !== "admin" && (
            <button
              onClick={resetCredits}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
            >
              Reset Credits
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Total Searches</p>
          <p className="text-xl font-bold text-green-accent sm:text-2xl">{user.searchLogs.length}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Credits Left</p>
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {user.isPaid || user.role === "admin" ? "∞" : user.searchCredits}
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Unique Usernames</p>
          <p className="text-xl font-bold text-foreground sm:text-2xl">{uniqueSearched.length}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Joined</p>
          <p className="text-lg font-bold text-foreground">
            {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Usernames Searched */}
      {uniqueSearched.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">Usernames Searched</h2>
          <div className="flex flex-wrap gap-2">
            {uniqueSearched.map((u) => (
              <span key={u} className="rounded-lg bg-green-accent/10 px-3 py-1 text-sm font-medium text-green-accent border border-green-accent/20">
                u/{u}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-foreground">Search History</h2>
        <div className="overflow-hidden rounded-xl border border-card-border">
          <table className="hidden w-full sm:table">
            <thead>
              <tr className="border-b border-card-border bg-card-bg">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Posts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Comments</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {user.searchLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-card-bg">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-green-accent">u/{log.searchedUsername}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">{log.postCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">{log.commentCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-500">
                    {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {user.searchLogs.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No searches yet.</td></tr>
              )}
            </tbody>
          </table>
          <div className="divide-y divide-card-border sm:hidden">
            {user.searchLogs.map((log) => (
              <div key={log.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-green-accent">u/{log.searchedUsername}</span>
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {log.postCount} posts, {log.commentCount} comments
                </p>
              </div>
            ))}
            {user.searchLogs.length === 0 && (
              <p className="px-4 py-8 text-center text-zinc-500">No searches yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

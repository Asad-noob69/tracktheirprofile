"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isPaid: boolean;
  searchCredits: number;
  createdAt: string;
  searchCount: number;
}

interface RecentSearch {
  id: string;
  searchedUsername: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
  performedBy: string;
}

interface Stats {
  totalUsers: number;
  paidUsers: number;
  totalSearches: number;
  searchesToday: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user || meData.user.role !== "admin") {
          router.push("/");
          return;
        }

        const res = await fetch("/api/admin/users");
        if (!res.ok) { setError("Failed to load data"); return; }

        const data = await res.json();
        setUsers(data.users);
        setStats(data.stats);
        setRecentSearches(data.recentSearches);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  async function togglePaid(userId: string, isPaid: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !isPaid }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isPaid: !isPaid } : u));
  }

  async function resetCredits(userId: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchCredits: 20 }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, searchCredits: 20 } : u));
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Admin <span className="text-green-accent">Dashboard</span>
        </h1>
        <p className="mt-1 text-zinc-400">Overview of users, searches, and activity</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers} accent />
          <StatCard label="Paid Users" value={stats.paidUsers} />
          <StatCard label="Total Searches" value={stats.totalSearches} accent />
          <StatCard label="Searches Today" value={stats.searchesToday} />
        </div>
      )}

      {/* Recent Searches */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Recent Searches</h2>
        <div className="overflow-hidden rounded-xl border border-card-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border bg-card-bg">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Searched</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Posts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Comments</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {recentSearches.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-card-bg">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-green-accent">u/{s.searchedUsername}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-300">{s.performedBy}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">{s.postCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">{s.commentCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-500">
                    {new Date(s.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {recentSearches.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No searches yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">All Users</h2>
        <div className="overflow-hidden rounded-xl border border-card-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border bg-card-bg">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Credits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Searches</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-card-bg">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className="font-medium text-foreground hover:text-green-accent">
                      {user.username}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">{user.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-400"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.isPaid ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-800 text-zinc-400"}`}>
                      {user.isPaid ? "Paid" : "Free"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                    {user.isPaid || user.role === "admin" ? "∞" : user.searchCredits}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">{user.searchCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePaid(user.id, user.isPaid)}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${user.isPaid ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"}`}
                      >
                        {user.isPaid ? "Revoke Paid" : "Make Paid"}
                      </button>
                      {!user.isPaid && user.role !== "admin" && (
                        <button
                          onClick={() => resetCredits(user.id)}
                          className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700"
                        >
                          Reset Credits
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="px-6 py-12 text-center text-zinc-500">No users registered yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-green-accent" : "text-foreground"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

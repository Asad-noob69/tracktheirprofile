"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isPaid: boolean;
  searchCredits: number;
  avatarUrl: string | null;
  googleId: string | null;
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
  avatarUrl: string | null;
}

interface TopSearched {
  username: string;
  count: number;
}

interface DailySearch {
  date: string;
  count: number;
}

interface CacheEntry {
  id: string;
  searchedUsername: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalUsers: number;
  paidUsers: number;
  totalSearches: number;
  searchesToday: number;
  searchesThisWeek: number;
  totalAnonSessions: number;
  cacheCount: number;
  newUsersThisWeek: number;
}

type Tab = "overview" | "users" | "searches" | "cache";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [topSearched, setTopSearched] = useState<TopSearched[]>([]);
  const [dailySearches, setDailySearches] = useState<DailySearch[]>([]);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const router = useRouter();

  async function fetchData(search = "", filter = "all") {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "admin") {
        router.push("/");
        return;
      }

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter !== "all") params.set("filter", filter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) return;

      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
      setRecentSearches(data.recentSearches);
      setTopSearched(data.topSearched);
      setDailySearches(data.dailySearches);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchCache() {
    try {
      const res = await fetch("/api/admin/cache");
      if (res.ok) {
        const data = await res.json();
        setCacheEntries(data.entries);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchData();
    fetchCache();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(userSearch, userFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, userFilter]);

  async function togglePaid(userId: string, isPaid: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !isPaid }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isPaid: !isPaid } : u));
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  }

  async function setCredits(userId: string, credits: number) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchCredits: credits }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, searchCredits: credits } : u));
  }

  async function deleteUser(userId: string) {
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setConfirmDelete(null);
    if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
  }

  async function clearCache(id?: string) {
    const url = id ? `/api/admin/cache?id=${id}` : "/api/admin/cache";
    await fetch(url, { method: "DELETE" });
    if (id) {
      setCacheEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      setCacheEntries([]);
    }
    if (stats) setStats({ ...stats, cacheCount: id ? stats.cacheCount - 1 : 0 });
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
      </div>
    );
  }

  const maxDaily = Math.max(...dailySearches.map((d) => d.count), 1);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin <span className="text-green-accent">Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Manage users, monitor searches, and control your platform</p>
        </div>
        <button
          onClick={() => { fetchData(userSearch, userFilter); fetchCache(); }}
          className="flex items-center gap-2 rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-green-accent/30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-card-border bg-card-bg p-1">
        {(["overview", "users", "searches", "cache"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-green-accent text-black shadow-sm"
                : "text-zinc-400 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon="users" accent />
            <StatCard label="Paid Users" value={stats.paidUsers} icon="star" />
            <StatCard label="Searches Today" value={stats.searchesToday} icon="search" accent />
            <StatCard label="This Week" value={stats.searchesThisWeek} icon="chart" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Searches" value={stats.totalSearches} icon="database" />
            <StatCard label="New Users (7d)" value={stats.newUsersThisWeek} icon="plus" accent />
            <StatCard label="Anon Sessions" value={stats.totalAnonSessions} icon="eye" />
            <StatCard label="Cached Results" value={stats.cacheCount} icon="bolt" />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Search Volume */}
            <div className="rounded-xl border border-card-border bg-card-bg p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Search Volume (7 Days)</h3>
              <div className="flex items-end gap-2" style={{ height: 160 }}>
                {dailySearches.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-zinc-400">{d.count}</span>
                    <div
                      className="w-full rounded-t-md bg-green-accent/20 transition-all hover:bg-green-accent/40"
                      style={{ height: `${Math.max((d.count / maxDaily) * 120, 4)}px` }}
                    >
                      <div
                        className="h-full w-full rounded-t-md bg-green-accent/60"
                        style={{ height: `${Math.max((d.count / maxDaily) * 100, 10)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-600">{d.date.split(", ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Searched */}
            <div className="rounded-xl border border-card-border bg-card-bg p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Top Searched Usernames</h3>
              {topSearched.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">No searches yet</p>
              ) : (
                <div className="space-y-2">
                  {topSearched.map((t, i) => {
                    const maxCount = topSearched[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 text-right text-xs font-bold text-zinc-500">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-green-accent">u/{t.username}</span>
                            <span className="text-xs text-zinc-500">{t.count} searches</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                            <div className="h-full rounded-full bg-green-accent/50" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-card-border bg-card-bg">
            <div className="border-b border-card-border px-5 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Recent Activity</h3>
            </div>
            <div className="divide-y divide-card-border">
              {recentSearches.slice(0, 15).map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-background/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-accent/10 text-xs font-bold text-green-accent">
                    {s.avatarUrl ? (
                      <img src={s.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      s.performedBy[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      <span className="text-zinc-400">{s.performedBy}</span> searched for{" "}
                      <span className="font-medium text-green-accent">u/{s.searchedUsername}</span>
                    </p>
                    <p className="text-xs text-zinc-600">
                      {s.postCount} posts, {s.commentCount} comments
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-zinc-600">
                    {timeAgo(new Date(s.createdAt).getTime())}
                  </span>
                </div>
              ))}
              {recentSearches.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-zinc-600">No searches yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ USERS TAB ═══════════════ */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users by email or username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-lg border border-card-border bg-card-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-zinc-600 outline-none transition-colors focus:border-green-accent/50"
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-card-border bg-card-bg p-1">
              {["all", "paid", "free", "admin"].map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                    userFilter === f ? "bg-green-accent text-black" : "text-zinc-400 hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-500">{users.length} user{users.length !== 1 ? "s" : ""} found</p>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-card-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-card-bg">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">User</th>
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
                  <tr key={user.id} className="transition-colors hover:bg-card-bg/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-accent/10 text-sm font-bold text-green-accent overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
                          ) : (
                            user.username[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.username}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "admin" ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isPaid ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {user.isPaid ? "Paid" : "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {user.isPaid || user.role === "admin" ? (
                        <span className="text-green-accent">Unlimited</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{user.searchCredits}</span>
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => setCredits(user.id, 20)}
                              className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700"
                              title="Reset to 20"
                            >
                              20
                            </button>
                            <button
                              onClick={() => setCredits(user.id, 50)}
                              className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700"
                              title="Set to 50"
                            >
                              50
                            </button>
                            <button
                              onClick={() => setCredits(user.id, 100)}
                              className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700"
                              title="Set to 100"
                            >
                              100
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{user.searchCount}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePaid(user.id, user.isPaid)}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            user.isPaid
                              ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                              : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          }`}
                        >
                          {user.isPaid ? "Revoke" : "Paid"}
                        </button>
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700"
                        >
                          {user.role === "admin" ? "Demote" : "Admin"}
                        </button>
                        {confirmDelete === user.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(user.id)}
                            className="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-600">No users found</p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ SEARCHES TAB ═══════════════ */}
      {activeTab === "searches" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Searched */}
            <div className="rounded-xl border border-card-border bg-card-bg p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Most Searched Usernames</h3>
              {topSearched.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topSearched.map((t, i) => {
                    const maxCount = topSearched[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          i < 3 ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-500"
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">u/{t.username}</span>
                            <span className="text-sm font-bold text-green-accent">{t.count}</span>
                          </div>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-800">
                            <div className="h-full rounded-full bg-green-accent/50" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Volume Chart */}
            <div className="rounded-xl border border-card-border bg-card-bg p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Daily Volume (7 Days)</h3>
              <div className="flex items-end gap-3" style={{ height: 200 }}>
                {dailySearches.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{d.count}</span>
                    <div className="w-full overflow-hidden rounded-lg bg-zinc-800" style={{ height: 140 }}>
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-green-accent/40 to-green-accent/80 transition-all"
                        style={{ height: `${Math.max((d.count / maxDaily) * 100, 3)}%`, marginTop: "auto" }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 text-center leading-tight">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Search Log */}
          <div className="rounded-xl border border-card-border bg-card-bg">
            <div className="border-b border-card-border px-5 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Search Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Searched</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">By</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Posts</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Comments</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {recentSearches.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-background/50">
                      <td className="px-4 py-2.5 text-sm font-medium text-green-accent">u/{s.searchedUsername}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-300">{s.performedBy}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-400">{s.postCount}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-400">{s.commentCount}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-500">
                        {new Date(s.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentSearches.length === 0 && (
                <p className="py-12 text-center text-sm text-zinc-600">No searches yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CACHE TAB ═══════════════ */}
      {activeTab === "cache" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">{cacheEntries.length} cached result{cacheEntries.length !== 1 ? "s" : ""}</p>
            {cacheEntries.length > 0 && (
              <button
                onClick={() => clearCache()}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear All Cache
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-card-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-card-bg">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Posts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Comments</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Cached At</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {cacheEntries.map((entry) => {
                  const expiresAt = new Date(new Date(entry.updatedAt).getTime() + 30 * 60 * 1000);
                  const isExpired = expiresAt < new Date();
                  return (
                    <tr key={entry.id} className="transition-colors hover:bg-card-bg/50">
                      <td className="px-4 py-3 text-sm font-medium text-green-accent">u/{entry.searchedUsername}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{entry.postCount}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{entry.commentCount}</td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {new Date(entry.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          isExpired ? "bg-red-500/10 text-red-400" : "bg-green-accent/10 text-green-accent"
                        }`}>
                          {isExpired ? "Expired" : `${Math.ceil((expiresAt.getTime() - Date.now()) / 60000)}m left`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => clearCache(entry.id)}
                          className="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {cacheEntries.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-600">No cached results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: string; accent?: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    database: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />,
    eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />,
    bolt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  };

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 transition-all hover:border-green-accent/10">
      <div className="mb-2 flex items-center justify-between">
        <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icons[icon]}
        </svg>
      </div>
      <p className={`text-2xl font-bold ${accent ? "text-green-accent" : "text-foreground"}`}>
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

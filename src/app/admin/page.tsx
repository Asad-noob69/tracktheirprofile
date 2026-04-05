"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (!meData.user || meData.user.role !== "admin") {
          router.push("/");
          return;
        }

        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          setError("Failed to load users");
          return;
        }

        const data = await res.json();
        setUsers(data.users);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Admin <span className="text-green-accent">Dashboard</span>
        </h1>
        <p className="mt-1 text-zinc-400">
          Manage all registered users
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <p className="text-sm text-zinc-500">Total Users</p>
          <p className="text-3xl font-bold text-green-accent">{users.length}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <p className="text-sm text-zinc-500">Admins</p>
          <p className="text-3xl font-bold text-foreground">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <p className="text-sm text-zinc-500">Regular Users</p>
          <p className="text-3xl font-bold text-foreground">
            {users.filter((u) => u.role === "user").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-card-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border bg-card-bg">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-card-bg"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-medium text-foreground">
                    {user.username}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-400">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-green-accent/10 text-green-accent"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-zinc-500">
            No users registered yet.
          </div>
        )}
      </div>
    </div>
  );
}

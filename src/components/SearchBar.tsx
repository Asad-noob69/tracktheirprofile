"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  initialValue = "",
  size = "large",
}: {
  initialValue?: string;
  size?: "large" | "small";
}) {
  const [username, setUsername] = useState(initialValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length === 0) return;
    router.push(`/search?username=${encodeURIComponent(trimmed)}`);
  };

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div
        className={`flex items-center gap-2 rounded-xl border border-card-border bg-card-bg transition-all focus-within:border-green-accent/50 focus-within:shadow-[0_0_20px_rgba(34,197,94,0.1)] ${
          isLarge ? "p-2" : "p-1.5"
        }`}
      >
        <div className="flex items-center pl-3 text-zinc-500">
          <svg
            className={isLarge ? "h-5 w-5" : "h-4 w-4"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a Reddit username..."
          className={`flex-1 bg-transparent text-foreground placeholder-zinc-600 outline-none ${
            isLarge ? "px-2 py-2 text-lg" : "px-2 py-1.5 text-sm"
          }`}
          maxLength={50}
          autoComplete="off" // Disable browser autofill
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={username.trim().length === 0}
          className={`rounded-lg bg-green-accent font-semibold text-black transition-all hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40 ${
            isLarge ? "px-6 py-2.5 text-base" : "px-4 py-2 text-sm"
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}

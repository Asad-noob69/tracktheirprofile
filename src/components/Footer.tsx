"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogoMark from "@/components/BrandLogoMark";

const WHATSAPP_NUMBER = "923097480177";

export default function Footer() {
  const [message, setMessage] = useState("");

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(trimmed)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setMessage("");
  };

  return (
    <footer className="relative overflow-hidden border-t border-zinc-900 bg-black">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[220vw] -translate-x-1/2 -translate-y-[78%] rounded-[100%] border-t border-green-accent/85 shadow-[0_0_90px_rgba(0,255,157,0.45)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          <div className="flex min-h-[320px] flex-col justify-between">
            <div>
              <div className="mb-5 flex items-center gap-5">
                <BrandLogoMark
                  className="h-28 w-28 rounded-3xl bg-black p-1 sm:h-36 sm:w-36 lg:h-44 lg:w-44"
                  iconClassName="object-contain"
                />
                <div>
                  <p className="text-2xl font-bold text-white sm:text-3xl">
                    Leadverse
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                    Reddit Public Activity Search
                  </p>
                </div>
              </div>
              <p className="max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
                A research tool that aggregates publicly available Reddit posts and
                comments into a single, searchable dashboard for journalists,
                moderators, researchers, and analysts.
              </p>
            </div>

            {/* Legal Links */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
              <Link href="/pricing" className="transition-colors hover:text-green-accent">Pricing</Link>
              <Link href="/terms" className="transition-colors hover:text-green-accent">Terms of Service</Link>
              <Link href="/privacy" className="transition-colors hover:text-green-accent">Privacy Policy</Link>
              <Link href="/refund-policy" className="transition-colors hover:text-green-accent">Refund Policy</Link>
            </div>
          </div>

          <form
            onSubmit={handleWhatsAppSend}
            className="rounded-2xl border border-zinc-800 bg-black p-6 sm:p-7"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7.5 7.5a6.364 6.364 0 019 0 6.364 6.364 0 010 9 6.364 6.364 0 01-7.02 1.34l-2.98.66.66-2.98A6.364 6.364 0 017.5 7.5zM10 10.5c.5 1.8 1.7 3 3.5 3.5"
                />
              </svg>
              <p className="text-sm font-semibold text-white sm:text-base">
                Contact Support
              </p>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Send us a message via WhatsApp
            </p>

            <label
              htmlFor="footer-whatsapp-message"
              className="mt-4 block text-xs font-medium text-zinc-400"
            >
              Your message
            </label>
            <textarea
              id="footer-whatsapp-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-black px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600"
            />

            <button
              type="submit"
              disabled={message.trim().length === 0}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <svg
                className="h-4 w-4 text-green-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7.5 7.5a6.364 6.364 0 019 0 6.364 6.364 0 010 9 6.364 6.364 0 01-7.02 1.34l-2.98.66.66-2.98A6.364 6.364 0 017.5 7.5zM10 10.5c.5 1.8 1.7 3 3.5 3.5"
                />
              </svg>
              Send Message
            </button>
          </form>
        </div>

        <div className="mt-8 border-t border-zinc-900 pt-5">
          <p className="text-center text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} Leadverse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

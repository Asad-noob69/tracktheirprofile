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
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1.2fr] lg:gap-14">
          {/* Left: big logo + description */}
          <div className="flex flex-col">
            <BrandLogoMark
              className="h-48 w-48 sm:h-60 sm:w-60 lg:h-72 lg:w-72"
              iconClassName="object-contain mix-blend-screen"
            />
            <p className="mt-6 max-w-md text-sm leading-7 text-zinc-400">
              TrackTheirProfile helps you inspect any public Reddit profile,
              review post history, and spot patterns in seconds.
            </p>
          </div>

          {/* Middle: Links */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Links
            </p>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              <li>
                <Link href="/pricing" className="transition-colors hover:text-green-accent">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-green-accent">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-green-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="transition-colors hover:text-green-accent">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Contact / WhatsApp */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Contact Support
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Send us a message via WhatsApp
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              QA email: <a href="mailto:support@tracktheirprofile.com" className="text-green-accent hover:underline">support@tracktheirprofile.com</a>
            </p>
            <form onSubmit={handleWhatsAppSend} className="mt-4">
              <textarea
                id="footer-whatsapp-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-black px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600"
              />
              <button
                type="submit"
                disabled={message.trim().length === 0}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-45"
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
        </div>

        <div className="mt-10 border-t border-zinc-900 pt-5">
          <p className="text-center text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} TrackTheirProfile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

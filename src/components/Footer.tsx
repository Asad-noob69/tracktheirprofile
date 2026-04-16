"use client";

import { useState } from "react";
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
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[72vw] max-w-[760px] -translate-x-1/2 rounded-t-full border-x border-t border-green-accent/85 shadow-[0_0_28px_rgba(0,255,157,0.7)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <div className="rounded-2xl border border-zinc-900 bg-black p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-4">
              <BrandLogoMark
                className="h-24 w-24 rounded-2xl bg-black p-1 sm:h-28 sm:w-28"
                iconClassName="object-contain"
              />
              <div>
                <p className="text-xl font-bold text-white sm:text-2xl">
                  TrackTheirProfile
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Reddit Profile Intelligence
                </p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
              Discover posts, comments, behavior patterns, and footprint history
              from any public Reddit profile in seconds.
            </p>
          </div>

          <form
            onSubmit={handleWhatsAppSend}
            className="rounded-2xl border border-zinc-900 bg-black p-6 sm:p-7"
          >
            <p className="text-sm font-semibold text-white sm:text-base">
              Message Us on WhatsApp
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Send your query to +92 309 7480177
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
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Send on WhatsApp
            </button>
          </form>
        </div>

        <div className="mt-8 border-t border-zinc-900 pt-5">
          <p className="text-center text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} TrackTheirProfile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

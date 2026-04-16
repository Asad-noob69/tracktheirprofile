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
    <footer className="relative overflow-hidden border-t border-card-border bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,157,0.12),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(0,255,157,0.08),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <div className="rounded-2xl border border-card-border bg-card-bg/70 p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-4">
              <BrandLogoMark
                className="h-20 w-20 rounded-2xl border border-green-accent/20 bg-background p-1 shadow-[0_0_24px_rgba(0,255,157,0.22)] sm:h-24 sm:w-24"
                iconClassName="object-contain"
              />
              <div>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  Track<span className="text-green-accent">Their</span>Profile
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
            className="rounded-2xl border border-green-accent/20 bg-card-bg/80 p-6 sm:p-7"
          >
            <p className="text-sm font-semibold text-foreground sm:text-base">
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
              className="mt-2 w-full resize-none rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-zinc-600 focus:border-green-accent/60"
            />

            <button
              type="submit"
              disabled={message.trim().length === 0}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-accent px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#00e68d] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Send on WhatsApp
            </button>
          </form>
        </div>

        <div className="mt-8 border-t border-card-border pt-5">
          <p className="text-center text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} TrackTheirProfile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

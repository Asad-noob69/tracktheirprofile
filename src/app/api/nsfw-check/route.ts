import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const REDDIT_USER_AGENTS = [
  "TrackTheirProfile/1.0",
  "web:tracktheirprofile.com:1.0 (NSFW profile checker)",
];
const REDDIT_HOSTS = ["www.reddit.com", "old.reddit.com"];
const ARCTIC_SHIFT_BASE = "https://arctic-shift.photon-reddit.com/api";

interface AboutResult {
  found: boolean;
  isNsfw: boolean;
}

async function fetchRedditAbout(
  host: string,
  username: string,
  userAgent: string
): Promise<AboutResult | null | "not_found"> {
  const url = `https://${host}/user/${encodeURIComponent(username)}/about.json?raw_json=1`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (res.status === 404) return "not_found";
    if (!res.ok) {
      console.warn(`[nsfw-check] ${host} (${userAgent}) returned ${res.status} for ${username}`);
      return null;
    }

    const data = await res.json();
    const inner = data?.data;
    if (!inner) return null;

    if (inner.is_suspended) return "not_found";

    const isNsfw = Boolean(inner?.subreddit?.over_18 ?? inner?.over_18 ?? false);
    return { found: true, isNsfw };
  } catch (err) {
    console.warn(`[nsfw-check] ${host} fetch failed for ${username}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchArcticShift(username: string): Promise<AboutResult | null> {
  const url = `${ARCTIC_SHIFT_BASE}/users/search?author=${encodeURIComponent(username)}&limit=1`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`[nsfw-check] arctic-shift returned ${res.status} for ${username}`);
      return null;
    }
    const data = await res.json();
    const u = data?.data?.[0];
    // arctic-shift only indexes a subset of users — empty result is NOT a definitive
    // "doesn't exist", so return null (unknown) rather than a false 404.
    if (!u) {
      console.warn(`[nsfw-check] arctic-shift has no record for ${username}; treating as unknown`);
      return null;
    }
    const isNsfw = Boolean(u.subreddit?.over_18 ?? u.over_18 ?? false);
    return { found: true, isNsfw };
  } catch (err) {
    console.warn("[nsfw-check] arctic-shift fetch failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sid = cookieStore.get("ttp_anon_sid")?.value;
  if (!sid) {
    sid = crypto.randomUUID();
    cookieStore.set("ttp_anon_sid", sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return sid;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const { allowed } = rateLimit(`nsfw:${ip}`, 30, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checks. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  if (!username || username.trim().length === 0) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const sanitized = username.trim().replace(/^u\//i, "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (sanitized.length === 0 || sanitized.length > 50) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const session = await getSession();
  const userId = session?.userId ?? null;
  const sessionId = await getOrCreateSessionId();

  try {
    let result: AboutResult | null = null;
    let confirmedNotFound = false;

    outer: for (const ua of REDDIT_USER_AGENTS) {
      for (const host of REDDIT_HOSTS) {
        const r = await fetchRedditAbout(host, sanitized, ua);
        if (r === "not_found") {
          confirmedNotFound = true;
          break outer;
        }
        if (r) {
          result = r;
          break outer;
        }
      }
    }

    if (!result && !confirmedNotFound) {
      const arctic = await fetchArcticShift(sanitized);
      if (arctic) result = arctic;
    }

    if (confirmedNotFound) {
      await prisma.nsfwCheck.create({
        data: { userId, sessionId, checkedUsername: sanitized, isNsfw: false, found: false },
      });
      return NextResponse.json({ username: sanitized, found: false, isNsfw: false });
    }

    if (!result) {
      return NextResponse.json(
        { error: "Reddit isn't responding right now. Try again in a moment." },
        { status: 502 }
      );
    }

    await prisma.nsfwCheck.create({
      data: {
        userId,
        sessionId,
        checkedUsername: sanitized,
        isNsfw: result.isNsfw,
        found: result.found,
      },
    });

    return NextResponse.json({
      username: sanitized,
      found: result.found,
      isNsfw: result.isNsfw,
    });
  } catch (err) {
    console.error("[nsfw-check] Failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to check profile. Please try again." },
      { status: 500 }
    );
  }
}

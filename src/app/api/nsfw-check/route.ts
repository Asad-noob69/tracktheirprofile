import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const REDDIT_USER_AGENT = "TrackTheirProfile/1.0";

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
    const url = `https://www.reddit.com/user/${encodeURIComponent(sanitized)}/about.json`;
    const res = await fetch(url, {
      headers: { "User-Agent": REDDIT_USER_AGENT },
      cache: "no-store",
    });

    if (res.status === 404) {
      await prisma.nsfwCheck.create({
        data: { userId, sessionId, checkedUsername: sanitized, isNsfw: false, found: false },
      });
      return NextResponse.json({
        username: sanitized,
        found: false,
        isNsfw: false,
      });
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not reach Reddit. Try again in a moment." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const sub = data?.data?.subreddit;
    const isNsfw = Boolean(sub?.over_18 ?? data?.data?.over_18 ?? false);

    await prisma.nsfwCheck.create({
      data: { userId, sessionId, checkedUsername: sanitized, isNsfw, found: true },
    });

    return NextResponse.json({
      username: sanitized,
      found: true,
      isNsfw,
    });
  } catch (err) {
    console.error("[nsfw-check] Failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to check profile. Please try again." },
      { status: 500 }
    );
  }
}

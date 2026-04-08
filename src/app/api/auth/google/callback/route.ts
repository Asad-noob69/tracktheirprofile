import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, createToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(`google-auth:${ip}`, 20, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.redirect(new URL("/signin?error=rate_limit", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/signin?error=google_denied", request.url));
  }

  try {
    const googleUser = await exchangeGoogleCode(code);

    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.id },
          { email: googleUser.email.toLowerCase() },
        ],
      },
    });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            avatarUrl: googleUser.picture,
          },
        });
      }
    } else {
      // Create new user
      // Generate a unique username from Google name
      const baseName = googleUser.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || "user";
      let username = baseName;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseName}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          username,
          googleId: googleUser.id,
          avatarUrl: googleUser.picture,
        },
      });
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.redirect(new URL("/", request.url));
  } catch {
    return NextResponse.redirect(new URL("/signin?error=google_failed", request.url));
  }
}

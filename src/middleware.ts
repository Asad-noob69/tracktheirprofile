import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tracktheirprofile-default-secret-change-me"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin pages (except the auth API) — check admin cookie
  if (pathname.startsWith("/admin") && !pathname.startsWith("/api/admin/auth")) {
    const token = request.cookies.get("ttp_admin")?.value;
    if (!token) {
      // No cookie — the admin page will show the login form
      return NextResponse.next();
    }

    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET);
      if (payload.admin !== true) {
        return NextResponse.next();
      }
    } catch {
      // Invalid token — let page handle it
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

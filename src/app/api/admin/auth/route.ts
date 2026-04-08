import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tracktheirprofile-default-secret-change-me"
);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE_NAME = "ttp_admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(ADMIN_SECRET);

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}

export async function GET() {
  // Check if admin is authenticated — used by admin pages
  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

// Helper used by other admin routes
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload.admin === true;
  } catch {
    return false;
  }
}

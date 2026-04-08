import { NextResponse } from "next/server";
import { getGoogleOAuthURL } from "@/lib/auth";

export async function GET() {
  const url = getGoogleOAuthURL();
  return NextResponse.redirect(url);
}

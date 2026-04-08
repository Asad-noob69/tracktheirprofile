import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isPaid: true,
      searchCredits: true,
      createdAt: true,
      searchLogs: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent admins from modifying their own account via this endpoint
  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 403 });
  }

  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.isPaid === "boolean") data.isPaid = body.isPaid;
  if (typeof body.searchCredits === "number") {
    if (body.searchCredits < 0 || body.searchCredits > 1000) {
      return NextResponse.json({ error: "Credits must be between 0 and 1000" }, { status: 400 });
    }
    data.searchCredits = body.searchCredits;
  }
  if (typeof body.role === "string" && ["user", "admin"].includes(body.role)) data.role = body.role;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ user });
}

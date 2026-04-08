import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
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
      avatarUrl: true,
      googleId: true,
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
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  // Delete user's search logs first, then the user
  await prisma.searchLog.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

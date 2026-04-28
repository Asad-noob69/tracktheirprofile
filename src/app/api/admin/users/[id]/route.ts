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

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [user, searchLogsTotal, searchLogs, uniqueSearched] = await Promise.all([
      prisma.user.findUnique({
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
        },
      }),
      prisma.searchLog.count({ where: { userId: id } }),
      prisma.searchLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.searchLog.findMany({
        where: { userId: id },
        select: { searchedUsername: true },
        distinct: ["searchedUsername"],
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: { ...user, searchLogs },
      uniqueSearched: uniqueSearched.map((u) => u.searchedUsername),
      pagination: {
        page,
        limit,
        total: searchLogsTotal,
        totalPages: Math.max(1, Math.ceil(searchLogsTotal / limit)),
      },
    });
  } catch (err) {
    console.error("[admin/users/id] GET failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
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
  } catch (err) {
    console.error("[admin/users/id] PATCH failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Delete user's search logs first, then the user
    await prisma.searchLog.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/users/id] DELETE failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

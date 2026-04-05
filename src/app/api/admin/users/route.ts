import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isPaid: true,
      searchCredits: true,
      createdAt: true,
      _count: { select: { searchLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Global stats
  const totalSearches = await prisma.searchLog.count();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const searchesToday = await prisma.searchLog.count({
    where: { createdAt: { gte: todayStart } },
  });
  const paidUsers = users.filter((u) => u.isPaid).length;
  const recentSearches = await prisma.searchLog.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true } } },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      searchCount: u._count.searchLogs,
      _count: undefined,
    })),
    stats: {
      totalUsers: users.length,
      paidUsers,
      totalSearches,
      searchesToday,
    },
    recentSearches: recentSearches.map((s) => ({
      id: s.id,
      searchedUsername: s.searchedUsername,
      postCount: s.postCount,
      commentCount: s.commentCount,
      createdAt: s.createdAt,
      performedBy: s.user?.username ?? "Anonymous",
    })),
  });
}

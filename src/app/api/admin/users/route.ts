import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all"; // all, paid, free, admin

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }

  if (filter === "paid") where.isPaid = true;
  if (filter === "free") where.isPaid = false;
  if (filter === "admin") where.role = "admin";

  const users = await prisma.user.findMany({
    where,
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
  const paidUsers = await prisma.user.count({ where: { isPaid: true } });
  const totalUsers = await prisma.user.count();

  // Searches this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const searchesThisWeek = await prisma.searchLog.count({
    where: { createdAt: { gte: weekStart } },
  });

  // Anonymous sessions
  const totalAnonSessions = await prisma.anonCredit.count();

  // Top searched usernames
  const topSearched = await prisma.searchLog.groupBy({
    by: ["searchedUsername"],
    _count: { searchedUsername: true },
    orderBy: { _count: { searchedUsername: "desc" } },
    take: 10,
  });

  // Recent searches
  const recentSearches = await prisma.searchLog.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, avatarUrl: true } } },
  });

  // Cache stats
  const cacheCount = await prisma.searchCache.count();

  // Daily search counts for last 7 days
  const dailySearches: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const count = await prisma.searchLog.count({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
    });
    dailySearches.push({
      date: dayStart.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      count,
    });
  }

  // New users this week
  const newUsersThisWeek = await prisma.user.count({
    where: { createdAt: { gte: weekStart } },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      searchCount: u._count.searchLogs,
      _count: undefined,
    })),
    stats: {
      totalUsers,
      paidUsers,
      totalSearches,
      searchesToday,
      searchesThisWeek,
      totalAnonSessions,
      cacheCount,
      newUsersThisWeek,
    },
    topSearched: topSearched.map((t) => ({
      username: t.searchedUsername,
      count: t._count.searchedUsername,
    })),
    dailySearches,
    recentSearches: recentSearches.map((s) => ({
      id: s.id,
      searchedUsername: s.searchedUsername,
      postCount: s.postCount,
      commentCount: s.commentCount,
      createdAt: s.createdAt,
      performedBy: s.user?.username ?? "Anonymous",
      avatarUrl: s.user?.avatarUrl ?? null,
    })),
  });
}

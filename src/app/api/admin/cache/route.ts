import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const entries = await prisma.searchCache.findMany({
    select: {
      id: true,
      searchedUsername: true,
      postCount: true,
      commentCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ entries });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    await prisma.searchCache.delete({ where: { id } });
  } else {
    await prisma.searchCache.deleteMany();
  }

  return NextResponse.json({ success: true });
}

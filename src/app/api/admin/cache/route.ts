import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
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
  } catch (err) {
    console.error("[admin/cache] GET failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Validate the cache entry exists before deleting
      const entry = await prisma.searchCache.findUnique({ where: { id } });
      if (!entry) {
        return NextResponse.json({ error: "Cache entry not found" }, { status: 404 });
      }
      await prisma.searchCache.delete({ where: { id } });
    } else {
      await prisma.searchCache.deleteMany();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/cache] DELETE failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

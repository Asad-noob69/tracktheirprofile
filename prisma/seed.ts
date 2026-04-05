import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";
import path from "path";

async function main() {
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({
    url: `file:${dbPath}`,
  });
  const prisma = new PrismaClient({ adapter });

  const email = "admin@tracktheirprofile.com";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin user already exists:", existing.email);
    return;
  }

  const hashed = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.create({
    data: {
      email,
      username: "admin",
      password: hashed,
      role: "admin",
    },
  });

  console.log("Admin user created:");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Username: ${admin.username}`);
  console.log(`  Password: admin123`);
  console.log(`  Role: ${admin.role}`);
}

main().catch(console.error);

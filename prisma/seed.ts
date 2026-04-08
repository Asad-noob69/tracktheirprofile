import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
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

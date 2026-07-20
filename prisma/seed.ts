import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");
  
  // Clean up existing users
  await prisma.user.deleteMany({});
  
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  // Seed Users
  await prisma.user.create({
    data: {
      name: "Ramesh Rathore",
      email: "demo@railwaypnr.com",
      password: hashedPassword,
      role: "passenger",
    }
  });

  await prisma.user.create({
    data: {
      name: "Ramesh Rathore",
      email: "passenger@railwaypnr.com",
      password: hashedPassword,
      role: "passenger",
    }
  });

  await prisma.user.create({
    data: {
      name: "Sanjay Sharma",
      email: "staff@railwaypnr.com",
      password: hashedPassword,
      role: "staff",
    }
  });

  await prisma.user.create({
    data: {
      name: "Priyanka Rathore",
      email: "admin@railwaypnr.com",
      password: hashedPassword,
      role: "admin",
    }
  });

  console.log("Seeding finished successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });

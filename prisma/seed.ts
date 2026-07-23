import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database started...");
  
  // Clean up database tables in correct order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.searchHistory.deleteMany({});
  await prisma.favoritePNR.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  // 1. Create Users
  const passenger = await prisma.user.create({
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
      station: "NDLS",
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

  console.log("Users created: Passenger, Staff, Admin.");

  // 2. Create Passenger Bookings
  await prisma.booking.create({
    data: {
      pnr: "4109857123",
      trainNo: "12425",
      trainName: "Rajdhani Express",
      dateOfJourney: new Date("2026-12-23T16:55:00Z"),
      fromStation: "NDLS",
      toStation: "CNB",
      status: "CNF",
      boardingStatus: "Boarding",
      seat: "A1/25",
      userId: passenger.id,
    }
  });

  await prisma.booking.create({
    data: {
      pnr: "1234567890",
      trainNo: "12004",
      trainName: "Shatabdi Express",
      dateOfJourney: new Date("2026-12-24T06:10:00Z"),
      fromStation: "NDLS",
      toStation: "LJN",
      status: "CNF",
      boardingStatus: "Checked In",
      seat: "C2/14",
      userId: passenger.id,
    }
  });

  await prisma.booking.create({
    data: {
      pnr: "7103958261",
      trainNo: "12204",
      trainName: "Garib Rath Express",
      dateOfJourney: new Date("2026-09-14T13:30:00Z"),
      fromStation: "NDLS",
      toStation: "ASR",
      status: "CNF",
      boardingStatus: "On-Board",
      seat: "G5/4",
      userId: passenger.id,
    }
  });

  console.log("Passenger bookings seeded.");

  // 3. Create Favorite PNRs
  await prisma.favoritePNR.create({
    data: {
      pnr: "4109857123",
      label: "Home to Delhi Trip",
      userId: passenger.id,
    }
  });

  await prisma.favoritePNR.create({
    data: {
      pnr: "9876543210",
      label: "Weekend Lucknow Visit",
      userId: passenger.id,
    }
  });

  console.log("Passenger favorite PNRs seeded.");

  // 4. Create Search History
  await prisma.searchHistory.create({
    data: {
      query: "4109857123",
      userId: passenger.id,
    }
  });

  await prisma.searchHistory.create({
    data: {
      query: "1234567890",
      userId: passenger.id,
    }
  });

  await prisma.searchHistory.create({
    data: {
      query: "7103958261",
      userId: passenger.id,
    }
  });

  console.log("Passenger search history seeded.");

  // 5. Create Notifications
  await prisma.notification.create({
    data: {
      title: "Welcome aboard!",
      message: "Your ixigo Premium Passenger Portal is now fully active.",
      userId: passenger.id,
    }
  });

  console.log("Passenger notifications seeded.");

  console.log("Seeding finished successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

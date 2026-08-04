import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database started...");

  // Clean up in dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.luggage.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.dutyShift.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.searchHistory.deleteMany({});
  await prisma.favoritePNR.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("password123", 12);

  // ─── 1. USERS ───────────────────────────────────────────────────────────────
  const passenger = await prisma.user.create({
    data: {
      name: "Ramesh Rathore",
      email: "demo@railwaypnr.com",
      password: hashedPassword,
      role: "passenger",
    },
  });

  const passenger2 = await prisma.user.create({
    data: {
      name: "Akhilan Subramani",
      email: "passenger@railwaypnr.com",
      password: hashedPassword,
      role: "passenger",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Sanjay Sharma",
      email: "staff@railwaypnr.com",
      password: hashedPassword,
      role: "staff",
      station: "NDLS",
      subRole: "ttr",
    } as any,
  });

  await prisma.user.create({
    data: {
      name: "TTR Officer",
      email: "ttr@railwaypnr.com",
      password: hashedPassword,
      role: "staff",
      station: "NDLS",
      subRole: "ttr",
    } as any,
  });

  await prisma.user.create({
    data: {
      name: "Pantry Manager",
      email: "pantry@railwaypnr.com",
      password: hashedPassword,
      role: "staff",
      station: "NDLS",
      subRole: "pantry",
    } as any,
  });

  await prisma.user.create({
    data: {
      name: "Maintenance Engineer",
      email: "maintenance@railwaypnr.com",
      password: hashedPassword,
      role: "staff",
      station: "NDLS",
      subRole: "maintenance",
    } as any,
  });

  await prisma.user.create({
    data: {
      name: "Priyanka Rathore",
      email: "admin@railwaypnr.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Users created.");

  // ─── 2. BOOKINGS ────────────────────────────────────────────────────────────
  // Use today's date so getManifest() date filter includes them
  const today = new Date();

  const booking1 = await prisma.booking.create({
    data: {
      pnr: "4109857123",
      trainNo: "12425",
      trainName: "Rajdhani Express",
      dateOfJourney: today,
      fromStation: "NDLS",
      toStation: "CNB",
      status: "CNF",
      boardingStatus: "On-Board",
      seat: "A1/25",
      passengerName: "Akhilan Subramani",
      mealPreference: "Veg",
      mealStatus: "Pending",
      userId: passenger2.id,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      pnr: "1234567890",
      trainNo: "12425",
      trainName: "Rajdhani Express",
      dateOfJourney: today,
      fromStation: "NDLS",
      toStation: "LJN",
      status: "CNF",
      boardingStatus: "On-Board",
      seat: "C2/14",
      passengerName: "Akhilan Subramani",
      mealPreference: "Non-Veg",
      mealStatus: "Pending",
      userId: passenger2.id,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      pnr: "7103958261",
      trainNo: "12425",
      trainName: "Rajdhani Express",
      dateOfJourney: today,
      fromStation: "NDLS",
      toStation: "ASR",
      status: "CNF",
      boardingStatus: "No Show",
      seat: "G5/4",
      passengerName: "Akhilan Subramani",
      mealPreference: "Veg",
      mealStatus: "Delivered",
      userId: passenger2.id,
    },
  });

  // Waitlisted passenger — for seat re-allocation testing
  await prisma.booking.create({
    data: {
      pnr: "9001234567",
      trainNo: "12425",
      trainName: "Rajdhani Express",
      dateOfJourney: today,
      fromStation: "NDLS",
      toStation: "CNB",
      status: "WL",
      boardingStatus: "Next Station",
      seat: "WL/3",
      passengerName: "Kavitha Menon",
      userId: passenger.id,
    },
  });

  // Passenger-1 booking (for history & booking tabs)
  await prisma.booking.create({
    data: {
      pnr: "5566778899",
      trainNo: "12004",
      trainName: "Shatabdi Express",
      dateOfJourney: today,
      fromStation: "CNB",
      toStation: "LJN",
      status: "CNF",
      boardingStatus: "Boarding",
      seat: "C1/5",
      passengerName: "Ramesh Rathore",
      userId: passenger.id,
    },
  });

  console.log("✅ Bookings seeded (3 NDLS manifest + 1 WL + 1 CNB).");

  // ─── 3. FAVORITES & SEARCH HISTORY ─────────────────────────────────────────
  await prisma.favoritePNR.create({
    data: { pnr: "4109857123", label: "Home to Delhi Trip", userId: passenger.id },
  });
  await prisma.favoritePNR.create({
    data: { pnr: "9876543210", label: "Weekend Lucknow Visit", userId: passenger.id },
  });

  await prisma.searchHistory.create({ data: { query: "4109857123", userId: passenger.id } });
  await prisma.searchHistory.create({ data: { query: "1234567890", userId: passenger.id } });
  await prisma.searchHistory.create({ data: { query: "7103958261", userId: passenger.id } });

  console.log("✅ Favorites & search history seeded.");

  // ─── 4. NOTIFICATIONS ───────────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      title: "Welcome aboard!",
      message: "Your ixigo Premium Passenger Portal is now fully active.",
      userId: passenger.id,
    },
  });

  console.log("✅ Notifications seeded.");

  // ─── 5. DUTY SHIFTS (Duty Roster tab) ───────────────────────────────────────
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  await prisma.dutyShift.create({
    data: {
      userId: staff.id,
      trainNo: "12425",
      station: "NDLS",
      date: today,
      shiftType: "Morning",
      status: "Scheduled",
    },
  });

  await prisma.dutyShift.create({
    data: {
      userId: staff.id,
      trainNo: "12004",
      station: "CNB",
      date: tomorrow,
      shiftType: "Evening",
      status: "Scheduled",
    },
  });

  await prisma.dutyShift.create({
    data: {
      userId: staff.id,
      trainNo: "12425",
      station: "NDLS",
      date: dayAfter,
      shiftType: "Night",
      status: "Scheduled",
    },
  });

  console.log("✅ Duty shifts seeded (3 shifts).");

  // ─── 6. ATTENDANCE (Duty Roster tab) ────────────────────────────────────────
  // One completed past shift — staff can freely test Check In/Out on fresh load
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const checkOutTime = new Date(yesterday);
  checkOutTime.setHours(yesterday.getHours() + 8);

  await prisma.attendance.create({
    data: {
      userId: staff.id,
      checkIn: yesterday,
      checkOut: checkOutTime,
      latitude: 28.6139,
      longitude: 77.209,
      station: "NDLS",
    },
  });

  console.log("✅ Attendance record seeded (1 completed shift yesterday).");

  // ─── 7. INCIDENTS (Train Operations tab) ────────────────────────────────────
  await prisma.incident.create({
    data: {
      trainNo: "12425",
      coach: "A1",
      seatNo: "25",
      category: "AC",
      description: "Air conditioning not cooling. Passengers in seats 24–28 reporting discomfort.",
      status: "Reported",
      severity: "High",
      reportedBy: staff.id,
    },
  });

  await prisma.incident.create({
    data: {
      trainNo: "12425",
      coach: "B2",
      seatNo: null,
      category: "Cleanliness",
      description: "Washroom needs cleaning in coach B2. Bio-waste disposal unit is full.",
      status: "In Progress",
      severity: "Medium",
      reportedBy: staff.id,
    },
  });

  await prisma.incident.create({
    data: {
      trainNo: "12425",
      coach: "G5",
      seatNo: "4",
      category: "Medical",
      description: "Passenger at G5/4 requested first-aid kit. Minor cut resolved on site.",
      status: "Resolved",
      severity: "Low",
      reportedBy: staff.id,
    },
  });

  console.log("✅ Incidents seeded (3 incidents on train 12425).");

  // ─── 8. LUGGAGE (Luggage Tracking tab) ──────────────────────────────────────
  await prisma.luggage.create({
    data: {
      bookingId: booking1.id,
      barcode: "LGG-NDLS-0001",
      weight: 12.5,
      description: "Large suitcase — black with red handle",
      status: "Loaded",
    },
  });

  await prisma.luggage.create({
    data: {
      bookingId: booking2.id,
      barcode: "LGG-NDLS-0002",
      weight: 7.0,
      description: "Backpack with laptop",
      status: "Registered",
    },
  });

  await prisma.luggage.create({
    data: {
      bookingId: booking3.id,
      barcode: "LGG-NDLS-0003",
      weight: 22.0,
      description: "Bicycle (boxed)",
      status: "Loaded",
    },
  });

  console.log("✅ Luggage records seeded (3 items).");

  console.log("\n🎉 Seeding complete!");
  console.log("  Staff     → staff@railwaypnr.com    / password123");
  console.log("  Passenger → demo@railwaypnr.com     / password123");
  console.log("  Admin     → admin@railwaypnr.com    / password123");
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

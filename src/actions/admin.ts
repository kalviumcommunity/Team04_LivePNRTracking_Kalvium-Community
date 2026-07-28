"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Helper to authenticate admin user and return DB record
async function getAuthenticatedAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in.");
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Administrator access required.");
  }
  return user;
}

// Helper to authenticate staff or admin user
async function getAuthenticatedStaffOrAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in.");
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    throw new Error("Unauthorized: Access denied.");
  }
  return user;
}

// 1. Get Administrative Portal Dashboard Metrics
export async function getAdminStats() {
  try {
    await getAuthenticatedAdmin();

    const staffCount = await db.user.count({
      where: { role: "staff" },
    });

    const bookingsCount = await db.booking.count({});
    const activeStaff = await db.user.count({
      where: { role: "staff", active: true },
    });

    return {
      totalStaff: staffCount,
      totalBookings: bookingsCount,
      activeStaff,
      systemUptime: "99.98%",
    };
  } catch (error) {
    console.error("[GET_ADMIN_STATS]", error);
    return {
      totalStaff: 0,
      totalBookings: 0,
      activeStaff: 0,
      systemUptime: "100%",
    };
  }
}

// 2. Manage Staff: List staff
export async function getStaffMembers() {
  try {
    await getAuthenticatedAdmin();

    const staffList = await db.user.findMany({
      where: {
        role: { in: ["staff", "admin"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return staffList.map((s) => ({
      id: s.id,
      name: s.name || "Unnamed Staff",
      email: s.email || "",
      role: s.role as "staff" | "admin",
      status: s.active ? ("Active" as const) : ("Inactive" as const),
      station: s.station || "New Delhi (NDLS)",
    }));
  } catch (error) {
    console.error("[GET_STAFF_MEMBERS]", error);
    return [];
  }
}

// 3. Manage Staff: Add staff
export async function addStaffMember(data: {
  name: string;
  email: string;
  station: string;
}) {
  try {
    const admin = await getAuthenticatedAdmin();

    // Check if email already taken
    const existing = await db.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return { error: "A user with this email already exists." };
    }

    // Default password for staff accounts
    const hashedPassword = await bcrypt.hash("password123", 12);

    const newStaff = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "staff",
        station: data.station,
        active: true,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "ADD_STAFF",
        details: `Admin ${admin.name} created staff account for ${data.name} (${data.email})`,
        userId: admin.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, staff: newStaff };
  } catch (error: unknown) {
    console.error("[ADD_STAFF_MEMBER]", error);
    return { error: (error as Error).message || "Failed to create staff account." };
  }
}

// 4. Manage Staff: Toggle active status
export async function toggleStaffStatus(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return { error: "Staff member not found." };
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        active: !targetUser.active,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "TOGGLE_STAFF_STATUS",
        details: `Admin ${admin.name} toggled active status for ${updated.name} to ${updated.active}`,
        userId: admin.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("[TOGGLE_STAFF_STATUS]", error);
    return { error: (error as Error).message || "Failed to toggle status." };
  }
}

// 5. Manage Passengers: List passenger records
export async function getPassengersList() {
  try {
    await getAuthenticatedStaffOrAdmin();

    const passengers = await db.user.findMany({
      where: { role: "passenger" },
      include: {
        bookings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to layout format
    return passengers.flatMap((p) => {
      const userBookings = p.bookings || [];
      if (userBookings.length === 0) {
        return []; // Only show passengers actively monitored/having bookings
      }
      return userBookings.map((b) => ({
        id: b.id,
        name: (b as { passengerName?: string | null }).passengerName || p.name || "Passenger",
        pnr: b.pnr,
        from: b.fromStation,
        to: b.toStation,
        trainNo: b.trainNo,
        status: b.boardingStatus as "Boarding" | "Checked In" | "On-Board" | "No Show",
        seat: b.seat || "",
      }));
    });
  } catch (error) {
    console.error("[GET_PASSENGERS_LIST]", error);
    return [];
  }
}

// 6. Get Audit Logs
export async function getAuditLogs() {
  try {
    await getAuthenticatedAdmin();

    const logs = await db.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details || "",
      timestamp: new Date(l.createdAt).toLocaleTimeString() + " - " + new Date(l.createdAt).toLocaleDateString(),
      userName: l.user?.name || "System",
      userEmail: l.user?.email || "",
    }));
  } catch (error) {
    console.error("[GET_AUDIT_LOGS]", error);
    return [];
  }
}

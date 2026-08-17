"use server";

/**
 * @file admin.ts
 * @description Server actions handling administrative controls: managing staff roster lists,
 * passenger manifests logs, and auditing platform safety events.
 */

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Helper to authenticate admin user and return DB record (with demo-session fallback)
async function getAuthenticatedAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const sessionRole = (session.user as { role?: string }).role;
  const adminVerified = (session.user as { adminVerified?: boolean }).adminVerified;

  if (sessionRole !== "admin" || !adminVerified) {
    throw new Error("Unauthorized: Verified administrator access required.");
  }

  // Attempt to find the user in the database by email
  let user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  // Fallback: If DB record missing but session role is "admin" (e.g. demo seeded user
  // whose ID diverges from the hardcoded fallback), look up by role.
  if (!user && sessionRole === "admin") {
    user = await db.user.findFirst({
      where: { role: "admin" },
    });
  }

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Administrator access required.");
  }
  return user;
}

// Helper to authenticate staff or admin user (with demo fallback)
async function getAuthenticatedStaffOrAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in.");
  }

  let user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  // Fallback for demo sessions
  if (!user) {
    const sessionRole = (session.user as { role?: string }).role;
    if (sessionRole === "admin" || sessionRole === "staff") {
      user = await db.user.findFirst({ where: { role: sessionRole } });
    }
  }

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

    const passengerCount = await db.user.count({
      where: { role: "passenger" },
    });

    return {
      totalStaff: staffCount,
      totalBookings: bookingsCount,
      activeStaff,
      passengerCount,
      systemUptime: "99.98%",
    };
  } catch (error) {
    console.error("[GET_ADMIN_STATS]", error);
    return {
      totalStaff: 0,
      totalBookings: 0,
      activeStaff: 0,
      passengerCount: 0,
      systemUptime: "99.98%",
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
      subRole: (s as { subRole?: string | null }).subRole ?? null,
      status: s.active ? ("Active" as const) : ("Inactive" as const),
      station: s.station || "New Delhi (NDLS)",
    }));
  } catch (error) {
    console.error("[GET_STAFF_MEMBERS]", error);
    return [];
  }
}

// 3. Manage Staff: Add staff (now with subRole)
export async function addStaffMember(data: {
  name: string;
  email: string;
  station: string;
  subRole?: string | null;
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
        subRole: data.subRole || null,
        active: true,
      } as Parameters<typeof db.user.create>[0]["data"],
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "ADD_STAFF",
        details: `Admin ${admin.name} created staff account for ${data.name} (${data.email})${data.subRole ? ` with role: ${data.subRole}` : ""}`,
        userId: admin.id,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      staff: {
        id: newStaff.id,
        name: newStaff.name || "",
        email: newStaff.email || "",
        role: newStaff.role as "staff" | "admin",
        subRole: newStaff.subRole ?? null,
        status: newStaff.active ? ("Active" as const) : ("Inactive" as const),
        station: newStaff.station || "New Delhi (NDLS)",
      },
    };
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
        details: `Admin ${admin.name} toggled active status for ${updated.name} to ${updated.active ? "Active" : "Inactive"}`,
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

// 5. Manage Staff: Delete staff member (hard delete)
export async function deleteStaffMember(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return { error: "Staff member not found." };
    }

    // Prevent admin from deleting themselves
    if (targetUser.id === admin.id) {
      return { error: "You cannot delete your own account." };
    }

    // Delete dependent records first to avoid FK constraint violations
    await db.auditLog.deleteMany({ where: { userId: id } });
    await db.attendance.deleteMany({ where: { userId: id } });
    await db.dutyShift.deleteMany({ where: { userId: id } });
    await db.incident.deleteMany({ where: { reportedBy: id } });
    await db.notification.deleteMany({ where: { userId: id } });
    await db.account.deleteMany({ where: { userId: id } });
    await db.session.deleteMany({ where: { userId: id } });

    await db.user.delete({ where: { id } });

    // Audit log (using admin's ID since target is deleted)
    await db.auditLog.create({
      data: {
        action: "DELETE_STAFF",
        details: `Admin ${admin.name} permanently deleted staff account: ${targetUser.name} (${targetUser.email})`,
        userId: admin.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("[DELETE_STAFF_MEMBER]", error);
    return { error: (error as Error).message || "Failed to delete staff member." };
  }
}

// 6. Manage Passengers: List passenger records
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

// 7. Get Audit Logs (last 50 entries)
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
      take: 50,
    });

    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details || "",
      timestamp: new Date(l.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      rawTimestamp: l.createdAt.toISOString(),
      userName: l.user?.name || "System",
      userEmail: l.user?.email || "",
    }));
  } catch (error) {
    console.error("[GET_AUDIT_LOGS]", error);
    return [];
  }
}

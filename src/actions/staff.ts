"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Helper to authenticate staff user and return DB record
async function getAuthenticatedStaff() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in.");
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    throw new Error("Unauthorized: Staff access required.");
  }
  return user;
}

// 1. Get Station Manifest Passengers
export async function getManifest(station: string) {
  try {
    await getAuthenticatedStaff();

    const bookings = await db.booking.findMany({
      where: {
        fromStation: station,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((b) => ({
      id: b.id,
      name: b.passengerName || b.user?.name || "Premium Passenger",
      pnr: b.pnr,
      from: b.fromStation,
      to: b.toStation,
      trainNo: b.trainNo,
      status: b.boardingStatus as "Boarding" | "Checked In" | "On-Board" | "No Show",
      seat: b.seat || "",
    }));
  } catch (error) {
    console.error("[GET_MANIFEST]", error);
    return [];
  }
}

// 2. Update Passenger Boarding Status
export async function updatePassengerBoarding(bookingId: string, status: string) {
  try {
    const staff = await getAuthenticatedStaff();

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        boardingStatus: status,
      },
    });

    // Create an audit log for the action
    await db.auditLog.create({
      data: {
        action: "UPDATE_BOARDING",
        details: `Staff ${staff.name} set PNR ${booking.pnr} status to ${status}`,
        userId: staff.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("[UPDATE_PASSENGER_BOARDING]", error);
    return { error: (error as Error).message || "Failed to update boarding status." };
  }
}

// 3. Broadcast Operations Bulletins / Alerts
export async function broadcastOpsAlert(data: {
  trainNo: string;
  delayMinutes: string;
  alertText: string;
}) {
  try {
    const staff = await getAuthenticatedStaff();

    // Find all users who have an active booking on this train
    const affectedBookings = await db.booking.findMany({
      where: {
        trainNo: data.trainNo,
        status: { not: "CAN" },
      },
      select: {
        userId: true,
        pnr: true,
        trainName: true,
      },
    });

    // Create notifications for all affected passengers
    const notificationPromises = affectedBookings.map((b) =>
      db.notification.create({
        data: {
          title: `Train Alert: ${b.trainName} (${data.trainNo})`,
          message: data.alertText || `Delay status: ${data.delayMinutes} mins.`,
          userId: b.userId,
        },
      })
    );

    await Promise.all(notificationPromises);

    // Save to Audit Log
    await db.auditLog.create({
      data: {
        action: "BROADCAST_ALERT",
        details: `Alert sent to ${affectedBookings.length} passengers on train ${data.trainNo}`,
        userId: staff.id,
      },
    });

    return { success: true, count: affectedBookings.length };
  } catch (error: unknown) {
    console.error("[BROADCAST_OPS_ALERT]", error);
    return { error: (error as Error).message || "Failed to broadcast operations alert." };
  }
}

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
      mealPreference: b.mealPreference,
      mealStatus: b.mealStatus,
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

// 4. Waitlisted Passengers & Seat Re-allocation
export async function getWaitlistPassengers(trainNo: string) {
  try {
    await getAuthenticatedStaff();
    const waitlisted = await db.booking.findMany({
      where: {
        trainNo,
        status: { in: ["WL", "RAC"] },
      },
      orderBy: { createdAt: "asc" },
    });
    return waitlisted.map((b) => ({
      id: b.id,
      name: b.passengerName || "Waitlist Passenger",
      pnr: b.pnr,
      from: b.fromStation,
      to: b.toStation,
      trainNo: b.trainNo,
      status: b.status,
      seat: b.seat || "",
    }));
  } catch (error) {
    console.error("[GET_WAITLIST_PASSENGERS]", error);
    return [];
  }
}

export async function reallocateSeat(noShowBookingId: string, wlBookingId: string) {
  try {
    const staff = await getAuthenticatedStaff();

    const noShowBooking = await db.booking.findUnique({
      where: { id: noShowBookingId },
    });
    if (!noShowBooking) throw new Error("No-show booking not found.");

    const wlBooking = await db.booking.findUnique({
      where: { id: wlBookingId },
    });
    if (!wlBooking) throw new Error("Waitlist booking not found.");

    const vacantSeat = noShowBooking.seat;

    await db.$transaction([
      db.booking.update({
        where: { id: noShowBookingId },
        data: { boardingStatus: "No Show" },
      }),
      db.booking.update({
        where: { id: wlBookingId },
        data: {
          seat: vacantSeat,
          status: "CNF",
          boardingStatus: "Checked In",
        },
      }),
      db.auditLog.create({
        data: {
          action: "SEAT_REALLOCATION",
          details: `Staff ${staff.name} reallocated seat ${vacantSeat} from no-show PNR ${noShowBooking.pnr} to waitlist PNR ${wlBooking.pnr}`,
          userId: staff.id,
        },
      }),
    ]);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("[REALLOCATE_SEAT]", error);
    return { error: (error as Error).message || "Failed to reallocate seat." };
  }
}

// 5. Catering Meal Preferences
export async function updateMealStatus(bookingId: string, status: string) {
  try {
    const staff = await getAuthenticatedStaff();
    const updated = await db.booking.update({
      where: { id: bookingId },
      data: { mealStatus: status },
    });

    await db.auditLog.create({
      data: {
        action: "UPDATE_MEAL_STATUS",
        details: `Staff ${staff.name} updated meal status for PNR ${updated.pnr} to ${status}`,
        userId: staff.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("[UPDATE_MEAL_STATUS]", error);
    return { error: (error as Error).message || "Failed to update meal status." };
  }
}

// 6. Incident Reporting
export async function reportIncident(data: {
  trainNo: string;
  coach: string;
  seatNo?: string;
  category: string;
  description: string;
  severity: string;
}) {
  try {
    const staff = await getAuthenticatedStaff();
    const incident = await db.incident.create({
      data: {
        trainNo: data.trainNo,
        coach: data.coach,
        seatNo: data.seatNo || null,
        category: data.category,
        description: data.description,
        severity: data.severity,
        reportedBy: staff.id,
      },
    });

    await db.auditLog.create({
      data: {
        action: "REPORT_INCIDENT",
        details: `Staff ${staff.name} reported incident: ${data.category} in coach ${data.coach}`,
        userId: staff.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, incident };
  } catch (error: unknown) {
    console.error("[REPORT_INCIDENT]", error);
    return { error: (error as Error).message || "Failed to report incident." };
  }
}

export async function getIncidents(trainNo: string) {
  try {
    await getAuthenticatedStaff();
    const incidents = await db.incident.findMany({
      where: { trainNo },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return incidents.map((i) => ({
      id: i.id,
      trainNo: i.trainNo,
      coach: i.coach,
      seatNo: i.seatNo || "",
      category: i.category,
      description: i.description,
      status: i.status,
      severity: i.severity,
      reporterName: i.user?.name || "Staff Member",
      createdAt: i.createdAt,
    }));
  } catch (error) {
    console.error("[GET_INCIDENTS]", error);
    return [];
  }
}

// 7. Attendance Logs
export async function checkInAttendance(latitude: number, longitude: number, station: string) {
  try {
    const staff = await getAuthenticatedStaff();

    const active = await db.attendance.findFirst({
      where: {
        userId: staff.id,
        checkOut: null,
      },
    });
    if (active) {
      return { error: "Already checked in." };
    }

    const attendance = await db.attendance.create({
      data: {
        userId: staff.id,
        latitude,
        longitude,
        station,
      },
    });

    await db.auditLog.create({
      data: {
        action: "ATTENDANCE_CHECKIN",
        details: `Staff ${staff.name} checked in at ${station} (${latitude}, ${longitude})`,
        userId: staff.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, attendance };
  } catch (error: unknown) {
    console.error("[CHECKIN_ATTENDANCE]", error);
    return { error: (error as Error).message || "Failed to check in." };
  }
}

export async function checkOutAttendance() {
  try {
    const staff = await getAuthenticatedStaff();
    const active = await db.attendance.findFirst({
      where: {
        userId: staff.id,
        checkOut: null,
      },
      orderBy: { checkIn: "desc" },
    });

    if (!active) {
      return { error: "No active check-in found." };
    }

    const attendance = await db.attendance.update({
      where: { id: active.id },
      data: { checkOut: new Date() },
    });

    await db.auditLog.create({
      data: {
        action: "ATTENDANCE_CHECKOUT",
        details: `Staff ${staff.name} checked out from ${attendance.station}`,
        userId: staff.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, attendance };
  } catch (error: unknown) {
    console.error("[CHECKOUT_ATTENDANCE]", error);
    return { error: (error as Error).message || "Failed to check out." };
  }
}

export async function getDutyShifts() {
  try {
    const staff = await getAuthenticatedStaff();
    const shifts = await db.dutyShift.findMany({
      where: { userId: staff.id },
      orderBy: { date: "asc" },
    });
    return shifts.map((s) => ({
      id: s.id,
      trainNo: s.trainNo || "",
      station: s.station,
      date: s.date.toISOString(),
      shiftType: s.shiftType,
      status: s.status,
    }));
  } catch (error) {
    console.error("[GET_DUTY_SHIFTS]", error);
    return [];
  }
}

// 8. Luggage Parcel Tracking
export async function registerLuggage(data: {
  bookingId: string;
  barcode: string;
  weight: number;
  description?: string;
}) {
  try {
    const staff = await getAuthenticatedStaff();
    const luggage = await db.luggage.create({
      data: {
        bookingId: data.bookingId,
        barcode: data.barcode,
        weight: data.weight,
        description: data.description || null,
      },
    });

    await db.auditLog.create({
      data: {
        action: "REGISTER_LUGGAGE",
        details: `Staff ${staff.name} registered luggage (barcode: ${data.barcode}) for booking ${data.bookingId}`,
        userId: staff.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, luggage };
  } catch (error: unknown) {
    console.error("[REGISTER_LUGGAGE]", error);
    return { error: (error as Error).message || "Failed to register luggage." };
  }
}

export async function updateLuggageStatus(luggageId: string, status: string) {
  try {
    const staff = await getAuthenticatedStaff();
    const luggage = await db.luggage.update({
      where: { id: luggageId },
      data: { status },
    });

    await db.auditLog.create({
      data: {
        action: "UPDATE_LUGGAGE_STATUS",
        details: `Staff ${staff.name} updated luggage status for barcode ${luggage.barcode} to ${status}`,
        userId: staff.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, luggage };
  } catch (error: unknown) {
    console.error("[UPDATE_LUGGAGE_STATUS]", error);
    return { error: (error as Error).message || "Failed to update luggage status." };
  }
}

export async function getLuggageList() {
  try {
    await getAuthenticatedStaff();
    const luggageList = await db.luggage.findMany({
      include: {
        booking: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return luggageList.map((l) => ({
      id: l.id,
      bookingId: l.bookingId,
      pnr: l.booking.pnr,
      passengerName: l.booking.passengerName || "Passenger",
      barcode: l.barcode,
      weight: l.weight,
      description: l.description || "",
      status: l.status,
    }));
  } catch (error) {
    console.error("[GET_LUGGAGE_LIST]", error);
    return [];
  }
}

export async function getUniqueTrains() {
  try {
    await getAuthenticatedStaff();
    const bookings = await db.booking.findMany({
      select: {
        trainNo: true,
        trainName: true,
      },
      distinct: ["trainNo"],
    });
    return bookings;
  } catch (error) {
    console.error("[GET_UNIQUE_TRAINS]", error);
    return [];
  }
}

export async function getTrainPassengers(trainNo: string) {
  try {
    await getAuthenticatedStaff();
    const bookings = await db.booking.findMany({
      where: { trainNo },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { seat: "asc" },
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
      mealPreference: b.mealPreference,
      mealStatus: b.mealStatus,
    }));
  } catch (error) {
    console.error("[GET_TRAIN_PASSENGERS]", error);
    return [];
  }
}



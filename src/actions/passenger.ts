"use server";

/**
 * @file passenger.ts
 * @description Server actions handling passenger queries, booking metrics, incident reports,
 * notifications management, and favorite PNR configurations.
 */

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * ============================================================================
 * PASSENGER SERVER ACTIONS
 * ============================================================================
 * Handles passenger ticket booking, fetching user bookings, pinning favorite
 * PNRs, logging recent searches, and fetching real-time notifications.
 */

// Helper to authenticate user and return DB record
async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in.");
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    throw new Error("Unauthorized: User record not found.");
  }
  return user;
}

// 1. Get Passenger Dashboard Metrics
export async function getDashboardMetrics() {
  try {
    const user = await getAuthenticatedUser();

    const bookings = await db.booking.findMany({
      where: { userId: user.id },
    });

    const activeBookings = bookings.filter((b) => b.status !== "CAN");
    const confirmedCount = bookings.filter((b) => b.status === "CNF").length;
    const confirmedRatio = bookings.length > 0
      ? Math.round((confirmedCount / bookings.length) * 100)
      : 100;

    const favoritesCount = await db.favoritePNR.count({
      where: { userId: user.id },
    });

    // Total logged journeys (completed / past bookings)
    const totalJourneys = bookings.length;

    return {
      activeBookingsCount: activeBookings.length,
      confirmedRatio,
      favoritesCount,
      totalJourneys,
    };
  } catch (error: unknown) {
    console.error("[GET_DASHBOARD_METRICS]", error);
    return {
      activeBookingsCount: 0,
      confirmedRatio: 100,
      favoritesCount: 0,
      totalJourneys: 0,
    };
  }
}

// 2. Fetch Passenger Bookings (History & Active Tickets)
export async function getBookings() {
  try {
    const user = await getAuthenticatedUser();
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);
    const ninetyDaysAhead = new Date(now);
    ninetyDaysAhead.setDate(now.getDate() + 90);

    const bookings = await db.booking.findMany({
      where: {
        userId: user.id,
        dateOfJourney: {
          gte: ninetyDaysAgo,
          lte: ninetyDaysAhead,
        },
      },
      orderBy: { dateOfJourney: "desc" },
    });

    // Format dates and fares to match UI component
    return bookings.map((b) => ({
      pnr: b.pnr,
      date: new Date(b.dateOfJourney).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      trainName: b.trainName,
      trainNo: b.trainNo,
      status: b.status as "CNF" | "WL" | "CAN",
      statusText: b.status === "CNF" ? "Confirmed" : b.status === "WL" ? "Waitlisted" : "Cancelled",
      fare: b.trainNo === "12425" ? "₹2,120" : b.trainNo === "12004" ? "₹515" : "₹720",
      // Extra fields for staff portal (luggage registration, boarding display)
      fromStation: b.fromStation,
      toStation: b.toStation,
      seat: b.seat || "",
      boardingStatus: b.boardingStatus,
    }));
  } catch (error) {
    console.error("[GET_BOOKINGS]", error);
    return [];
  }
}

/**
 * 3. Book a Ticket (Passenger Booking Engine)
 * Generates a unique 10-digit PNR, assigns coach & seat berth,
 * creates a Booking record in Prisma DB, and logs an AuditLog entry.
 */
export async function bookTicket(data: {
  trainName: string;
  trainNo: string;
  fromCode: string;
  from: string;
  toCode: string;
  to: string;
  travelClass: string;
  passengerName: string;
}) {
  try {
    const user = await getAuthenticatedUser();

    // Step A: Generate random unique 10-digit PNR string
    const randomPnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Step B: Calculate coach prefix (A1/B2/S1) & seat berth number
    const coach = data.travelClass.includes("3A") ? "B2" : data.travelClass.includes("2A") ? "A1" : "S1";
    const seatNo = Math.floor(Math.random() * 64) + 1;
    const seatString = `${coach}/${seatNo}`;

    // Step C: Create Booking record in PostgreSQL/SQLite database via Prisma ORM
    const booking = await db.booking.create({
      data: {
        pnr: randomPnr,
        trainNo: data.trainNo,
        trainName: data.trainName,
        dateOfJourney: new Date(), // Booked for today's travel window
        fromStation: data.fromCode,
        toStation: data.toCode,
        status: "CNF",
        boardingStatus: "Boarding",
        seat: seatString,
        passengerName: data.passengerName,
        userId: user.id,
      },
    });

    // Step D: Write immutable security Audit Log entry
    await db.auditLog.create({
      data: {
        action: "BOOK_TICKET",
        details: `Booked ticket for PNR ${randomPnr} (${data.trainName})`,
        userId: user.id,
      },
    });

    // Step E: Purge Next.js server cache to update dashboard instantly
    revalidatePath("/dashboard");
    return {
      success: true,
      booking: {
        pnr: booking.pnr,
        trainName: booking.trainName,
        trainNo: booking.trainNo,
        fromStation: booking.fromStation,
        toStation: booking.toStation,
        seat: booking.seat || "",
        boardingStatus: booking.boardingStatus,
        passengerName: booking.passengerName || "",
        status: booking.status,
        dateOfJourney: booking.dateOfJourney.toISOString(),
      },
    };
  } catch (error: unknown) {
    console.error("[BOOK_TICKET]", error);
    return { error: (error as Error).message || "Failed to book ticket." };
  }
}

// 4. Fetch Pinned Favorites
export async function getFavorites() {
  try {
    const user = await getAuthenticatedUser();
    const favorites = await db.favoritePNR.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return favorites.map((f) => ({
      id: f.id,
      pnr: f.pnr,
      label: f.label || "Pinned Route",
    }));
  } catch (error) {
    console.error("[GET_FAVORITES]", error);
    return [];
  }
}

// 5. Add Favorite PNR
export async function addFavorite(pnr: string, label: string) {
  try {
    const user = await getAuthenticatedUser();

    // Check if already in favorites
    const existing = await db.favoritePNR.findFirst({
      where: { userId: user.id, pnr },
    });
    if (existing) {
      return { error: "PNR is already in your favorites." };
    }

    const fav = await db.favoritePNR.create({
      data: {
        pnr,
        label,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      fav: {
        id: fav.id,
        pnr: fav.pnr,
        label: fav.label || "Pinned Route",
      },
    };
  } catch (error: unknown) {
    console.error("[ADD_FAVORITE]", error);
    return { error: (error as Error).message || "Failed to save favorite PNR." };
  }
}

// 6. Remove Favorite PNR
export async function removeFavorite(id: string) {
  try {
    const user = await getAuthenticatedUser();
    await db.favoritePNR.delete({
      where: { id, userId: user.id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("[REMOVE_FAVORITE]", error);
    return { error: (error as Error).message || "Failed to remove favorite." };
  }
}

// 7. Get Recent Searches
export async function getSearchHistory() {
  try {
    const user = await getAuthenticatedUser();
    const searches = await db.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return searches.map((s) => s.query);
  } catch (error) {
    console.error("[GET_SEARCH_HISTORY]", error);
    return [];
  }
}

// 8. Save Search History
export async function saveSearch(pnr: string) {
  try {
    const user = await getAuthenticatedUser();

    // Check if search exists to avoid duplication in short span
    const recent = await db.searchHistory.findFirst({
      where: { userId: user.id, query: pnr },
    });

    if (recent) {
      // Update timestamp
      await db.searchHistory.update({
        where: { id: recent.id },
        data: { createdAt: new Date() },
      });
    } else {
      await db.searchHistory.create({
        data: {
          query: pnr,
          userId: user.id,
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[SAVE_SEARCH]", error);
    return { success: false };
  }
}

// 9. Fetch Notifications
export async function getNotifications() {
  try {
    const user = await getAuthenticatedUser();
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[GET_NOTIFICATIONS]", error);
    return [];
  }
}

// 10. Mark all Notifications as read
export async function markNotificationsAsRead() {
  try {
    const user = await getAuthenticatedUser();
    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[MARK_NOTIFICATIONS_READ]", error);
    return { success: false };
  }
}


/**
 * @file route.ts
 * @description API endpoint to retrieve the live boarding passenger manifest for a specific station.
 * Restricts access to staff or admin users, fetches relevant journey bookings within a 4-day window,
 * and formats the response for consumption by dashboard trackers.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";

/**
 * GET /api/manifest?station=NDLS
 *
 * Returns the live boarding manifest for a given station.
 * Requires staff or admin role. Useful for client-side polling
 * to get real-time boarding status updates without a full server action re-render.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "staff" && user.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden: Staff access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const station = searchParams.get("station") || "NDLS";

    // Date window: ±2 days from today
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - 2);
    const windowEnd = new Date(now);
    windowEnd.setDate(now.getDate() + 2);

    const bookings = await db.booking.findMany({
      where: {
        fromStation: station,
        dateOfJourney: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const manifest = bookings.map((b) => ({
      id: b.id,
      name: b.passengerName || b.user?.name || "Premium Passenger",
      pnr: b.pnr,
      from: b.fromStation,
      to: b.toStation,
      trainNo: b.trainNo,
      status: b.boardingStatus,
      seat: b.seat || "",
      mealPreference: b.mealPreference,
      mealStatus: b.mealStatus,
    }));

    return NextResponse.json({ station, count: manifest.length, manifest });
  } catch (error) {
    console.error("[API_MANIFEST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

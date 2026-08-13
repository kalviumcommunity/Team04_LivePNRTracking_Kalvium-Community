/**
 * @file route.ts
 * @description API endpoint to fetch live PNR (Passenger Name Record) status.
 * Handles validation, logs search history for authenticated users,
 * checks database bookings, and returns mock/real-time PNR journey details.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";

const pnrParamSchema = z.string().regex(/^\d{10}$/, "PNR must be exactly 10 numeric digits.");

export interface PnrPassengerResponse {
  name: string;
  bookingStatus: string;
  currentStatus: string;
}

export interface PnrResponseData {
  pnr: string;
  trainName: string;
  trainNo: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  class: string;
  chartStatus: string;
  platform: string;
  delayStatus: string;
  lastUpdated: string;
  passengers: PnrPassengerResponse[];
}

// Pre-configured PNR Database
const PNR_DATABASE: Record<string, Omit<PnrResponseData, "lastUpdated">> = {
  "4109857123": {
    pnr: "4109857123",
    trainName: "Rajdhani Express",
    trainNo: "12425",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Kanpur Central",
    toCode: "CNB",
    departureTime: "16:55",
    arrivalTime: "21:45",
    date: "23 Dec 2026",
    class: "AC 3 Tier (3A)",
    chartStatus: "Chart Prepared",
    platform: "Platform 16",
    delayStatus: "On Time",
    passengers: [
      { name: "Ramesh Rathore", bookingStatus: "CNF / A1 / 25", currentStatus: "CNF" },
      { name: "Sunita Rathore", bookingStatus: "CNF / A1 / 26", currentStatus: "CNF" },
    ],
  },
  "1234567890": {
    pnr: "1234567890",
    trainName: "Shatabdi Express",
    trainNo: "12004",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Lucknow Jn",
    toCode: "LJN",
    departureTime: "06:10",
    arrivalTime: "12:40",
    date: "24 Dec 2026",
    class: "AC Chair Car (CC)",
    chartStatus: "Chart Prepared",
    platform: "Platform 01",
    delayStatus: "15 Mins Delay",
    passengers: [
      { name: "Suresh Kumar", bookingStatus: "WL / 12", currentStatus: "CNF / C2 / 14" },
    ],
  },
  "7103958261": {
    pnr: "7103958261",
    trainName: "Garib Rath Express",
    trainNo: "12204",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Amritsar Jn",
    toCode: "ASR",
    departureTime: "13:30",
    arrivalTime: "20:05",
    date: "14 Sep 2026",
    class: "AC 3 Tier (3A)",
    chartStatus: "Chart Prepared",
    platform: "Platform 04",
    delayStatus: "On Time",
    passengers: [
      { name: "Aman Gupta", bookingStatus: "RAC / 2", currentStatus: "CNF / G5 / 4" },
    ],
  },
  "9876543210": {
    pnr: "9876543210",
    trainName: "Vande Bharat Express",
    trainNo: "22436",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Varanasi Jn",
    toCode: "BSB",
    departureTime: "06:00",
    arrivalTime: "14:00",
    date: "28 Dec 2026",
    class: "Executive Chair Car (EC)",
    chartStatus: "Chart Prepared",
    platform: "Platform 16",
    delayStatus: "On Time",
    passengers: [
      { name: "Priya Sharma", bookingStatus: "CNF / E1 / 18", currentStatus: "CNF" },
    ],
  },
};

/**
 * GET handler to retrieve status for a single PNR code.
 * Validates parameter format, logs query to search history for logged-in users,
 * checks seed DB and returns PNR response payload.
 *
 * @param request - NextRequest object.
 * @param context - Route params containing the 10-digit PNR.
 * @returns JSON response containing PnrResponseData or validation/server errors.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pnr: string }> }
) {
  try {
    const resolvedParams = await params;
    const pnr = resolvedParams.pnr;

    // Input Validation using Zod
    const validationResult = pnrParamSchema.safeParse(pnr);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid PNR. Please enter a valid 10-digit numeric PNR number.",
        },
        { status: 400 }
      );
    }

    // Log search history if authenticated
    try {
      const session = await auth();
      if (session?.user?.email) {
        const dbUser = await db.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          // Check if search exists to avoid duplication in short span
          const recent = await db.searchHistory.findFirst({
            where: { userId: dbUser.id, query: pnr },
          });

          if (recent) {
            await db.searchHistory.update({
              where: { id: recent.id },
              data: { createdAt: new Date() },
            });
          } else {
            await db.searchHistory.create({
              data: {
                query: pnr,
                userId: dbUser.id,
              },
            });
          }

          // Create an audit log
          await db.auditLog.create({
            data: {
              action: "TRACK_PNR",
              details: `Searched PNR ${pnr}`,
              userId: dbUser.id,
            },
          });
        }
      }
    } catch (e) {
      console.error("Failed to auto-save search history:", e);
    }

    // Lookup PNR in Database or generate dynamic response for valid 10-digit numeric PNR
    let pnrRecord = PNR_DATABASE[pnr];

    if (!pnrRecord) {
      // Query the database to check if a booking exists for this PNR
      try {
        const dbBooking = await db.booking.findUnique({
          where: { pnr },
          include: { user: true }
        });

        if (dbBooking) {
          pnrRecord = {
            pnr,
            trainName: dbBooking.trainName,
            trainNo: dbBooking.trainNo,
            from: dbBooking.fromStation.split(" (")[0] || dbBooking.fromStation,
            fromCode: dbBooking.fromStation.includes("(") ? dbBooking.fromStation.split("(")[1].replace(")", "") : "NDLS",
            to: dbBooking.toStation.split(" (")[0] || dbBooking.toStation,
            toCode: dbBooking.toStation.includes("(") ? dbBooking.toStation.split("(")[1].replace(")", "") : "MMCT",
            departureTime: "21:20",
            arrivalTime: "05:40",
            date: dbBooking.dateOfJourney.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            class: "AC 3 Tier (3A)",
            chartStatus: "Chart Prepared",
            platform: "Platform 4",
            delayStatus: "On Time",
            passengers: [
              { 
                name: dbBooking.passengerName || dbBooking.user?.name || "Passenger 1", 
                bookingStatus: `${dbBooking.status} / ${dbBooking.seat}`, 
                currentStatus: dbBooking.status 
              },
            ],
          };
        }
      } catch (dbErr) {
        console.error("Failed to query DB for booking PNR:", dbErr);
      }
    }

    if (!pnrRecord) {
      // Dynamic generator for any valid 10-digit PNR
      pnrRecord = {
        pnr,
        trainName: "Express Special",
        trainNo: `12${pnr.substring(0, 3)}`,
        from: "New Delhi",
        fromCode: "NDLS",
        to: "Mumbai Central",
        toCode: "MMCT",
        departureTime: "18:00",
        arrivalTime: "08:30",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        class: "AC 3 Tier (3A)",
        chartStatus: "Chart Prepared",
        platform: `Platform ${Math.floor(Math.random() * 12) + 1}`,
        delayStatus: Math.random() > 0.7 ? "10 Mins Delay" : "On Time",
        passengers: [
          { name: "Passenger 1", bookingStatus: "RAC / 4", currentStatus: "CNF / B2 / 34" },
        ],
      };
    }

    const responsePayload: PnrResponseData = {
      ...pnrRecord,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: responsePayload,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error fetching live PNR status.",
      },
      { status: 500 }
    );
  }
}

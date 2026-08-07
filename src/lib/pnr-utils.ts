export interface PnrMetadata {
  pnr: string;
  trainName: string;
  trainNo: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
}

export const PNR_DATABASE_MAP: Record<string, Omit<PnrMetadata, "pnr">> = {
  "4109857123": {
    trainName: "Rajdhani Express",
    trainNo: "12425",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Kanpur Central",
    toCode: "CNB",
  },
  "1234567890": {
    trainName: "Shatabdi Express",
    trainNo: "12004",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Lucknow Jn",
    toCode: "LJN",
  },
  "7103958261": {
    trainName: "Garib Rath Express",
    trainNo: "12204",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Amritsar Jn",
    toCode: "ASR",
  },
  "9876543210": {
    trainName: "Vande Bharat Express",
    trainNo: "22436",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Varanasi Jn",
    toCode: "BSB",
  },
};

export function getPnrMetadata(
  pnr: string,
  label?: string | null,
  booking?: {
    trainName?: string;
    trainNo?: string;
    fromStation?: string;
    toStation?: string;
  }
): PnrMetadata {
  // 1. If active booking exists in database, use booking details
  if (booking && booking.trainName) {
    return {
      pnr,
      trainName: booking.trainName,
      trainNo: booking.trainNo || "12425",
      from: booking.fromStation || "New Delhi",
      fromCode: booking.fromStation || "NDLS",
      to: booking.toStation || "Kanpur Central",
      toCode: booking.toStation || "CNB",
    };
  }

  // 2. If known PNR in catalog database
  const known = PNR_DATABASE_MAP[pnr];
  if (known) {
    return { pnr, ...known };
  }

  // 3. If encoded label contains pipe metadata format (trainName|trainNo|from|fromCode|to|toCode)
  if (label && label.includes("|")) {
    const parts = label.split("|");
    if (parts.length >= 6) {
      return {
        pnr,
        trainName: parts[0],
        trainNo: parts[1],
        from: parts[2],
        fromCode: parts[3],
        to: parts[4],
        toCode: parts[5],
      };
    }
  }

  // 4. Default dynamic fallback for arbitrary 10-digit PNR
  return {
    pnr,
    trainName: label && !label.includes("|") ? label : "Express Special",
    trainNo: `12${pnr.substring(0, 3)}`,
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Mumbai Central",
    toCode: "MMCT",
  };
}

export function isValidPnr(pnr: string): boolean {
  return /^\d{10}$/.test(pnr);
}

export function formatPnr(pnr: string): string {
  if (!isValidPnr(pnr)) return pnr;
  return `${pnr.slice(0, 3)}-${pnr.slice(3, 6)}-${pnr.slice(6)}`;
}

export function getSeatClassBadge(travelClass: string): string {
  if (travelClass.includes("1A") || travelClass.includes("Executive")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200";
  }
  if (travelClass.includes("2A")) {
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200";
  }
  if (travelClass.includes("3A")) {
    return "bg-[#c05621]/10 text-[#c05621] dark:bg-orange-950/40 dark:text-orange-300 border-amber-200";
  }
  return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200";
}

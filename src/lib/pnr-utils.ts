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

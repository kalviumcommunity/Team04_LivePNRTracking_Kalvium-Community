import { describe, it, expect } from "vitest";
import { getPnrMetadata } from "@/lib/pnr-utils";

describe("PNR Metadata Resolution", () => {
  it("resolves exact train details for known database PNRs", () => {
    const meta = getPnrMetadata("4109857123");
    expect(meta.trainName).toBe("Rajdhani Express");
    expect(meta.trainNo).toBe("12425");
    expect(meta.fromCode).toBe("NDLS");
    expect(meta.toCode).toBe("CNB");
  });

  it("resolves train details from custom pipe-separated metadata string", () => {
    const pipeEncoded = "Duronto Express|12260|Sealdah|SDAH|BCT|MMCT";
    const meta = getPnrMetadata("5555555555", pipeEncoded);
    expect(meta.trainName).toBe("Duronto Express");
    expect(meta.trainNo).toBe("12260");
    expect(meta.from).toBe("Sealdah");
    expect(meta.fromCode).toBe("SDAH");
    expect(meta.to).toBe("BCT");
    expect(meta.toCode).toBe("MMCT");
  });

  it("falls back to default metadata generation for unknown 10-digit PNRs", () => {
    const meta = getPnrMetadata("8888888888", "Custom Label");
    expect(meta.pnr).toBe("8888888888");
    expect(meta.trainName).toBe("Custom Label");
    expect(meta.trainNo).toBe("12888");
  });

  it("prioritizes database booking parameters when present", () => {
    const booking = {
      trainName: "Tejas Express",
      trainNo: "82501",
      fromStation: "LKO",
      toStation: "NDLS",
    };
    const meta = getPnrMetadata("4109857123", undefined, booking);
    expect(meta.trainName).toBe("Tejas Express");
    expect(meta.trainNo).toBe("82501");
    expect(meta.fromCode).toBe("LKO");
    expect(meta.toCode).toBe("NDLS");
  });
});

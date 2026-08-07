import { describe, it, expect } from "vitest";
import { isValidPnr, formatPnr, getSeatClassBadge } from "@/lib/pnr-utils";

describe("PNR Utility Functions", () => {
  it("validates 10-digit numeric PNR correctly", () => {
    expect(isValidPnr("4109857123")).toBe(true);
    expect(isValidPnr("1234567890")).toBe(true);
    expect(isValidPnr("12345")).toBe(false);
    expect(isValidPnr("410985712A")).toBe(false);
    expect(isValidPnr("")).toBe(false);
  });

  it("formats 10-digit PNR into standard hyphenated display", () => {
    expect(formatPnr("4109857123")).toBe("410-985-7123");
    expect(formatPnr("1234567890")).toBe("123-456-7890");
    expect(formatPnr("short")).toBe("short");
  });

  it("returns appropriate badge color classes for travel classes", () => {
    expect(getSeatClassBadge("1A")).toContain("bg-purple");
    expect(getSeatClassBadge("2A")).toContain("bg-indigo");
    expect(getSeatClassBadge("3A")).toContain("bg-[#c05621]");
    expect(getSeatClassBadge("SL")).toContain("bg-amber");
  });
});

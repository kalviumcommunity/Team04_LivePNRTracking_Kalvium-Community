import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  applyTheme,
  getSavedTheme,
  applyTextScaling,
  getSavedTextScaling,
  applyReducedMotion,
  getSavedReducedMotion,
  applyHighContrast,
  getSavedHighContrast,
} from "@/lib/theme-utils";

function createDomMock() {
  const store: Record<string, string> = {};
  const classList = new Set<string>();
  const rootStyle: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
  };

  const mockDocument = {
    documentElement: {
      classList: {
        add: (...names: string[]) => names.forEach((n) => classList.add(n)),
        remove: (...names: string[]) => names.forEach((n) => classList.delete(n)),
        contains: (name: string) => classList.has(name),
      },
      className: "",
      style: rootStyle,
    },
  };

  return { mockLocalStorage, mockDocument, classList, store };
}

describe("Theme & Preference Utilities", () => {
  let domMock: ReturnType<typeof createDomMock>;

  beforeEach(() => {
    domMock = createDomMock();
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", domMock.mockDocument);
    vi.stubGlobal("localStorage", domMock.mockLocalStorage);
  });


  describe("Theme Management", () => {
    it("defaults to light theme when nothing is stored", () => {
      expect(getSavedTheme()).toBe("light");
    });

    it("applies dark mode class to root element and persists to localStorage", () => {
      applyTheme("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(localStorage.getItem("theme")).toBe("dark");
      expect(getSavedTheme()).toBe("dark");
    });

    it("applies sahara theme class for light mode", () => {
      applyTheme("light");
      expect(document.documentElement.classList.contains("theme-sahara")).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(getSavedTheme()).toBe("light");
    });
  });

  describe("Text Scaling", () => {
    it("defaults to medium scaling", () => {
      expect(getSavedTextScaling()).toBe("medium");
    });

    it("applies small scaling with 14px font size", () => {
      applyTextScaling("small");
      expect(document.documentElement.classList.contains("text-scale-small")).toBe(true);
      expect(document.documentElement.style.fontSize).toBe("14px");
      expect(getSavedTextScaling()).toBe("small");
    });

    it("applies large scaling with 18px font size", () => {
      applyTextScaling("large");
      expect(document.documentElement.classList.contains("text-scale-large")).toBe(true);
      expect(document.documentElement.style.fontSize).toBe("18px");
      expect(getSavedTextScaling()).toBe("large");
    });
  });

  describe("Accessibility Preferences", () => {
    it("handles reduced motion toggle", () => {
      expect(getSavedReducedMotion()).toBe(false);
      applyReducedMotion(true);
      expect(document.documentElement.classList.contains("reduced-motion")).toBe(true);
      expect(getSavedReducedMotion()).toBe(true);

      applyReducedMotion(false);
      expect(document.documentElement.classList.contains("reduced-motion")).toBe(false);
      expect(getSavedReducedMotion()).toBe(false);
    });

    it("handles high contrast toggle", () => {
      expect(getSavedHighContrast()).toBe(false);
      applyHighContrast(true);
      expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
      expect(getSavedHighContrast()).toBe(true);

      applyHighContrast(false);
      expect(document.documentElement.classList.contains("high-contrast")).toBe(false);
      expect(getSavedHighContrast()).toBe(false);
    });
  });
});

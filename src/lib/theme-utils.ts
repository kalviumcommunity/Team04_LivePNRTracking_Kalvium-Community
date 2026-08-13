/**
 * @file theme-utils.ts
 * @description Utility functions for managing user interface customization preferences 
 * including theme mode (light/dark), text scaling size, reduced motion, and high contrast settings.
 * Preferences are persisted via localStorage and applied as classes/styles on document element.
 */

export type ThemeMode = "light" | "dark";
export type TextScaleMode = "small" | "medium" | "large";

/**
 * Applies the specified theme mode (light or dark) to the document root element.
 * Persists the preference in localStorage.
 *
 * @param mode - The theme mode to apply ("light" | "dark").
 */
export function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  localStorage.setItem("theme", mode);

  root.classList.remove("dark", "theme-sahara", "theme-system");

  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.add("theme-sahara");
  }
}

/**
 * Retrieves the saved theme mode from localStorage.
 * Defaults to "light" if not set or during server-side rendering.
 *
 * @returns The saved ThemeMode ("light" | "dark").
 */
export function getSavedTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    return "dark";
  }
  return "light";
}

/**
 * Applies text scaling styles to the document root based on selection.
 * Adjusts font-size and applies appropriate CSS class.
 *
 * @param scale - The desired text scale mode ("small" | "medium" | "large").
 */
export function applyTextScaling(scale: TextScaleMode) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  localStorage.setItem("textScale", scale);

  root.classList.remove("text-scale-small", "text-scale-medium", "text-scale-large");

  if (scale === "small") {
    root.classList.add("text-scale-small");
    root.style.fontSize = "14px";
  } else if (scale === "large") {
    root.classList.add("text-scale-large");
    root.style.fontSize = "18px";
  } else {
    root.classList.add("text-scale-medium");
    root.style.fontSize = "16px";
  }
}

/**
 * Retrieves the saved text scaling preference from localStorage.
 * Defaults to "medium".
 *
 * @returns The TextScaleMode.
 */
export function getSavedTextScaling(): TextScaleMode {
  if (typeof window === "undefined") return "medium";
  const saved = localStorage.getItem("textScale");
  if (saved === "small" || saved === "large" || saved === "medium") {
    return saved;
  }
  return "medium";
}

/**
 * Enables or disables reduced motion styling to respect user's accessibility choice.
 *
 * @param enabled - True to minimize/disable UI transitions and animations.
 */
export function applyReducedMotion(enabled: boolean) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  localStorage.setItem("reducedMotion", enabled ? "true" : "false");
  if (enabled) {
    root.classList.add("reduced-motion");
  } else {
    root.classList.remove("reduced-motion");
  }
}

/**
 * Retrieves saved reduced motion preference.
 *
 * @returns True if reduced motion is enabled, false otherwise.
 */
export function getSavedReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("reducedMotion") === "true";
}

/**
 * Enables or disables high contrast styling for improved text legibility.
 *
 * @param enabled - True to enable high contrast theme filters.
 */
export function applyHighContrast(enabled: boolean) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  localStorage.setItem("highContrast", enabled ? "true" : "false");
  if (enabled) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }
}

/**
 * Retrieves saved high contrast preference.
 *
 * @returns True if high contrast mode is enabled, false otherwise.
 */
export function getSavedHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("highContrast") === "true";
}


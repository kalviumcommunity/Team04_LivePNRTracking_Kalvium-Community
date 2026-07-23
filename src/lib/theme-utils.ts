export type ThemeMode = "light" | "dark";
export type TextScaleMode = "small" | "medium" | "large";

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

export function getSavedTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    return "dark";
  }
  return "light";
}

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

export function getSavedTextScaling(): TextScaleMode {
  if (typeof window === "undefined") return "medium";
  const saved = localStorage.getItem("textScale");
  if (saved === "small" || saved === "large" || saved === "medium") {
    return saved;
  }
  return "medium";
}

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

export function getSavedReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("reducedMotion") === "true";
}

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

export function getSavedHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("highContrast") === "true";
}


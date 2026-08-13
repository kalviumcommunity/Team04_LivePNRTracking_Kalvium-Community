/**
 * @file utils.ts
 * @description Helper utilities for the application. Contains the class names merger utility.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to dynamically merge Tailwind CSS class names.
 * Combines conditional classes using clsx and resolves Tailwind conflicts with twMerge.
 *
 * @param inputs - An array of class values to combine.
 * @returns A clean space-separated CSS class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

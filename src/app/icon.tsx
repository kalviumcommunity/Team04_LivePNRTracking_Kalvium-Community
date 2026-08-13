/**
 * @file icon.tsx
 * @description Dynamic favicon/app icon generator using Next.js ImageResponse (OpenGraph/OG).
 * Dynamically draws an SVG train icon over an orange gradient.
 */

import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

/**
 * Renders the application icon as a PNG image stream.
 *
 * @returns ImageResponse containing the generated visual.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #ff9b00 0%, #ff4f00 100%)",
          borderRadius: "36%",
          padding: "5px",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="16" height="16" x="4" y="3" rx="2" />
          <path d="M4 11h16" />
          <path d="M12 3v8" />
          <path d="m8 19-2 3" />
          <path d="m18 22-2-3" />
          <path d="M8 15h.01" />
          <path d="M16 15h.01" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

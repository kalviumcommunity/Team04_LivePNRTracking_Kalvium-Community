---
name: Precision Velocity
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5e3f3c'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#936e6a'
  outline-variant: '#e8bcb7'
  surface-tint: '#c00014'
  primary: '#bb0013'
  on-primary: '#ffffff'
  primary-container: '#e71621'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4ab'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#0052d1'
  on-tertiary: '#ffffff'
  tertiary-container: '#156aff'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000d'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#dae1ff'
  tertiary-fixed-dim: '#b3c5ff'
  on-tertiary-fixed: '#001849'
  on-tertiary-fixed-variant: '#003fa4'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  base-unit: 4px
---

## Brand & Style
The design system is engineered for high-trust travel management, prioritizing performance, reliability, and clarity. It targets frequent travelers and logistics-focused users who require immediate access to real-time data without cognitive friction. 

The aesthetic is **Corporate / Modern**, leaning into a highly systematic and utility-driven interface. It utilizes a refined structural approach with ample white space, ensuring that Ixigo’s signature red acts as a precise signal for action and branding rather than an overwhelming decorative element. The interface should feel fast, responsive, and authoritative, evoking a sense of calm control over complex travel itineraries.

## Colors
This design system utilizes a high-contrast functional palette centered around Ixigo Red.

- **Primary (Ixigo Red):** Reserved for primary actions, critical status alerts, and brand identity markers.
- **Secondary (Deep Graphite):** Used for primary headings and high-emphasis text to ensure maximum legibility.
- **Tertiary (Action Blue):** Employed for links and secondary interactive elements to distinguish them from brand-led primary actions.
- **Neutral Scale:** A strictly neutral grayscale is used for surfaces (`#F8F9FA`), borders (`#E0E0E0`), and secondary text. 

**Functional Status Colors:**
- **Success:** `#10B981` (Confirmed status, on-time arrivals).
- **Warning:** `#F59E0B` (RAC, minor delays).
- **Critical:** `#EC1C24` (Waitlisted, cancelled).

## Typography
The system uses **Inter** exclusively to maintain a systematic, neutral, and utilitarian feel. The hierarchy is strictly enforced to manage data-dense environments.

- **Headlines:** Use semi-bold (600) weights to establish clear content sections. Tighten letter spacing on larger sizes to maintain a professional, "locked-in" appearance.
- **Body:** Standardized at 16px for desktop readability. Data-heavy tables should drop to `body-sm` (14px) to increase information density without sacrificing legibility.
- **Labels:** Caps are used for metadata and status badges to differentiate them from interactive text.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop (12 columns) and a **Fluid Grid** on mobile.

- **Grid:** 12-column layout with 24px gutters. Elements should align to the grid to create a sense of mathematical order and reliability.
- **Rhythm:** An 8px linear scale is used for all padding and margins, with a 4px "half-step" allowed for tight component internals (e.g., checkbox to label spacing).
- **Responsiveness:**
  - **Desktop (>1024px):** 12 columns, 32px side margins.
  - **Tablet (768px - 1023px):** 8 columns, 24px side margins.
  - **Mobile (<767px):** 4 columns, 16px side margins. Horizontal scrolling is permitted for large data tables.

## Elevation & Depth
To maintain high trust and professional clarity, the design system avoids heavy shadows or trendy blurs. It relies on **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface Levels:** 
  - Level 0 (Background): `#F8F9FA`
  - Level 1 (Cards/Containers): `#FFFFFF`
- **Outlines:** All containers, inputs, and cards use a 1px solid border (`#E0E0E0`).
- **Shadows:** Only used on active "floating" elements like dropdown menus or date pickers. Use a singular, highly-diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`.
- **Depth:** Established by contrast rather than physical height. A primary button sits "on top" of the page because of its Ixigo Red fill, not because of its shadow.

## Shapes
The shape language is **Soft** and precise. 

- **Components:** Standard buttons and input fields use a 4px (`0.25rem`) radius. This maintains a professional, slightly technical feel while avoiding the harshness of sharp corners.
- **Large Elements:** Cards and major dashboard sections use an 8px (`0.5rem`) radius.
- **Status Badges:** Status badges use a 2px radius or remain sharp to signal their data-driven nature, distinguishing them from interactive buttons.

## Components
- **Buttons:** 
  - Primary: Solid Ixigo Red fill, white text, 4px radius. 
  - Secondary: 1px border (`#E0E0E0`), Graphite text.
- **Data Tables:** High-density rows (48px height). Headers in `label-md` with a light gray background (`#F1F3F4`). Alternate row striping is discouraged; use subtle 1px dividers instead.
- **Status Badges:** Small, rectangular tags with low-opacity background tints of the status color (e.g., Confirmed uses 10% Green fill with 100% Green text).
- **Search Inputs:** Interactive "Travel Search" bars should use large, clear icons and a distinct focus state—a 2px Ixigo Red bottom border or subtle inner glow.
- **Progress Indicators:** Linear trackers for multi-city bookings, using Ixigo Red for completed steps and Grey for upcoming ones.
- **Cards:** White background, 1px border, 8px padding. Used for individual trip segments or booking summaries.
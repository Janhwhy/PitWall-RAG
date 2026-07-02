---
name: PitWall
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e9bcb5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#af8781'
  outline-variant: '#5e3f3a'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#680200'
  primary-container: '#e10600'
  on-primary-container: '#fff2f0'
  inverse-primary: '#c00500'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#717070'
  on-tertiary-container: '#f8f5f4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410100'
  on-primary-fixed-variant: '#930300'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.08em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar_width: 240px
  navbar_height: 48px
  container_gap: 16px
  mobile_margin: 12px
  desktop_margin: 24px
---

## Brand & Style
The design system is engineered for high-stakes, split-second decision-making. It adopts an **Ultra-Dark Engineering** aesthetic that prioritizes data legibility and reduced eye strain in low-light race control environments. The personality is precise, technical, and urgent, drawing inspiration from high-performance telemetry interfaces and aerospace HUDs.

The style leans into a refined **Minimalism** with **High-Contrast** accents. It uses a monochromatic foundation to ensure that the signature racing red and functional status colors (green for "Box", yellow for "Caution") command immediate attention. Visual noise is eliminated to ensure that strategy-critical data is never obscured.

## Colors
The palette is rooted in an absolute-dark ecosystem. 
- **Core Background:** `#0a0a0a` provides a void-like canvas that eliminates light bleed.
- **Surface Tier 1:** `#141414` is used for cards and structural containers.
- **Surface Tier 2:** `#1a1a1a` identifies hover states, active menu items, and elevated inputs.
- **Accents:** `#e10600` (F1 Red) is reserved strictly for primary actions, branding markers, and urgent alerts.
- **Data Status:** Standardized green (`#00ff41`) for "Go/Safe" and yellow (`#ffeb3b`) for "Caution" to follow international racing signals.

## Typography
The system utilizes **Inter** for its exceptional legibility at small sizes and high-density layouts. 
- **Headings:** Pure white (`#ffffff`) to ensure maximum contrast against the dark background.
- **Metadata/Labels:** Mid-tone grey (`#a0a0a0`) to create a clear hierarchy between titles and supplementary information.
- **Data Points:** Where precise numerical alignment is required (lap times, intervals), a monospaced variant is permitted to prevent character jumping during live updates.
- **Case:** Use Uppercase for labels and category headers to reinforce the "instrument panel" feel.

## Layout & Spacing
The layout follows a **Fixed-Fluid** hybrid model:
- **Desktop:** A fixed 240px left sidebar for navigation and a 48px top bar for global status. The main dashboard area utilizes a 12-column fluid grid for data widgets.
- **Mobile (<768px):** The sidebar is replaced by a bottom tab bar for thumb-driven navigation. Margins contract to 12px to maximize screen real estate.
- **Rhythm:** An 8px base spacing scale ensures mathematical consistency across all paddings and gutters. Data tables should use condensed row heights (32px - 40px) to allow for maximum information density without scrolling.

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layering** rather than traditional shadows.
- **Level 0:** Background (`#0a0a0a`).
- **Level 1:** Cards and Containers (`#141414`) with a subtle 1px border of `#2a2a2a` to define edges.
- **Level 2:** Modals and Popovers (`#1c1c1c`) using a slight drop shadow (0px 4px 20px rgba(0,0,0,0.5)) to separate from the main surface.
- **Indicators:** Strategy cards utilize a 4px solid left border in Primary Red to denote "active" or "primary" strategic paths.

## Shapes
The shape language is **Soft** but utilitarian. 
- **Standard Radius:** 4px (`0.25rem`) for cards, buttons, and inputs to maintain a technical, sharp-edged feel.
- **Status Pills:** Fully rounded (pill-shaped) to differentiate them from actionable buttons.
- **Tire Compound Badges:** Circular icons with a 2px stroke matching the compound color (Red/Yellow/White/Green).

## Components
- **Buttons:** Primary buttons are solid `#e10600` with white text. Ghost buttons use a white outline with 10% opacity white fill on hover.
- **Strategy Cards:** Surface `#141414` with a 4px left-accent border in Red. Headers within cards should use `label-caps`.
- **Chat Interface:** User bubbles are outlined; AI response cards use a Surface Tier 2 (`#1a1a1a`) background with an "AI Agent" badge in the metadata row.
- **Status Pills:** Small, high-saturation indicators. Red for "Danger/Stop," Green for "Optimal," and White for "Neutral."
- **Data Tables:** Zebra striping is avoided; use 1px bottom borders in `#1f1f1f`. Tire compound columns use circular color-coded badges.
- **Accordions:** Flat styling with a right-aligned chevron. The chevron turns Primary Red when the section is expanded.
- **Skeleton Loaders:** A subtle shimmer moving from `#141414` to `#1c1c1c`. No high-contrast flashes.
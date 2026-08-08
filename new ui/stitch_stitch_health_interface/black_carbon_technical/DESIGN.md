---
name: Black Carbon Technical
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#e9bcb5'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
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
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#b4c5ff'
  on-tertiary: '#002a77'
  tertiary-container: '#0163ff'
  on-tertiary-container: '#f4f4ff'
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
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174a'
  on-tertiary-fixed-variant: '#003ea7'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
  background-base: '#0a0a0b'
  background-surface: '#111114'
  background-surface-elevated: '#1c1c1c'
  f1-red: '#e10600'
  f1-red-hover: '#e8001d'
  status-go: '#00d21d'
  status-caution: '#fffb00'
  status-stop: '#ff1801'
  border-rim: rgba(255, 255, 255, 0.08)
  glass-overlay: rgba(16, 16, 18, 0.7)
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  telemetry-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-desktop: 32px
  margin-mobile: 16px
  sidebar-width: 240px
  topbar-height: 48px
---

## Brand & Style

The design system is engineered to evoke the high-stakes, data-saturated environment of a Formula 1 pit wall. It prioritizes technical precision, urgency, and professional-grade utility. The aesthetic is "Ultra-Dark Carbon," characterized by deep, layered blacks and high-visibility red accents that draw inspiration from telemetry dashboards and cockpit instrumentation.

The style is a hybrid of **Minimalism** and **Glassmorphism**, using translucent overlays and subtle rim lighting to create depth without relying on traditional shadows. This approach ensures the UI feels like a seamless digital HUD, where information is prioritized through contrast and typographic hierarchy rather than decorative elements.

- **Target Audience:** Race strategists, data analysts, and F1 enthusiasts.
- **Emotional Response:** Sharp, authoritative, high-performance, and immersive.
- **Visual Style:** Data-dense, technical, and high-contrast.

## Colors

The palette is strictly dark-mode, leveraging a "Black Carbon" foundation. 

- **Primary:** F1 Racing Red (`#e10600`) is used sparingly for critical actions, live indicators, and brand highlights.
- **Backgrounds:** A tiered system of near-blacks creates depth. The base level is `#0a0a0b`, with elevated surfaces using `#111114` and `#1c1c1c`.
- **Status Colors:** Standardized racing flags guide the user—Green for optimal performance/data, Yellow for caution/incidents, and Red for DNF or critical errors.
- **Accents:** Borders use a "rim-light" effect (subtle white at low opacity) to define edges against the dark background, mimicking the way light catches carbon fiber edges.

## Typography

This system employs a tri-font strategy to balance character, readability, and technical utility.

1.  **Space Grotesk (Headings):** Used for primary page titles and section headers. Its geometric quirks provide a futuristic, technical edge.
2.  **Inter (UI/Body):** The workhorse font for all descriptive text, navigational elements, and interface labels. It ensures maximum legibility in dense layouts.
3.  **JetBrains Mono (Telemetry/Numbers):** Critical for the "Pit Wall" experience. All lap times, gaps, points, and tire percentages must use JetBrains Mono to ensure tabular figures align perfectly and do not "jump" during live updates.

**Scale:** Headline sizes scale down by approximately 20% on mobile devices to maintain readability without overwhelming the screen.

## Layout & Spacing

The layout is designed for high data density, utilizing an **8px linear rhythm**. 

- **Desktop:** A 12-column fluid grid system with a fixed 240px sidebar. Data tables are condensed (row heights between 32px and 40px) to allow for maximum information visibility without scrolling.
- **Mobile:** The layout reflows into a single column. The sidebar is replaced by a high-visibility bottom navigation bar. Margins are reduced to 16px to maximize the narrow horizontal space.
- **Grids:** Use a 16px gutter between cards and table columns. Strategy chat cards should span the full width of the content area to provide space for multi-agent responses.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Subtle Glassmorphism**.

- **Layers:** Surface elevations are indicated by becoming progressively lighter. Background (`#0a0a0b`) -> Card Surface (`#111114`) -> Active/Hover State (`#1c1c1c`).
- **Rim Lighting:** Elevated elements do not use heavy shadows. Instead, they feature a 1px solid border using `rgba(255, 255, 255, 0.08)`. This creates a crisp, metallic edge that suggests physical structure.
- **Glass Effects:** Modals and navigation bars use a backdrop blur (12px - 20px) with a semi-transparent dark fill (`glass-overlay`). This maintains the "cockpit" feel, suggesting a screen overlaying a live feed.

## Shapes

The shape language is "Soft-Technical." 

- **Cards and Inputs:** A uniform 4px corner radius is used to maintain a rigid, engineering-focused look while avoiding the harshness of 90-degree corners.
- **Status Chips:** Specifically for tire compounds (Soft/Medium/Hard) and status indicators, use pill-shaped (fully rounded) containers to differentiate them from functional UI components.
- **Buttons:** Follow the 4px radius standard. Large action buttons may use a clipped-corner aesthetic (via CSS clip-path) for primary brand moments to further emphasize the racing theme.

## Components

- **Buttons:** Primary buttons use a solid F1 Red background with white text. Secondary buttons are ghost-style with the 1px rim border.
- **Data Tables:** Highly condensed. Use JetBrains Mono for all numerical columns. Alternate row striping is not needed; use the 1px rim-light bottom border for row separation.
- **Tire Chips:** Circular or pill-shaped with a thick border in the compound color (Red for Soft, Yellow for Medium, White for Hard, Green for Inter, Blue for Wet).
- **Strategy Cards:** AI agent responses should be contained in cards with a subtle glassmorphism effect. Each agent (Tyre, Weather, etc.) should have a specific badge with its own iconography.
- **Countdown Timer:** Large-scale display using JetBrains Mono, placed in the Hero section of the dashboard.
- **Input Fields:** Darker than the card surface (`#0a0a0b`) with a 1px border that turns F1 Red on focus.
- **Skeletons:** Low-contrast shimmer using a gradient from `#111114` to `#1c1c1c`. Avoid any bright flashes.
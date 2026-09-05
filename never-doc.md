# Never Do (Anti-Patterns & Rules)

This document contains strictly forbidden patterns, UI elements, and practices that must NEVER be used or introduced into the Smyl application.

---

## 1. Icons to Never Use
- **NEVER use thunderbolt / lightning icons** (e.g. `IoFlashOutline`, `IoFlash`, or any lightning bolt variant) anywhere in the application.
- **NEVER use sparkles icons** (e.g. `IoSparklesOutline`, `IoSparkles`, `HiSparkles`, `LuSparkles`) anywhere in the application.
- **NEVER use emojis** in UI controls, layouts, pills, buttons, or section headers.

---

## 2. Section Headers & Layout Badges
- **NEVER add section eyebrow pills / badges** on top of headings (e.g., pill badges with icons like `Quality Comparison`, `Fast 3-Step Process`, `Social Post Card Studio`, etc.).
- Keep section headings clean, direct, and uncluttered without floating category pills or icons beside them.

---

## 3. Cards & Steps
- **NEVER duplicate numbering** (e.g., showing a numbered badge `1` alongside a heading that says `1. Step Name`). Replace the badge with the appropriate clean feature icon.
- **NEVER use top border accent bars or progress lines** across individual feature cards. Use clean, elevated cards with subtle lift/hover states instead.
- **NEVER use harsh black backgrounds for main brand CTA blocks** when the brand color palette specifies `#0145F2` Brand Blue.

---

## 4. Buttons
- **NEVER use arbitrary or inconsistent button widths**. Use standardized, consistent fixed/proportional widths for primary and secondary actions as defined in `design-system.md`.
- **NEVER modify or auto-update `design-system.md`** without explicit instructions.

---

## 5. Post Cards & Generator
- **NEVER use plain text cheap watermarks** like "Smyl Card" text. Always use the authentic Smyl SVG vector logo in brand blue or subtle theme opacity.
- **NEVER omit the watermark from LinkedIn cards** — watermarks must appear consistently across both X and LinkedIn.
- **NEVER make the watermark high-contrast/bright**. Always keep it subtly faded (`opacity-40` to `opacity-60`).
- **NEVER allow canvas padding to only affect height**. Canvas padding must apply symmetrically across both width (X-axis) and height (Y-axis).
- **NEVER let post content overlap or crowd the engagement metrics bar**. Engagement bars must always be responsive and dynamically positioned with clean spacing below the text area.
- **NEVER force text input into secondary top input bars on the hero demo** when users can type and edit directly inside the card itself.

---

## 6. General Rules
- Always verify against `design-system.md` and `never-doc.md` before implementing any feature.

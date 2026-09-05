# Project Directives: What to NEVER Do

## 1. Icon Generation & Fake Icon Hack Ban
- **NEVER** generate custom SVG icons, emoji substitutes, or artificial multi-color circles with shapes inside them to imitate platform icons or reaction emojis.
- **NEVER** use CSS hacks (e.g. tiny colored circle divs with arbitrary letters or clip paths) to create pseudo-icons.
- **ALWAYS** import authentic, crisp icons directly from `lucide-react` or the established icon library (`react-icons/io5`).
- Ensure icons use standard currentColor, precise stroke widths (`stroke-[1.75]` to `stroke-[2]`), and native vector scalability without weird background blobs.

## 2. Card Visual Purity
- **NEVER** apply hover animations (`whileHover`, `hover:scale-105`, `hover:translate-y`) to elements inside cards intended for static screenshot/export generation.
- The exported card must remain pixel-exact, stable, and visually pristine in both Preview and Direct Edit modes.

## 3. Layout Stability
- **NEVER** allow card dimensions, scale, or font metrics to shift or jump when toggling between Live Preview Mode and Direct Edit Mode.
- Inputs and textareas in Direct Edit Mode must strictly inherit typography, line-height, margin, and padding from the preview layout.

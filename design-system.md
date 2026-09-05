# Design System

## 1. Color Tokens

### Brand
| Token | Value |
|---|---|
| Brand Primary | `#0145F2` |
| Brand Hover | `#0039D4` |
| Brand Pressed | `#0030B8` |
| Brand Soft | `#E8EEFF` |

### Backgrounds
| Token | Value |
|---|---|
| Canvas | `#EDF1F5` |
| Surface | `#FFFFFF` |
| Surface Elevated | `#FFFFFF` |
| Surface Dark | `#111418` |

### Text
| Token | Value |
|---|---|
| Primary | `#17191C` |
| Secondary | `#626A73` |
| Tertiary | `#8D959F` |
| Muted | `#B0B6BD` |
| Inverse | `#FFFFFF` |

### Borders
| Token | Value |
|---|---|
| Default | `#E1E5E9` |
| Subtle | `#ECEEF1` |
| Hover | `#B9C0C8` |
| Focus | `#0145F2` |

### Semantic
| Token | Value |
|---|---|
| Success | `#2E9B62` |
| Warning | `#D99422` |
| Error | `#D94A4A` |

---

## 2. Typography

**Font:** DM Sans

### Website
| Style | Size | Weight |
|---|---:|---:|
| H1 | `64px` | 700 |
| H2 | `48px` | 700 |
| H3 | `40px` | 600 |
| SH1 | `24px` | 600 |
| SH2 | `20px` | 600 |
| SH3 | `16px` | 600 |
| P | `18px` | 400 |

### Mobile
| Style | Size | Weight |
|---|---:|---:|
| H1 | `32px` | 700 |
| H2 | `24px` | 700 |
| H3 | `20px` | 600 |
| SH1 | `18px` | 600 |
| SH2 | `16px` | 600 |
| SH3 | `16px` | 600 |
| P | `16px` | 400 |

**Rules:** Do not introduce additional type sizes. Use the defined styles consistently. Body text must not be below `14px`.

---

## 3. Buttons

Only three button types are permitted.

### A. Navigation / Link
Used for navigation, tabs, text actions, and non-primary links.

- Background: transparent
- Text: `Brand Primary`
- Border: none
- Hover: text becomes `Brand Hover`
- Active: text becomes `Brand Pressed`
- Disabled: `Muted`
- No filled background unless an active navigation state requires one.

### B. Submit / Primary
Used for actions that submit, create, save, generate, publish, confirm, or complete a task.

**Default**
- Background: `Brand Primary`
- Text: `Inverse`
- Border: none

**Hover**
- Background: `Brand Hover`

**Pressed**
- Background: `Brand Pressed`

**Disabled**
- Background: `#D6DEEF`
- Text: `#8794AD`
- No interaction

**Success**
- Background: `Success`
- Text: `Inverse`
- Use only after a successful response; do not use as the permanent primary color.

**Warning**
- Background: `Warning`
- Text: `Inverse`
- Use when the action requires attention or confirmation.

**Error**
- Background: `Error`
- Text: `Inverse`
- Use when an action has failed or requires destructive/error feedback.

### C. General
Used for secondary actions such as Cancel, Back, Edit, Copy, Import, and Settings.

**Default**
- Background: `Surface`
- Text: `Primary`
- Border: `Default`

**Hover**
- Background: `#F5F7F9`
- Border: `Hover`

**Pressed**
- Background: `#EEF1F4`

**Disabled**
- Background: `#F5F7F9`
- Text: `Muted`
- Border: `Subtle`

### Button sizing
- Height: `40px`
- Horizontal padding: `16px`
- Border radius: `8px`
- Text: `14px / 20px`
- Weight: `600`
- Icon gap: `8px`

---

## 4. Motion & Transitions

All state switches, segmented toggles, tab indicators, flips, accordion reveals, and interactive controls must utilize smooth physical motion tokens.

### A. Segmented Controls & Toggles
- **Active Indicator**: Animated sliding background pill using shared layout transition (`layoutId` or CSS spring).
- **Spring Parameters**:
  - Stiffness: `450`
  - Damping: `35`
  - Mass: `0.8`
- **Duration**: `180ms - 220ms`

### B. Button Press & Hover
- **Hover Scale**: `1.02` (subtle raise)
- **Tap Scale**: `0.97` (tactile feedback)
- **Transition**: `ease-out 150ms`

### C. Accordion / FAQ Expansion
- **Height Animation**: `initial: { height: 0, opacity: 0 }` to `animate: { height: "auto", opacity: 1 }`
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth deceleration)
- **Duration**: `280ms`
- **Icon Rotation**: `180deg` smooth flip

### D. Scroll-Driven Sequences
- **Pinned Horizontal Showcase**: Translates seamlessly based on vertical scroll delta with zero abrupt jumps.

---

## 5. Cards & Surfaces

Cards are clean, content-first surfaces. Avoid harsh drop shadows. Use ultra-soft, low-opacity layered shadows with crisp subtle border definitions.

### Default Card
- Background: `Surface`
- Border: `Default` (`#E1E5E9`)
- Border radius: `12px`
- Shadow: `0 4px 16px rgba(0, 0, 0, 0.04)`
- Padding: `16px`

### Elevated Card
- Background: `Surface`
- Border: `Default` (`#E1E5E9`)
- Border radius: `12px`
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.06)`

### Post Card
- Background: `Surface`
- Border: `Default` (`#E1E5E9`)
- Border radius: `16px`
- Shadow: `0 6px 18px rgba(0, 0, 0, 0.05)`
- Content must remain the visual focus.
- Media uses `12px` radius.
- Dark variant uses `Surface Dark` with `Inverse` primary text.

---

## 6. Icons

Use **Ionicons 5** from `react-icons/io5`.

Usage rules:
- Import all UI icons and brand logos directly from `react-icons/io5` (e.g. `IoLogoLinkedin`, `IoLogoTwitter`, `IoSparklesOutline`, `IoDownloadOutline`, `IoShareSocialOutline`, `IoCheckmarkCircle`, `IoClose`, `IoHeart`, `IoRepeat`, `IoEyeOutline`, `IoChevronDownOutline`).
- Never use cartoon emojis in UI controls, metric badges, or layout reactions.
- Default UI icon size: `20px`.
- Small icon: `16px`.
- Large/action icon: `24px`.
- Icon-to-text gap: `8px`.

Do not invent or create new svg icons ever.

---

## 7. Component State Rules

Every interactive component must explicitly define:

`Default → Hover → Pressed → Disabled`

Submit/response components additionally support:

`Success → Warning → Error`

Do not invent additional states unless a component genuinely requires them.

Use the semantic colors only for semantic feedback. Brand blue remains the primary action color; success, warning, and error must not become decorative colors.

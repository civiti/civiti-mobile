# Design System

Visual conventions for Civiti-Mobile. Matches civiti.ro web brand. All values in dp unless noted.

> **⚠️ AGENTS: Every hex value, spacing value, and spec in this file is the source of truth. Copy values verbatim — never approximate, round, or substitute from memory. If a value isn't in this file, it doesn't exist in our design system.**

## Colors

### Core Brand

| Token | Hex | Usage |
|---|---|---|
| `oxfordBlue` | `#14213D` | Headers, nav bg, primary text |
| `orangeWeb` | `#FCA311` | CTAs, accent, action buttons |
| `platinum` | `#E5E5E5` | Backgrounds, borders, dividers |
| `white` | `#FFFFFF` | Card surfaces |
| `black` | `#000000` | Shadows only |

### Opacity Variants

| Token | Value | Usage |
|---|---|---|
| `oxfordBlue90/80/70/50` | `rgba(20,33,61, 0.9/0.8/0.7/0.5)` | Overlays / secondary text / captions / inactive |
| `orangeWeb90` | `rgba(252,163,17, 0.9)` | Pressed CTA |
| `orangeWeb20` | `rgba(252,163,17, 0.2)` | Highlight bg, selected state |

### Semantic

| Token | Light | Dark | Usage |
|---|---|---|---|
| `success` / `successMuted` | `#28A745` / `#DCFCE7` | `#4ADE80` / `#14532D` | Resolved, positive |
| `error` / `errorMuted` | `#DC3545` / `#FFF1F0` | `#F87171` / `#450A0A` | Rejected, errors |
| `info` / `infoMuted` | `#1890FF` / `#E6F7FF` | `#60A5FA` / `#1A3A47` | Active status |

### Dark Mode

| Token | Light | Dark |
|---|---|---|
| `text` | `#14213D` | `#ECEDEE` |
| `textSecondary` | `oxfordBlue70` | `rgba(236,237,238, 0.7)` |
| `background` | `#E5E5E5` | `#151718` |
| `surface` | `#FFFFFF` | `#1E2022` |
| `surfaceElevated` | `#FFFFFF` | `#262A2C` |
| `border` | `#E5E5E5` | `#3A3F42` |
| `pressed` | `#D6D6D6` | `#4A5057` |
| `tint` (active tab) | `#FCA311` | `#FCA311` |
| `tabIconDefault` | `oxfordBlue50` | `rgba(236,237,238, 0.5)` |
| `primary` | `#14213D` | `#E5E5E5` |
| `accent` | `#FCA311` | `#FCA311` |

### Issue Status Colors (Light)

| Status | Foreground | Background | Border |
|---|---|---|---|
| Draft / Cancelled | `#64748B` | `#F1F5F9` | `#CBD5E1` |
| Submitted | `#14213D` | `#E6F7FF` | `#91D5FF` |
| UnderReview | `#D48806` | `#FFFBE6` | `#FFE58F` |
| Active | `#1890FF` | `#E6F7FF` | `#91D5FF` |
| Resolved | `#28A745` | `#DCFCE7` | `#86EFAC` |
| Rejected | `#DC3545` | `#FFF1F0` | `#FFB8B8` |

### Issue Status Colors (Dark)

| Status | Foreground | Background | Border |
|---|---|---|---|
| Draft / Cancelled | `#94A3B8` | `rgba(100,116,139,0.15)` | `rgba(100,116,139,0.3)` |
| Submitted | `#93C5FD` | `#1E2D3D` | `rgba(147,197,253,0.3)` |
| UnderReview | `#FBBF24` | `rgba(245,158,11,0.15)` | `rgba(245,158,11,0.3)` |
| Active | `#60A5FA` | `#1A3A47` | `rgba(96,165,250,0.3)` |
| Resolved | `#4ADE80` | `#14532D` | `rgba(74,222,128,0.3)` |
| Rejected | `#F87171` | `#450A0A` | `rgba(248,113,113,0.3)` |

### Category Colors

| Category | Color | SF Symbol | MaterialIcons |
|---|---|---|---|
| Infrastructure | `#F59E0B` | `wrench.fill` | `build` |
| Environment | `#22C55E` | `leaf.fill` | `eco` |
| Transportation | `#3B82F6` | `car.fill` | `directions-car` |
| PublicServices | `#8B5CF6` | `building.2.fill` | `account-balance` |
| Safety | `#EF4444` | `shield.fill` | `shield` |
| Other | `#6B7280` | `ellipsis.circle.fill` | `more-horiz` |

### Urgency Colors (Light)

| Level | Color | Background |
|---|---|---|
| Low | `#28A745` | `#DCFCE7` |
| Medium | `#F59E0B` | `#FEF3C7` |
| High | `#F97316` | `#FFEDD5` |
| Urgent | `#DC3545` | `#FFF1F0` |

### Urgency Colors (Dark)

| Level | Color | Background |
|---|---|---|
| Low | `#4ADE80` | `#14532D` |
| Medium | `#FBBF24` | `rgba(245,158,11,0.15)` |
| High | `#FB923C` | `rgba(249,115,22,0.15)` |
| Urgent | `#F87171` | `#450A0A` |

## Typography

**Font**: Fira Sans via `expo-font` (`FiraSans_400Regular`, `_600SemiBold`, `_700Bold`, `_800ExtraBold`). Fallback: system-ui.

| Variant | Size | Weight | Line | Tracking | Usage |
|---|---|---|---|---|---|
| `h1` | 28 | 700 | 34 | -0.5 | Screen titles |
| `h2` | 22 | 600 | 28 | 0 | Section headers |
| `h3` | 18 | 600 | 24 | 0 | Card titles |
| `body` | 16 | 400 | 24 | 0 | Body text |
| `bodyBold` | 16 | 600 | 24 | 0 | Emphasis, labels |
| `button` | 16 | 600 | 20 | 0.5 | Buttons (uppercase) |
| `label` | 14 | 600 | 18 | 0.5 | Form labels (uppercase) |
| `caption` | 14 | 400 | 18 | 0 | Timestamps, meta |
| `badge` | 12 | 700 | 16 | 0.5 | Status badges (uppercase) |
| `emailCounter` | 36 | 800 | 40 | 0 | Vote/email counts |
| `link` | 16 | 400 | 24 | 0 | Tappable links |

ThemedText `type` prop: `'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'button' | 'label' | 'caption' | 'badge' | 'emailCounter' | 'link' | 'default'`

## Spacing

4px base grid. **Always use `Spacing` tokens — never raw numbers.**

| Token | px | Usage |
|---|---|---|
| `xxs` | 2 | Icon-text gap |
| `xs` | 4 | Inline gaps |
| `sm` | 8 | Related items |
| `md` | 12 | List item padding |
| `lg` | 16 | Card/screen padding |
| `xl` | 20 | Modal padding |
| `2xl` | 24 | Section spacing |
| `3xl` | 32 | Large section gaps |
| `4xl` | 48 | Major sections |

## Border Radius

`xs: 4` (chips) · `sm: 8` (buttons, cards) · `md: 12` (large cards) · `lg: 16` (sheets) · `xl: 24` (FABs) · `full: 9999` (avatars)

## Shadows

`sm`: iOS shadow 1px/0.05 | Android elevation 1
`md`: iOS shadow 2px/0.1 | Android elevation 3
`lg`: iOS shadow 4px/0.15 | Android elevation 6

Use `Platform.select()` for cross-platform.

## Component Specs

### Button Variants

| Variant | Bg | Text | Border | Press |
|---|---|---|---|---|
| `primary` | `orangeWeb` | `oxfordBlue`/`white` | none | `orangeWeb90` |
| `secondary` | `white` | `oxfordBlue` | 1px `platinum` | `platinum` bg |
| `ghost` | transparent | `oxfordBlue` | none | `orangeWeb20` bg |
| `danger` | `error` | `white` | none | darken 10% |

All: height 48px, radius `sm` (8px), padding `lg` (16px) horizontal, text=`button` variant. Small: 36px/14px.

### Issue Card

Photo full-width 180px cover (rounded top) · category badge top-left overlay · urgency badge top-right · title H3 2-line ellipsis · address caption 1-line · bottom: emails · votes · timeAgo. Surface bg, border, `BorderRadius.sm`, `Shadows.sm`, padding `lg`.

### Text Input

Height 48px · radius `sm` · border 1px: `platinum` (default) | `orangeWeb` (focus) | `error` (error) · padding horizontal `md` · font 16px · surface bg.

### Status Badge

Padding `sm`/`xxs` · radius `xs` · border 1px · text=`badge` variant · colors from Status Colors table.

### Tab Bar

White bg + top border platinum · active: `orangeWeb` · inactive: `oxfordBlue50` · icon 28px.

### Sticky Bottom Bar (Issue Detail)

Surface bg · top border 1px platinum · padding `lg`/`md` · safe area bottom inset · left: vote button · right: "Trimite Email" primary CTA.

## Layout

| Context | Horizontal | Vertical |
|---|---|---|
| Screen content | `lg` (16) | `lg` (16) top |
| Card internal | `lg` (16) | `lg` (16) |
| Section spacing | — | `2xl` (24) |
| Modal content | `xl` (20) | `xl` (20) |

Touch targets: 44×44pt iOS, 48×48dp Android. Safe areas via `useSafeAreaInsets()`.

Lists: 12 items/page, pull-to-refresh, FlatList `onEndReached`, separator hairlineWidth platinum.

## Gradients

| Name | Value | Usage |
|---|---|---|
| Hero | `['#14213D', 'rgba(20,33,61,0.8)']` 135° | Onboarding, auth |
| CTA | `['#FCA311', '#FDB833']` 135° | Special buttons |

Use `expo-linear-gradient`.

## Animation

- `react-native-reanimated` for all animations
- Micro (press, toggle): 150-200ms · Transitions (page): 250-350ms · Complex: spring-based
- Enter/exit: `withTiming` + `Easing.bezier(0.4, 0, 0.2, 1)`
- Vote: spring scale 1.0→1.3→1.0 · Submit success: confetti · Urgent badge: static (battery)

## Icons

SF Symbols → MaterialIcons via `IconSymbol`. Sizes: tab=28, inline=16-20, card=24, header=24, empty=48-64, email counter=36. **Always pass color from theme.**

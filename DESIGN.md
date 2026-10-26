---
name: Warm Editorial Archive
colors:
  surface: '#fdf9f2'
  surface-dim: '#dddad3'
  surface-bright: '#fdf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ec'
  surface-container: '#f1ede6'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e6e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#4e453f'
  inverse-surface: '#31302c'
  inverse-on-surface: '#f4f0e9'
  outline: '#80756e'
  outline-variant: '#d2c4bc'
  surface-tint: '#6f5a4d'
  primary: '#150902'
  on-primary: '#ffffff'
  primary-container: '#2e1f14'
  on-primary-container: '#9c8576'
  inverse-primary: '#dcc1b0'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#200300'
  on-tertiary: '#ffffff'
  tertiary-container: '#480c00'
  on-tertiary-container: '#d06e54'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f9ddcc'
  primary-fixed-dim: '#dcc1b0'
  on-primary-fixed: '#27180e'
  on-primary-fixed-variant: '#554336'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#7c2e19'
  background: '#fdf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e6e2db'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Literata
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Literata
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends the enduring, grounded warmth of heritage libraries with the crisp utility of a modern digital reading platform. The visual aesthetic is rooted in warm editorial minimalism: pairing the tactile richness of dark hardwoods (walnut, polished oak) with luminous parchment surfaces and sunlit amber accents.

The interface serves readers, researchers, and book collectors who seek immersion without cognitive fatigue. The experience should evoke tranquility, scholarly prestige, and welcoming comfort—replacing clinical white screens with restful ivory paper tones and refined typographic hierarchy.

## Colors

The palette establishes an organic, literary atmosphere through natural pigments:

- **Primary (`#2E1F14`)**: Deep walnut timber. Provides structural presence, typography contrast, and grounded navigation chrome.
- **Secondary (`#D97706`)**: Toasted amber. Drives calls-to-action, bookmarking states, highlighting, and active indicators.
- **Tertiary (`#E07A5F`)**: Soft terracotta. Applied for secondary badges, collection tags, curated editorial collections, and warm accentuation.
- **Neutral (`#F7F3EC`)**: Natural parchment. Serves as the canvas backdrop to reduce ocular glare during extended reading sessions, paired with `#FDFBF7` for raised paper cards and `#EFE8DC` for structural dividers.
- **Muted Foregrounds**: Secondary text uses a desaturated warm umber (`#6B584B`) to maintain clear typographic hierarchy without harsh black-on-white contrast.

## Typography

The type system balances classical bookbinding tradition with high-legibility interface design:

- **Editorial Headings (`Newsreader`)**: Conveys literary depth and authority. Used for publication titles, section leads, and featured archive headers.
- **Reading Body (`Literata`)**: Designed specifically for extended digital reading. Features balanced proportions and organic strokes that replicate ink-on-paper rendering.
- **Interface & Metadata (`Manrope`)**: A clean, balanced sans-serif employed for interface controls, metadata badges, catalog filters, navigation, and tabular data.

## Layout & Spacing

The layout is built upon a balanced 12-column fluid grid on desktop, transitioning to 8 columns on tablet and 4 columns on mobile:

- **Desktop (1024px+)**: Max content container of 1360px with generous margins (`2.5rem`) to create open, restful breathing room akin to wide book margins.
- **Tablet (768px - 1023px)**: Gutters adjust to `1.25rem`; dual-column card grids allow comfortable browsing.
- **Mobile (<768px)**: Outer margins reduce to `1.25rem` and gutters to `1rem`. Structural navigation moves to a bottom docking bar.
- **Rhythm**: Element spacing follows consistent multiples of `0.25rem` (4px). Reading columns for text-heavy content enforce a strict maximum width of `68ch` to preserve optimal eye tracking.

## Elevation & Depth

Depth is rendered through warm tonal layering and soft ambient light, avoiding harsh artificial dropshadows:

- **Level 0 (Canvas)**: `#F7F3EC` base tone mimicking untreated parchment.
- **Level 1 (Cards & Shelves)**: `#FDFBF7` elevated surface with a subtle tinted hairline border (`rgba(74, 51, 36, 0.08)`) and an ambient shadow: `0 2px 8px -2px rgba(46, 31, 20, 0.05)`.
- **Level 2 (Dropdowns & Popovers)**: `#FDFBF7` surface supported by `0 8px 24px -4px rgba(46, 31, 20, 0.08)` and subtle border outline.
- **Level 3 (Modals & Reader Overlays)**: Floated surface with `0 16px 40px -8px rgba(31, 21, 13, 0.16)`, accompanied by a warm tinted backdrop blur (`rgba(31, 21, 13, 0.4)` with 4px blur).

## Shapes

The design system employs a soft, restrained corner radius (`roundedness: 1`, base 4px / `0.25rem`):

- **Interactive Elements (Buttons, Inputs)**: `rounded` (4px) to retain an architectural, crisply printed appearance reminiscent of bookplates and catalogue cards.
- **Content Panels & Book Covers**: `rounded-lg` (8px) for gentle containment without leaning into casual or bubbly forms.
- **Pills & Badges**: Exclusively reserved for status chips and genre indicators (`rounded-full`), balancing the geometric discipline of the cards.

## Components

### Buttons
- **Primary**: Solid background in `#2E1F14` with `#FDFBF7` text. On hover, transitions to `#4A3324`. Focus rings use `#D97706` offset by 2px parchment space.
- **Call-to-Action (Accent)**: Solid `#D97706` with white text for critical acquisition actions (e.g., "Comenzar Lectura", "Reservar Ejemplar"). Transitions to `#C25E00` on hover.
- **Secondary / Outline**: 1px border in `rgba(46, 31, 20, 0.2)` over transparent background; text in `#2E1F14`. Hover fills with `rgba(46, 31, 20, 0.04)`.
- **Ghost**: No border, `#4A3324` text with subtle hover background.

### Chips & Badges
- **Genre & Category Tags**: Subtle parchment fill (`#EFE8DC`), text in `#4A3324`, border in `rgba(74, 51, 36, 0.12)`.
- **Editorial / Curated Badge**: Soft terracotta tint (`rgba(224, 122, 95, 0.12)`), text in `#A4432A`.

### Input Fields & Search Bars
- Clean, open presentation with an inset background of `#FDFBF7`, bordered with `rgba(46, 31, 20, 0.18)`.
- Active focus state sharpens the border to `#D97706` with a soft amber glow (`rgba(217, 119, 6, 0.15)`).
- Prefix icons (such as magnifying glasses for catalogue exploration) render in muted walnut (`#6B584B`).

### Checkboxes & Radio Controls
- Base unselected state: 1.5px border in `#4A3324` on `#FDFBF7`.
- Selected state: Filled with `#D97706` with a crisp ivory checkmark or dot.

### Book & Volume Cards
- Background `#FDFBF7` with hairline border in `rgba(74, 51, 36, 0.08)`.
- Displays high-aspect cover asset (2:3 proportion) with a slight spine shadow effect on the inner left margin.
- Accompanied by title in `Newsreader` (`headline-sm`), author line in `Literata` (`body-sm`), and format indicators in `Manrope` (`label-sm`).
- Hover elevation elevates the card by -2px with amplified ambient warm shadow.

### Reading Progress Indicator
- Slim 3px progress track on parchment background (`#EFE8DC`), filled with vibrant amber (`#D97706`).
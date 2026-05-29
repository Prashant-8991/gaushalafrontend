## Design System

### Theme
- Light mode (default) — warm white/cream backgrounds, saffron accents
- Dark mode — navy/dark backgrounds, saffron-light accents
- Toggle via header button; preference saved to localStorage
- `.dark` class on `<html>` enables Tailwind `dark:` variants

### Colors

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#FFFDF8` | oklch(0.145 0 0) |
| `--foreground` | `#1a1a2e` | oklch(0.985 0 0) |
| `--primary` (saffron) | `#FF6B00` | `#FF9933` |
| `--secondary` (navy) | `#1B3A6B` | `#0F2340` |
| saffron-dark | `#E55D00` | `#CC7A00` |
| navy-dark | `#0F2340` | `#09162B` |

### Typography
- Font: Poppins (Google Fonts)
- Sidebar heading: 1.1rem bold
- Card titles: 1.4rem bold
- Body: 0.8rem — 0.95rem
- Labels/captions: 0.5rem — 0.7rem

### Components

**Sidebar:** Fixed 256px, navy-dark background, white text, saffron active state.

**Header:** White background, thin saffron border, date display, theme toggle, user badge.

**Cards:** Rounded-xl (12px), light shadow, saffron/10 border, hover lift effect.

**CowCard Modal:** Full-screen overlay (70% black), max-width 3xl, spring animation, 5 tabs (Overview, Milk, Weight, Family, Breed Score).

### Tab System
- Inline flex tabs below hero header
- Active tab: saffron underline + tinted background
- Content scrolls independently

### Charts
- Recharts AreaChart for milk production (monthly + daily)
- Recharts RadarChart for breed scores (12 traits)
- Theme-aware axis/tooltip colors

### Spacing
- Page padding: p-4 lg:p-6
- Card padding: p-4 to p-5
- Gap between sections: space-y-4 to space-y-5
- Grid: 2-6 columns responsive

### Dark Mode
- Toggle button in header (Sun/Moon icon)
- `.dark` class applied to `<html>` element
- Persisted in `localStorage` key `gaushala-theme`
- Default: light mode

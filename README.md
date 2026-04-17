
  # Somnath Gaushala — Herd Management Dashboard

A web-based herd management dashboard built for the Somnath Temple Trust Gaushala, Gujarat. The application provides a comprehensive view of a pure Gir breed herd across five generations, covering health, milk production, breed quality, genealogy, donations, and scheduled care alerts.

---

## Overview

The Somnath Gaushala dashboard is designed to help gaushala administrators monitor and manage a large herd of Gir cows from a single interface. It combines data visualisation, individual cow profiles, and operational tracking into a cohesive management tool.

---

## Features

**Dashboard**
- High-level KPI cards: total herd, milking count, pregnant cows, calves, average breed score, and cows under treatment
- Monthly milk production trend chart
- Herd status distribution (Milking, Pregnant, Dry, Calf, Bull)
- Source breakdown (Natural Birth, Donated, Sperm Donation, Purchased)
- Generation distribution across five lineage levels
- Top milking cows and top breed score leaderboards with clickable cow profiles

**Cow Card**
- Detailed individual profile modal with animated transitions
- Tabs for Overview, Milk History, Weight History, Family Tree, and Breed Score
- Milk and weight charts with configurable threshold indicators
- Three-generation family tree (grandparents, parents, siblings, children)
- Breed radar chart benchmarked against official Gir breed standards
- Dark and light card theme support

**Genealogy**
- Five-generation lineage explorer for the full herd
- Parent-child relationship mapping with source type indicators

**Breed Scoring**
- Per-cow scoring across ten Gir breed traits: head shape, horn curvature, ear shape, hump size, dewlap, body frame, udder shape, coat colour, tail length, and overall conformation
- Benchmarked against documented Gir breed standards

**Timeline**
- Year-by-year event log of herd changes: births, donations in/out, deaths, and purchases
- Incoming and outgoing flow visualisation

**Alerts**
- Upcoming and overdue care events: vaccinations, health checks, deworming, breeding, and weight checks
- Priority levels (High, Medium, Low) with status tracking

**Donations**
- Records of cows donated into and out of the gaushala
- Donor and recipient contact details, health condition at donation, and follow-up updates

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | React 18, TypeScript |
| Build Tool | Vite 6 |
| Routing | React Router 7 |
| Charts | Recharts 2 |
| Animation | Motion (Framer Motion) 12 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Icons | Lucide React |
| Forms | React Hook Form |

---

## Getting Started

**Prerequisites:** Node.js 18 or later and npm.

**Install dependencies:**

```bash
npm install
```

**Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

**Build for production:**

```bash
npm run build
```

---

## Project Structure

```
src/
  app/
    components/       # Page and UI components
      ui/             # shadcn/ui base components
      figma/          # Figma-specific image utilities
    data/
      mockData.ts     # Seeded mock data for the full herd
    App.tsx
    routes.ts
  styles/             # Global CSS, Tailwind, theme, and font imports
  main.tsx
```

---

## Data

All herd data is currently generated from a seeded mock dataset (`mockData.ts`) that produces a deterministic set of 213 Gir cows across five generations. The seed ensures consistent data across renders and environments. The data model is designed to be replaceable with a live API or database backend.

  
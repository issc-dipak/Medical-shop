# MedLedger — Medical Shop Management System

A full end-to-end Next.js implementation of the Medical Shop Management System
project (Field Project CA-310). Built with Next.js 14 (App Router), React, and
Tailwind CSS. Data is stored in the browser's `localStorage`, so the whole
project runs with **zero backend/database setup** — matching the scale of a
single medical shop.

## Modules implemented

| Module | Route | What it does |
|---|---|---|
| Login | `/login` | Admin & Staff sign-in |
| Dashboard | `/dashboard` | Stock, low-stock, expiry, and today's-sales overview |
| Admin (Medicines) | `/medicines` | Add / edit / delete medicines, stock, batch, expiry |
| Billing | `/billing` | Search medicines, build a cart, auto GST calculation, generate & print receipt |
| Customers | `/customers` | Add customers, view purchase history |
| Reports | `/reports` | Sales report, low-stock alert, expiry report |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo credentials

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `admin123` |
| Staff | `staff`  | `staff123` |

## Notes

- Seed data (7 medicines, 2 customers) loads automatically on first run.
- Stock quantity automatically decreases when a bill is generated.
- "Low stock" = 10 units or fewer. "Expiring soon" = within 30 days.
- To reset all data, clear your browser's localStorage for this site
  (DevTools → Application → Local Storage) and refresh.
- For a real deployment with multiple counters/devices, replace
  `lib/storage.js` with API routes backed by a real database
  (e.g. PostgreSQL/MySQL with Prisma) — the rest of the UI can stay as is,
  since all data access already goes through that one file.

## Tech stack

- Next.js 14 (App Router, JavaScript)
- React 18
- Tailwind CSS
- Fonts: Fraunces (display), Inter (body), IBM Plex Mono (codes/prices)

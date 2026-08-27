# MedLedger — Medical Shop Management System (Full Stack)

Full end-to-end implementation of the Medical Shop Management System project
(Field Project CA-310):

- **frontend/** — Next.js 14 (App Router) + React + Tailwind CSS
- **backend/** — Node.js + Express + MongoDB (Mongoose) REST API

The frontend no longer stores data in the browser — it talks to the backend
over HTTP, and the backend persists everything in MongoDB.

## Project structure

```
medshop-fullstack/
├── backend/          Node.js + Express + MongoDB API
│   ├── config/       DB connection
│   ├── middleware/   JWT auth
│   ├── models/       Mongoose schemas (User, Medicine, Customer, Bill)
│   ├── routes/       auth, medicines, customers, bills, reports
│   ├── seed.js        seed script — default users + sample data
│   └── server.js
└── frontend/         Next.js app
    ├── app/          pages (login, dashboard, medicines, billing, customers, reports)
    ├── components/   Sidebar, AppShell, shared UI bits
    └── lib/api.js    API client (fetch wrapper + JWT handling)
```

## 1. Set up MongoDB

Use either:

- **Local MongoDB** — install MongoDB Community Server and run `mongod`, or
- **MongoDB Atlas** (free tier) — create a cluster and copy its connection string.

## 2. Run the backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI (and JWT_SECRET to a long random string)
npm install
npm run seed     # creates default users + sample medicines/customers
npm run dev      # starts the API on http://localhost:5000
```

Check it's alive: open `http://localhost:5000/api/health` — should return `{"status":"ok"}`.

## 3. Run the frontend

```bash
cd frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL should point at the backend, default http://localhost:5000/api
npm install
npm run dev      # starts the site on http://localhost:3000
```

Open `http://localhost:3000` and sign in.

## Demo credentials (created by `npm run seed`)

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `admin123` |
| Staff | `staff`  | `staff123` |

## API overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/medicines?search=` | Yes | List / search medicines |
| POST | `/api/medicines` | Admin | Add medicine |
| PUT | `/api/medicines/:id` | Admin | Update medicine |
| DELETE | `/api/medicines/:id` | Admin | Delete medicine |
| GET | `/api/customers` | Yes | List customers |
| POST | `/api/customers` | Yes | Add customer |
| GET | `/api/customers/:phone/history` | Yes | Purchase history |
| GET | `/api/bills` | Yes | List all bills |
| POST | `/api/bills` | Yes | Generate a bill (auto-deducts stock) |
| GET | `/api/reports/summary` | Yes | Dashboard counts |
| GET | `/api/reports/low-stock?threshold=` | Yes | Low stock list |
| GET | `/api/reports/expiring?days=` | Yes | Expiry list |
| GET | `/api/reports/sales?date=` | Yes | Sales for a given date |

All routes except `/api/auth/login` and `/api/health` require
`Authorization: Bearer <token>`; the frontend handles this automatically
once you're logged in.

## Notes on scaling this up

- **Staff accounts**: currently only two users are seeded. Add an
  Admin-only `/api/users` route if you want to manage staff accounts
  from the UI instead of the seed script.
- **Transactions**: bill creation deducts stock with sequential updates,
  which is fine for a single shop counter. For multiple simultaneous
  counters at higher volume, wrap the bill-creation logic in a MongoDB
  session transaction (requires MongoDB running as a replica set).
- **Deployment**: deploy `backend/` to any Node host (Render, Railway,
  a VPS) with a MongoDB Atlas connection string, and `frontend/` to
  Vercel or similar, pointing `NEXT_PUBLIC_API_URL` at the deployed
  backend URL.

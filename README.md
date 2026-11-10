# SolCacao Artisanal Chocolate Platform

A full-stack, bilingual (English/Spanish) web platform for an artisanal
chocolate brand, built around two separate commercial channels:

- **D2C Retail** — browse a single-origin/truffle/seasonal catalog, filter
  and search, build a custom sampler, guest or account checkout.
- **B2B Wholesale** — a 4-step guided wizard for corporate/bulk custom
  chocolate orders (cacao profile, brand asset upload, packaging, review).

This README covers the whole repo end-to-end: setup, the database, how the
app actually behaves, and where everything lives. For the full REST API
reference, see **[`server/README.md`](server/README.md)**.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Application workflow](#application-workflow)
- [Scripts reference](#scripts-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project documents](#project-documents)
- [Known limitations](#known-limitations)

---

## Tech stack

| Layer | Technology |
|---|---|
| Client | React 18, Vite, React Router v6, Tailwind CSS v4, Lucide icons |
| Server | Node.js, Express 4 (ES modules), Mongoose |
| Database | MongoDB |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| Validation | Zod (server), hand-written validators mirrored on the client |
| File uploads | Multer (local disk) |
| Testing | Vitest + Supertest (server) |
| Logging | Morgan (HTTP request logs) |

## Repository layout

```
solcacao-platform/
├── client/     React + Vite frontend (see client/src for the app itself)
├── server/     Express + MongoDB API (see server/README.md for API docs)
├── docs/       Proposal, ERD, schema, accessibility report, AI usage log
└── README.md   You are here
```

## Prerequisites

- **Node.js 18+** (20 LTS recommended) and npm
- **MongoDB** running locally (`mongodb://localhost:27017`) — install
  [MongoDB Community Server](https://www.mongodb.com/try/download/community),
  or point `MONGO_URI` at a hosted instance (e.g. MongoDB Atlas) instead
- **git**

No separate database GUI is required, but
[MongoDB Compass](https://www.mongodb.com/products/compass) or the
`mongosh` shell are handy for poking at the data (see [Database](#database)).

## Quick start

```bash
git clone <this-repo-url>
cd solcacao-platform
```

### 1. Start MongoDB

Make sure a local `mongod` is running (as a Windows/macOS/Linux service, or
`mongod` in its own terminal). The app expects
`mongodb://localhost:27017` by default — no manual database or collection
creation needed, see [Database](#database).

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and set at least `JWT_SECRET` to a long random string (e.g.
`openssl rand -hex 48`, or any long random text) — every other default
works out of the box for local development. Then:

```bash
npm run dev
```

You should see:
```
[mongo] connected -> solcacao
[seed] no products found, seeding categories + products...
[seed] inserted 3 categories, 9 products
[server] SolCacao API listening on http://localhost:5000
```

The catalog is seeded **automatically** the first time (and only the first
time — see [Database](#database)). Leave this running in its own terminal.

### 3. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api by default
npm run dev
```

Open **http://localhost:5173**. You should see the SolCacao homepage with a
full product catalog already populated.

### 4. Try it out

- Browse `/shop`, filter by origin/cacao %/price, add items to the cart as
  a guest, and check out — no account required.
- Click **Log In** → **Create Your Account** to register (retail or
  business). After registering you'll be switched to the Login tab to sign
  in with the new credentials (registration intentionally does **not**
  auto-login — see [Application workflow](#application-workflow)).
- Visit `/b2b` to try the 4-step wholesale custom-order wizard.
- Toggle **EN/ES** in the navbar to see the whole site in Spanish.

## Environment variables

### `server/.env`

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `MONGO_URI` | `mongodb://localhost:27017/solcacao` | Main database |
| `MONGO_URI_TEST` | `mongodb://localhost:27017/solcacao_test` | Used only by `npm test` |
| `JWT_SECRET` | — | **Set this** — long random string signing the auth token |
| `JWT_EXPIRES_IN` | `7d` | Session length |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `COOKIE_NAME` | `solcacao_token` | Auth cookie name |
| `COOKIE_SECURE` | mirrors `NODE_ENV==='production'` | Force `true`/`false`; must be `false` if served over plain HTTP (see `server/README.md`) |

### `client/.env`

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL the client calls. Vite bakes this in **at build time** |

## Database

MongoDB, 8 collections, accessed via Mongoose. Full schema reference lives
in `server/README.md`, summarized here:

| Collection | Purpose |
|---|---|
| `users` | Retail or B2B accounts (embeds saved addresses + an optional corporate profile) |
| `categories` | Product categories (bar / truffle / seasonal) |
| `products` | Catalog items (embeds stock/inventory) |
| `carts` | One per logged-in user *or* per guest browser session |
| `orders` | Placed D2C orders (shipping snapshot + line items, price locked in at purchase time) |
| `b2bQuoteRequests` | Wholesale wizard submissions, including uploaded brand-asset files |
| `contactInquiries` | Contact form submissions |
| `customSamplers` | "Build your own sampler" selections |

**Auto-seeding**: on every server start, `ensureSeedData()` checks if the
`products` collection is empty — if so, it inserts the 3 categories and 9
starter products; if data already exists, it does nothing. This means:

- First run ever → catalog appears automatically, no manual step.
- Every later restart → your real carts/orders/users are **never** wiped.

To force a full, destructive reseed (wipes and reloads just categories +
products):

```bash
cd server
npm run seed
```

**Inspecting the data** — with `mongosh` (or MongoDB Compass pointed at
the same URI):

```bash
mongosh mongodb://localhost:27017/solcacao
> show collections
> db.products.find().limit(3)
> db.users.find({}, { passwordHash: 0 })   # never dump password hashes casually, but if you must, this excludes them
```

## Application workflow

A guided tour of what the app actually does, end to end:

### Browsing & cart (guest or retail)

- `/` — Home: hero, featured collections, seasonal picks, a B2B cross-sell
  (hidden once you're logged in as retail, since you've already picked
  your channel).
- `/shop` — full catalog with category/origin/cacao %/price filters, sort,
  and the navbar's search box (`?search=`).
- Adding to cart works identically for guests and logged-in users — a
  guest gets an anonymous cart tied to a random id stored in
  `localStorage`; **logging in or registering-then-logging-in merges that
  guest cart into your account cart automatically.**
- `/cart` → `/checkout` — checkout does **not** require an account (guest
  checkout is a first-class flow, matching the dual-channel design); the
  order total is always computed server-side from the database, never
  trusted from the browser.
- `/sampler` — pick up to 9 pieces to build a custom sampler; this both
  persists the sampler selection and adds the pieces to your cart.

### Authentication

- Login/Register is a single modal (not separate pages), reached via the
  navbar's **Log In** button.
- **Registering does not log you in.** On success, the modal switches to
  the Login tab with a confirmation message — you then log in with the
  credentials you just created. This is deliberate, not a bug.
- Account type (Retail vs. Business/Wholesale) is chosen at registration
  and can't be changed afterward from the UI.

### Role-based experience

Once logged in, the **nav menu, search, and cart icon adapt to your
account type**:

- **Retail** accounts see Shop, Sampler, and Cart; B2B/Wholesale is hidden.
- **B2B** accounts see Wholesale only; Shop/Sampler/Cart are hidden, and
  direct navigation to retail routes (or vice versa) redirects you to your
  own channel. The server independently rejects a B2B account's attempt
  to place a retail order (403), even if someone bypasses the UI.
- Guests (not logged in) see both channels, since you haven't picked one
  yet.

### B2B wholesale

- `/b2b` — service overview (custom molds, luxury packaging, white-label,
  bulk gifting).
- `/b2b/custom-order` — the 4-step wizard: cacao profile → brand asset
  upload (`.pdf/.svg/.ai`, 10MB max) → packaging preference → review &
  submit. Works for anyone, including guests — it's a lead-gen form, not
  gated like checkout.
- Submission generates a reference quote number and redirects to a
  confirmation page.

### Account page (`/account`)

- **Profile** tab: update your first name.
- **Order History** tab: your real past orders (retail accounts only —
  B2B accounts don't place retail orders, so this tab is hidden for them).

### Everything else

- `/contact` — general/wholesale/support inquiry form.
- `/about` — brand story.
- A small toast-notification system surfaces success/error feedback
  (login, logout, profile save, cart errors) without blocking the UI.
- Every user-facing string is bilingual; the language toggle persists for
  the session and switches the entire UI, including validation messages.

## Scripts reference

### `server/`

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with nodemon (auto-restart on change) |
| `npm start` | Start the API with plain `node` (production) |
| `npm run seed` | Destructive reseed: wipes + reloads categories/products |
| `npm test` | Run the Vitest + Supertest suite once |
| `npm run test:watch` | Run tests in watch mode |

### `client/`

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `client/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint with oxlint |

## Testing

The server has a real, committed test suite (not just manual scripts):

```bash
cd server
npm test
```

It runs against **`MONGO_URI_TEST`** (`solcacao_test` by default) — a
completely separate database from your dev data, so running tests never
touches or wipes anything you've been testing manually in the browser.
Covers auth (including the register-then-login flow), product filtering,
guest-cart-merge-on-login, checkout (guest, retail, and the B2B 403
block), B2B quote + file upload, contact validation, samplers, and account
updates. See `server/README.md` for how the test setup works.

## Deployment

The stack is a standard Node/Express + MongoDB + static React build — it
runs on any Linux host. A reference deployment to a single AWS EC2
instance looks like:

```
Browser → Nginx (:80) → serves the React build (client/dist) at "/"
                       → reverse-proxies "/api" and "/uploads" → Node (PM2, 127.0.0.1:5000)
                                                                → MongoDB (127.0.0.1:27017, local-only)
```

Key points if you go this route:
- Build the client with `VITE_API_URL=/api` so it's same-origin with the
  API through Nginx — no CORS configuration needed in production.
- Run the API with PM2 (`pm2 start server.js --name solcacao-api`) so it
  survives reboots.
- If you don't have a domain/TLS certificate yet, set `COOKIE_SECURE=false`
  explicitly — otherwise login will silently fail, since browsers refuse
  to store a `Secure` cookie over plain HTTP.
- Keep MongoDB bound to `127.0.0.1` and never open port 27017 (or 5000) in
  your security group/firewall — only Nginx's port 80/443 should be
  public.

## Project documents

The `docs/` folder has the supporting project documentation:

- `solcacao-project-requirements.docx` — original course/project brief
- `SolCacao-Proposal.docx` — expanded project proposal
- `SolCacao-ERD.pdf` / `.docx`, `SolCacao-Schema.pdf` — data model diagrams
- `SolCacao-Accessibility-Report.docx` — WCAG 2.1 AA audit + fixes applied
- `SolCacao-AI-Usage-Log.docx` — per-phase log of AI-assisted development

## Known limitations

- Uploaded B2B brand-asset files are stored on local disk
  (`server/uploads/`), not object storage — fine for a single-instance
  deploy, but not durable across an instance replacement.
- No CI pipeline configured yet (tests are run manually via `npm test`).
- Email notifications (order confirmations, contact-form routing to a
  support inbox) are intentionally **not** implemented — out of scope for
  this project.

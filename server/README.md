# SolCacao API Server

Backend for the SolCacao Artisanal Chocolate Platform — a Node.js/Express
(ES modules) REST API backed by MongoDB/Mongoose, serving the React client
in `../client`.

## Tech stack

- **Runtime:** Node.js, Express 4 (ESM — `"type": "module"`)
- **Database:** MongoDB via Mongoose
- **Auth:** JSON Web Tokens in an httpOnly cookie, passwords hashed with bcrypt
- **Validation:** Zod schemas mirroring the client-side validators
- **File uploads:** Multer (disk storage, local `uploads/`)
- **Logging:** Morgan (HTTP request logs; skipped when `NODE_ENV=test`)
- **Testing:** Vitest + Supertest

## Setup

```bash
npm install
cp .env.example .env   # adjust values if needed
npm run dev            # nodemon, auto-restarts on change
# or
npm start               # plain node
```

The server auto-seeds the `categories`/`products` collections on startup
**only if they're empty** (`seed/ensureSeedData.js`), so restarting never
wipes carts/orders/users. To force a full reseed (wipes and reloads
categories + products):

```bash
npm run seed
```

### Environment variables (`.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | HTTP port |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `MONGO_URI` | `mongodb://localhost:27017/solcacao` | Main database connection |
| `MONGO_URI_TEST` | `mongodb://localhost:27017/solcacao_test` | Database used by the test suite |
| `JWT_SECRET` | — | Signing secret for auth cookies (set to a long random string) |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (credentials enabled) |
| `COOKIE_NAME` | `solcacao_token` | Name of the auth cookie |

## Testing

```bash
npm test          # single run
npm run test:watch
```

Tests run against `MONGO_URI_TEST` (a separate database from your dev data)
and spin up the Express app in-process via Supertest — no running server
required. See `tests/` for the suite; `tests/setup.js` handles connect/seed/
cleanup.

## Project layout

```
server.js                  Entry point: connects DB, seeds if empty, starts listening
src/
  app.js                   Express app factory (middleware + route mounting)
  config/db.js             Mongoose connection
  models/                  Mongoose schemas (one file per collection)
  routes/                  Route definitions, one file per resource
  controllers/             Route handlers / business logic
  middleware/              auth guard, validation, upload, error handling
  validators/schemas.js    Zod request-body schemas
  utils/                   asyncHandler, ApiError, JWT helpers, ref-number generators
seed/                      Seed data + idempotent/destructive seed scripts
tests/                     Vitest + Supertest API test suite
uploads/                   Locally stored B2B brand-asset uploads (gitignored)
```

## Data model

8 collections, document-oriented (embedded subdocuments where data is only
ever read/written with its parent; references where it's independently
queried):

- **users** — retail or B2B accounts; embeds `addresses[]` and an optional
  `corporateProfile`
- **categories** — self-referencing (`parentCategoryId`) for sub-categories
- **products** — embeds `inventory`; references `categories`
- **carts** — one per user *or* per guest session (`guestSessionId`);
  embeds `items[]`; merged into the user's cart automatically on login
- **orders** — embeds a shipping-address snapshot and line items
  (price captured at purchase time, not re-read from the product later)
- **b2bQuoteRequests** — the 4-step wizard's submissions, embeds uploaded
  `files[]`; `corporatePartnerUserId` is optional (anonymous submissions
  allowed by design)
- **contactInquiries** — contact form submissions
- **customSamplers** — "build your own sampler" selections, embeds `items[]`

## Auth & sessions

- Login/registration issue/clear an httpOnly, `SameSite=Lax` cookie
  (`COOKIE_NAME`). The client never reads the token directly; every
  `fetch` call uses `credentials: 'include'`.
- **Registration does not auto-authenticate.** `POST /auth/register` only
  creates the account; the client then prompts the user to log in
  separately (see `AuthModal.jsx`).
- **Guest carts**: an unauthenticated client generates a random
  `x-guest-session-id` (stored in `localStorage`) and sends it on every
  cart/order/sampler/b2b request. On login or register, any guest cart
  under that session id is merged into the user's cart
  (`cart.controller.js#mergeGuestCartIntoUser`) — *registration* doesn't
  log the user in, so the merge there currently only fires on **login**,
  not on register.
- **Channel enforcement**: `POST /orders` rejects an authenticated
  non-retail (B2B) account with `403`. B2B quote submission
  (`POST /b2b/quotes`) is intentionally open to anyone, including
  guests and retail accounts — it's a lead-gen form, not a gated resource.

## API reference

All paths are relative to `/api`. Request/response bodies are JSON unless
noted. Endpoints marked **Auth** require a valid session cookie;
**Auth (retail only)** additionally rejects non-retail accounts with 403.

### Auth — `/auth`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/register` | — | `firstName, lastName?, email, password, accountType?` | Creates the account only — does **not** log in |
| POST | `/login` | — | `email, password` | Sets the auth cookie; merges any guest cart |
| POST | `/logout` | — | — | Clears the auth cookie |
| GET | `/me` | Auth | — | Returns the current session's user |

### Products & Categories

| Method | Path | Auth | Query/Body | Notes |
|---|---|---|---|---|
| GET | `/products` | — | `category, origin, minCacao, maxPrice, search, sort` | `sort`: `price-asc \| price-desc \| cacao-desc` |
| GET | `/products/origins` | — | — | Distinct list of active product origins |
| GET | `/products/:id` | — | — | 404 if not found |
| GET | `/categories` | — | — | All categories |

### Cart — `/cart`

Guest requests must send `x-guest-session-id`; authenticated requests use
the session cookie instead (header is ignored once logged in).

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/` | guest or Auth | — | Creates an empty cart if none exists yet |
| POST | `/items` | guest or Auth | `productId, quantity` | Increments quantity if already in cart |
| PATCH | `/items/:productId` | guest or Auth | `quantity` | Must be a positive integer |
| DELETE | `/items/:productId` | guest or Auth | — | |
| DELETE | `/` | guest or Auth | — | Empties the cart |

### Orders — `/orders`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/` | guest or Auth (retail only) | `firstName, lastName, email, phone, addressLine1, city, state, zipCode` | Reads the caller's current cart server-side; price/total are computed from the DB, never trusted from the client |
| GET | `/` | Auth | — | Current user's order history |

### B2B — `/b2b`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/quotes` | — (optional session) | multipart/form-data: `companyName, contactName, email, phone, cacaoProfile, estimatedQuantity, packagingPreference?, notes?, brandAsset?` (file) | `brandAsset` accepts `.pdf/.svg/.ai`, 10MB max; generates a `quoteNumber` |

### Contact — `/contact`

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/` | — | `name, email, category, message` |

### Samplers — `/samplers`

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/` | guest or Auth | `items: [{ productId, quantity }], samplerName?` |

### Account — `/account`

| Method | Path | Auth | Body |
|---|---|---|---|
| PATCH | `/profile` | Auth | `firstName?, lastName?` |

### Misc

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | Liveness check, returns `{ status: "ok" }` |
| GET | `/uploads/:filename` | Static file serving for uploaded B2B brand assets |

All error responses are `{ "message": string, "details"?: object }`.
Validation failures (`400`) populate `details` with one message per
invalid field, keyed by field name.

# TCG Drop Tracker — Project Kickoff Prompt

## Project Overview

Build a production-ready **TCG Drop Tracker** web application. This is a free tool for the trading card game community that tracks:

1. **Upcoming product drops** — new set releases, exclusive drops, pre-orders across major retailers
2. **Real-time restock/availability monitoring** — with retailer security escalation and queue detection signals
3. **Trade show calendar** — card shows, comic cons, Collect-a-Con, regional events with map visualization

**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Neon (serverless Postgres), Prisma ORM, Clerk (auth), Resend (email), Vercel (hosting + Cron Jobs), Discord webhook integration

---

## Core Principles — Read Before Writing Any Code

- **Never duplicate logic.** Before writing any utility, hook, component, or API route — check if something equivalent already exists in the codebase. Reuse and extend first.
- **TypeScript strict mode throughout.** No `any` types. All API responses and DB results fully typed.
- **Component-first architecture.** Every UI element that appears more than once becomes a shared component in `/components/ui/`.
- **Server Components by default.** Only use `"use client"` when interactivity requires it.
- **All DB access through Prisma.** No raw SQL strings in application code except in the dedicated scraper/worker layer.
- **Environment variables for all secrets.** Nothing hardcoded. Full `.env.example` maintained.
- **Every new feature updates TODO.md.** Track progress continuously.

---

## Project Structure

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Homepage — upcoming drops feed
│   │   ├── calendar/page.tsx           # Calendar view of drops
│   │   ├── shows/page.tsx              # Trade show map + list
│   │   └── retailers/page.tsx          # Retailer status dashboard
│   ├── (auth)/
│   │   ├── dashboard/page.tsx          # User notification preferences
│   │   └── webhooks/page.tsx           # Discord webhook management
│   ├── api/
│   │   ├── calendar/route.ts           # iCal .ics feed endpoint
│   │   ├── drops/route.ts              # Drops CRUD
│   │   ├── shows/route.ts              # Trade shows CRUD
│   │   ├── webhooks/discord/route.ts   # Webhook registration
│   │   └── cron/
│   │       ├── scrape-inventory/route.ts
│   │       └── scrape-security/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                             # Shared primitives (Button, Badge, Card, Modal, etc.)
│   ├── drops/
│   │   ├── DropCard.tsx
│   │   ├── DropFeed.tsx
│   │   ├── DropCalendar.tsx
│   │   └── SignalBadge.tsx             # Queue/Security/Restock signal indicators
│   ├── shows/
│   │   ├── ShowMap.tsx                 # Map with pins
│   │   ├── ShowCard.tsx
│   │   └── ShowFilters.tsx
│   └── notifications/
│       ├── WebhookForm.tsx
│       └── NotificationPreferences.tsx
├── lib/
│   ├── db.ts                           # Prisma client singleton
│   ├── discord.ts                      # Discord webhook sender
│   ├── calendar.ts                     # iCal generator
│   ├── scrapers/
│   │   ├── base.ts                     # Abstract base scraper class
│   │   ├── inventory/
│   │   │   ├── pokemon-center.ts
│   │   │   ├── target.ts
│   │   │   ├── walmart.ts
│   │   │   └── shopify.ts              # Generic Shopify scraper (covers hundreds of LGS/indie stores)
│   │   └── signals/
│   │       ├── queue-detector.ts       # Queue-it / Cloudflare waiting room detection
│   │       └── security-monitor.ts     # HTTP fingerprint change detection
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts                        # All shared TypeScript types
├── hooks/
│   └── (client-side hooks as needed)
├── .env.example
├── TODO.md                             # Living progress doc — always up to date
└── vercel.json                         # Cron job schedule config
```

---

## Database Schema (Prisma)

Design and implement the following schema in `prisma/schema.prisma`:

```prisma
// Products — the TCG product catalog
model Product {
  id          String   @id @default(cuid())
  name        String
  game        Game
  type        ProductType
  imageUrl    String?
  msrp        Float?
  createdAt   DateTime @default(now())
  drops       Drop[]
  monitors    RetailerMonitor[]
}

// Drops — a specific retailer event for a product
model Drop {
  id          String     @id @default(cuid())
  productId   String
  product     Product    @relation(fields: [productId], references: [id])
  retailer    Retailer
  dropType    DropType
  scheduledAt DateTime?
  confirmedAt DateTime?
  status      DropStatus @default(UPCOMING)
  price       Float?
  url         String?
  notes       String?
  signals     Signal[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// Signals — queue detections, security changes, restock events
model Signal {
  id         String     @id @default(cuid())
  dropId     String?
  drop       Drop?      @relation(fields: [dropId], references: [id])
  retailer   Retailer
  type       SignalType
  url        String
  metadata   Json       // raw header snapshot, queue provider, etc.
  detectedAt DateTime   @default(now())
  notified   Boolean    @default(false)
}

// RetailerMonitor — HTTP state snapshots for fingerprint diffing
model RetailerMonitor {
  id                String   @id @default(cuid())
  productId         String?
  product           Product? @relation(fields: [productId], references: [id])
  url               String   @unique
  retailer          Retailer
  lastStatus        Int?
  lastBodySize      Int?
  lastHeaders       Json?
  lastRedirectChain Json?
  lastCheckedAt     DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// TradeShow
model TradeShow {
  id          String    @id @default(cuid())
  name        String
  organizer   String?
  showType    ShowType
  tier        ShowTier  // determines pin size/style on map
  startDate   DateTime
  endDate     DateTime
  venueName   String
  address     String
  city        String
  state       String
  zip         String?
  country     String    @default("US")
  lat         Float?
  lng         Float?
  website     String?
  ticketUrl   String?
  description String?
  featured    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// User notification preferences
model UserPreference {
  id           String     @id @default(cuid())
  clerkUserId  String     @unique
  email        String?
  games        Game[]
  retailers    Retailer[]
  signalTypes  SignalType[]
  emailEnabled Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

// Discord webhooks registered by community operators
model DiscordWebhook {
  id          String     @id @default(cuid())
  clerkUserId String
  webhookUrl  String
  label       String
  games       Game[]
  retailers   Retailer[]
  signalTypes SignalType[]
  active      Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// Enums
enum Game {
  POKEMON
  MTG
  YUGIOH
  LORCANA
  ONEPIECE
  SPORTS
  OTHER
}

enum ProductType {
  BOOSTER_BOX
  BOOSTER_PACK
  ETB
  BLISTERS
  PROMO
  GRADED
  BUNDLE
  OTHER
}

enum Retailer {
  POKEMON_CENTER
  TARGET
  WALMART
  AMAZON
  GAMESTOP
  BEST_BUY
  TCG_PLAYER
  SHOPIFY
  OTHER
}

enum DropType {
  NEW_RELEASE
  RESTOCK
  EXCLUSIVE
  PREORDER
  FLASH_SALE
}

enum DropStatus {
  UPCOMING
  LIVE
  QUEUE_ACTIVE
  SOLD_OUT
  CANCELLED
}

enum SignalType {
  RESTOCK
  QUEUE_DETECTED
  SECURITY_ESCALATED
  PRICE_CHANGE
  NEW_LISTING
}

enum ShowType {
  CARD_SHOW
  COMIC_CON
  COLLECTACON
  REGIONAL_CHAMPIONSHIP
  NATIONALS
  GAME_STORE_EVENT
  OTHER
}

enum ShowTier {
  LOCAL       // small pin
  REGIONAL    // medium pin
  MAJOR       // large pin, special style
  NATIONAL    // largest, featured treatment
}
```

---

## Feature Specs

### 1. Homepage — Drop Feed (`/`)
- Filterable by: Game, Retailer, Drop Type, Status
- Cards show: product image, name, retailer badge, drop type, scheduled date/time, current status, active signals
- `SignalBadge` component for QUEUE_ACTIVE and SECURITY_ESCALATED — amber/red visual treatment, these should visually pop
- "Subscribe" CTA linking to notification preferences (auth-gated)

### 2. Calendar View (`/calendar`)
- Month/week toggle
- Color-coded by Game
- Click event → drop detail modal
- "Add to Calendar" button per drop — triggers iCal download for that single event
- "Subscribe to full calendar" button — copies the `/api/calendar.ics` URL for use in Google/Apple Calendar

### 3. iCal Feed (`/api/calendar`)
- Public endpoint, no auth required
- Accepts query params: `?game=POKEMON&retailer=POKEMON_CENTER` etc.
- Returns valid `.ics` file using `ical-generator` npm package
- Events include: product name, retailer, URL, drop type in description

### 4. Trade Show Page (`/shows`)

**Map section (top half of page):**
- Use `react-map-gl` with Mapbox (free tier sufficient) or Leaflet as fallback
- Pins color-coded by proximity to today:
  - Green = 30+ days away
  - Yellow = 7–30 days away
  - Red = less than 7 days away
- Pin size determined by `ShowTier`:
  - LOCAL = small
  - REGIONAL = medium
  - MAJOR = large
  - NATIONAL = large + pulsing CSS animation
- Clicking a pin opens a popup with show name, dates, venue, link to detail
- Featured shows get a star marker treatment

**List section (bottom half of page):**
- Sortable columns: Date, Name, State, Show Type, Tier
- Filterable by: State (dropdown), Show Type (multi-select), Date range picker
- "Add to Calendar" per show row
- External links to website and ticket URL where available

### 5. Signal Detection Scrapers

Build two scraper modules in `/lib/scrapers/signals/`:

**`security-monitor.ts`**
- Takes a URL + stored `RetailerMonitor` record
- Makes a plain HTTP GET (no headless browser) with realistic browser-like headers
- Compares against stored state: HTTP status code, response body byte size, presence of `cf-ray` header, presence of `__cf_bm` cookie in Set-Cookie, redirect chain length and destinations
- Returns a fully typed `SignalDetectionResult` object — never throws, always returns a result
- If fingerprint changed materially: creates a `Signal` record of type `SECURITY_ESCALATED` and updates the `RetailerMonitor` snapshot

**`queue-detector.ts`**
- Same plain HTTP approach
- Watches for:
  - Redirect to `*.queue-it.net`
  - `x-queue-it-*` response headers
  - `cf-waiting-room` class or meta tag in response body
  - Queue-it JavaScript snippet URL in HTML body
- Returns `SignalDetectionResult` with `queueProvider` field typed as `QUEUE_IT | CLOUDFLARE | CUSTOM | NONE`
- If queue detected: creates `Signal` record of type `QUEUE_DETECTED` and sets associated `Drop.status = QUEUE_ACTIVE`

### 6. Discord Notifications (`lib/discord.ts`)
- `sendDropAlert(drop, webhooks[])` — rich embed with product image, retailer, price, direct URL, signal badges
- `sendSignalAlert(signal, webhooks[])` — urgent embed for QUEUE_DETECTED and SECURITY_ESCALATED; orange/red embed color to distinguish from standard alerts
- Both functions respect per-webhook game/retailer/signalType filter settings before sending
- Handle rate limiting: on HTTP 429 response, implement exponential backoff before retrying
- Never throw — log errors and continue processing remaining webhooks

### 7. Cron Jobs

**`vercel.json`:**
```json
{
  "crons": [
    { "path": "/api/cron/scrape-inventory", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/scrape-security", "schedule": "*/3 * * * *" }
  ]
}
```

- Both cron routes must validate a `CRON_SECRET` header before executing — return 401 if missing or invalid
- Process monitors in batches to stay within Vercel function timeout limits (max 10s on hobby, 60s on pro)
- Log structured results to console (Vercel captures these in function logs)

---

## TODO.md — Initialize This File First

Create `TODO.md` at project root before writing any other file. Use exactly this format:

```markdown
# TCG Drop Tracker — Build Progress

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

## Phase 1 — Foundation
- [ ] Project scaffolding (Next.js, TypeScript, Tailwind, ESLint)
- [ ] Environment config + .env.example
- [ ] Prisma schema + Neon connection
- [ ] Clerk auth setup
- [ ] Shared UI component library (Button, Badge, Card, Modal, FilterBar, LoadingSpinner)
- [ ] Layout + navigation

## Phase 2 — Core Data + API
- [ ] Products API (CRUD)
- [ ] Drops API (CRUD + filtering)
- [ ] Signals API
- [ ] Trade Shows API (CRUD + geo)
- [ ] iCal feed endpoint
- [ ] Discord webhook registration API

## Phase 3 — Frontend
- [ ] Homepage drop feed
- [ ] Calendar view
- [ ] Trade show page — map
- [ ] Trade show page — filterable list
- [ ] User dashboard (notification prefs)
- [ ] Discord webhook management page

## Phase 4 — Scraper Infrastructure
- [ ] Base scraper class
- [ ] RetailerMonitor seeding utilities
- [ ] Security monitor signal detector
- [ ] Queue detector
- [ ] Inventory scrapers (Pokémon Center, Target, Shopify generic)
- [ ] Cron job routes + CRON_SECRET validation
- [ ] Discord notification sender with filters + rate limiting

## Phase 5 — Polish
- [ ] Geocoding for trade shows (auto lat/lng from address on save)
- [ ] Admin panel for curating drops and shows
- [ ] SEO metadata per page
- [ ] OG image generation for drops
- [ ] Mobile responsiveness audit

## Notes / Decisions Log
_Append architectural decisions here as they are made_
```

---

## Environment Variables

Maintain `.env.example` with all of the following — never hardcode any value:

```env
# Database
DATABASE_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Email (Resend)
RESEND_API_KEY=

# Maps (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=

# Cron security
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Starting Instructions for Claude Code

Execute phases in order. Do not skip ahead.

1. **Create `TODO.md` first** — exactly as specified above, before any other file
2. **Scaffold the Next.js project** with TypeScript, Tailwind CSS, ESLint, App Router enabled, `src/` directory off
3. **Set up Prisma + Neon** — implement the full schema above, run the initial migration
4. **Build shared UI components** in `/components/ui/` before any page-level work — Button, Badge, Card, Modal, FilterBar, LoadingSpinner. These are the only components that should exist before page work begins.
5. **Proceed phase by phase**, checking off `TODO.md` items as each is completed
6. **After each phase completes**, review the full file tree and refactor any duplicated logic before moving to the next phase
7. **Never scaffold placeholder pages** — every page built must have real data hookups and working state, even if seeded with local mock data initially
8. **Update `TODO.md` continuously** — it should always reflect the current real state of the project

---

## Signal Detection — Implementation Reference

This section provides additional technical detail for the scraper layer.

### What "Security Escalation" Looks Like

Retailers escalate bot protection in detectable ways before major drops:

- A page previously returning **HTTP 200** begins returning **HTTP 403, 503**, or a Cloudflare JS challenge page
- The `cf-ray` response header appears on URLs where it was previously absent
- The `server` response header changes (e.g. from `nginx` to `cloudflare`)
- Response body size drops dramatically (e.g. 150KB page becomes 8KB challenge page)
- New cookies appear in `Set-Cookie`: `__cf_bm`, `cf_clearance` indicate Cloudflare bot management activation

### What "Queue Detected" Looks Like

- HTTP redirect chain includes a destination matching `*.queue-it.net`
- Response headers include `x-queue-it-*` keys
- Response body HTML contains the string `queue-it` or the Queue-it JS widget URL
- Response body contains Cloudflare waiting room indicators: `cf-waiting-room` class, or `Checking if the site connection is secure` in body text

### RetailerMonitor State Diffing Logic

```
On each poll of a monitored URL:
  1. Make plain HTTP GET with realistic headers (no headless browser)
  2. Record: status code, body byte length, response headers as JSON, redirect chain as array
  3. Compare to stored RetailerMonitor record for this URL
  4. If any of these changed materially → create Signal + update stored snapshot:
     - Status code changed
     - Body size changed by more than 40%
     - cf-ray header appeared or disappeared
     - __cf_bm cookie appeared in Set-Cookie
     - Redirect chain changed (new destination or length)
  5. Separately check for queue signals (see above)
  6. Update RetailerMonitor.lastCheckedAt regardless of whether anything changed
```

### Why Plain HTTP (Not Headless Browser) for Signal Detection

- Cloudflare IUAM and Queue-it actively block headless browsers
- For header/fingerprint monitoring, we do not need rendered page content — HTTP response metadata is sufficient and more reliable
- Plain HTTP polling is dramatically cheaper to run at scale (no browser overhead)
- Reserve headless browser usage only for scrapers that need to read rendered DOM content (inventory status, price extraction)

---

## Notes on Retailer-Specific Scraping

- **Pokémon Center** — uses Queue-it for major exclusive drops; Cloudflare protection escalates several hours before go-live. Plain HTTP polling is reliable for signal detection. Inventory endpoint is scrapeable with standard fetch.
- **Target** — has an internal REST API (`api.target.com`) that is reverse-engineerable and widely used by monitor tools. More reliable than scraping HTML.
- **Walmart** — actively fights scrapers; rotate user agents and consider a proxy layer for inventory scraping. Signal detection via plain HTTP is still viable.
- **Shopify stores** — all Shopify stores expose `/products.json` as a public endpoint. A single generic scraper covers all independent game stores and LGS running on Shopify. This is the easiest and most scalable scraping target.
- **GameStop / Best Buy** — HTML scraping with CSS selector targeting the add-to-cart button state. Relatively stable DOM structures.

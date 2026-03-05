# TCG Drop Tracker — Build Progress

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

## Phase 1 — Foundation
- [x] Project scaffolding (Next.js, TypeScript, Tailwind, ESLint)
- [x] Environment config + .env.example
- [x] Prisma schema + Neon connection
- [x] Clerk auth setup
- [x] Shared UI component library (Button, Badge, Card, Modal, FilterBar, LoadingSpinner)
- [x] Layout + navigation

## Phase 2 — Core Data + API
- [x] Products API (CRUD)
- [x] Drops API (CRUD + filtering)
- [x] Signals API
- [x] Trade Shows API (CRUD + geo)
- [x] iCal feed endpoint
- [x] Discord webhook registration API

## Phase 3 — Frontend
- [x] Homepage drop feed
- [x] Calendar view
- [x] Trade show page — map
- [x] Trade show page — filterable list
- [x] User dashboard (notification prefs)
- [x] Discord webhook management page

## Phase 4 — Scraper Infrastructure
- [x] Base scraper class
- [x] RetailerMonitor seeding utilities
- [x] Security monitor signal detector
- [x] Queue detector
- [x] Inventory scrapers (Pokemon Center, Target, Shopify generic)
- [x] Cron job routes + CRON_SECRET validation
- [x] Discord notification sender with filters + rate limiting

## Phase 5 — Polish
- [x] Geocoding for trade shows (auto lat/lng from address on save)
- [x] Admin panel for curating drops and shows
- [x] SEO metadata per page
- [x] OG image generation for drops
- [x] Mobile responsiveness audit

## Phase 6 — Production Ready
- [x] Deploy to Vercel (https://tcg-drop-tracker.vercel.app/)
- [x] Neon database connected
- [x] Clerk auth working
- [x] Job logging (JobLog model, /admin/jobs)
- [x] URL monitor management (/admin/monitors)
- [x] Calendar drop detail modal
- [x] Admin delete buttons
- [~] Bulk import monitor URLs from retailers (THOUSANDS of products)
- [ ] External cron service for Hobby plan (or upgrade to Pro)

## Notes / Decisions Log
- 2026-03-05: ALWAYS use Lucide icons, NEVER use emojis in production code
- 2026-03-05: Using Prisma 7 which moves datasource URL to prisma.config.ts instead of schema.prisma
- 2026-03-05: Prisma 7 requires explicit import path: `@prisma/client/index.js`
- 2026-03-05: Prisma 7 requires adapter - using @prisma/adapter-neon with @neondatabase/serverless
- 2026-03-05: Clerk v7 removed SignedIn/SignedOut components - use `useAuth()` hook with `isSignedIn` instead
- 2026-03-05: Next.js 16 deprecates middleware.ts in favor of proxy - Clerk middleware still works but shows warning
- 2026-03-05: react-map-gl has compatibility issues with Turbopack - using Mapbox Static Images API as fallback
- 2026-03-05: Phases 1-4 complete - Core application functionality built
- 2026-03-05: Phase 5 complete - Geocoding, admin panel, SEO, OG images, mobile responsiveness all implemented
- 2026-03-05: BUILD VERIFIED - All 24 routes compiled successfully with Next.js 16.1.6 + Turbopack
- 2026-03-05: DEPLOYED to Vercel - https://tcg-drop-tracker.vercel.app/
- 2026-03-05: Clerk updated to use `<Show>` component and `proxy.ts` instead of middleware
- 2026-03-05: Neon database connected (ep-cool-pine-ai0tvdkb-pooler)
- 2026-03-05: Added JobLog model for cron monitoring
- 2026-03-05: Vercel cron jobs require Pro plan ($20/mo) for automatic execution

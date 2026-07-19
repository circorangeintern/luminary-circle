# MarketCompare Backend

Crowd-sourced local food price comparison for Nigerian markets.
Built for the Orange Internship Programme, Circo Digital Academy (Luminary-circle).

## Stack

NestJS · PostgreSQL (Neon) · Prisma 7 · Upstash Redis · JWT auth

## Setup

    pnpm install
    cp .env.example .env      # fill in the values below
    pnpm prisma generate
    pnpm prisma migrate dev
    pnpm prisma db seed       # items, units, markets, 156 demo prices
    pnpm start:dev

## Environment

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Neon pooled connection (runtime) |
| `DIRECT_URL` | Neon direct connection (migrations only) |
| `JWT_SECRET` | 32+ characters |
| `JWT_EXPIRES_IN` | e.g. `1d`, `12h`, `30m` |
| `UPSTASH_REDIS_URL` | `rediss://` TCP URL (rate limiting) |
| `FRESHNESS_WINDOW_DAYS` | Stale-price threshold (default 7) |
| `FLAG_MARK_THRESHOLD` | Flags before a price is marked (default 2) |
| `FLAG_EXCLUDE_THRESHOLD` | Flags before exclusion (default 3) |

## API docs

Swagger UI at `http://localhost:3000/api/docs` (non-production only).
The written API Contract v1 is the source of truth; Swagger mirrors it.

## Scripts

    pnpm start:dev     # watch mode
    pnpm build
    pnpm lint
    pnpm test          # unit tests
    pnpm test:e2e

## Docs

API Contract v1 · Backend Data Model v1.0 · ERD — shared in the team channel.

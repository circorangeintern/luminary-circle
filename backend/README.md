# MarketCompare Backend

Crowd-sourced local food price comparison for Nigerian markets. Built for the Orange Internship Programme, Circo Digital Academy (Luminary-circle).

## What it does

Shoppers submit real prices they see at local markets. The app compares those prices across markets for the same item, shows whether prices are trending up or down, and lets the community flag bad data. No account needed to browse; an account is only required to contribute.

## Stack

NestJS 11 · PostgreSQL (Neon) · Prisma 7 · Upstash Redis · JWT auth · Cloudflare Turnstile · Biome

## Setup

```bash
    pnpm install
    cp .env.example .env      # fill in the values below
    pnpm prisma generate
    pnpm prisma migrate dev
    pnpm prisma db seed        # 10 items, 5 markets, ~1,160 demo prices
    pnpm start:dev
```

## Environment

| Variable | Purpose |
| -------- | ------- |
| `NODE_ENV` | `development` \| `test` \| `staging` \| `production` |
| `DATABASE_URL` | Neon pooled connection (runtime) |
| `DIRECT_URL` | Neon direct connection (migrations only) |
| `JWT_SECRET` | 32+ characters |
| `JWT_EXPIRES_IN` | e.g. `1d`, `12h`, `30m` |
| `UPSTASH_REDIS_URL` | `rediss://` TCP URL (rate limiting) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile, gates registration |
| `MIXPANEL_TOKEN` | Analytics dual-write destination |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins |
| `CORS_ALLOW_VERCEL_PREVIEWS` | `true` on staging only |
| `FRESHNESS_WINDOW_DAYS` | Stale-price threshold (default 7) |
| `FLAG_MARK_THRESHOLD` | Flags before a price is marked (default 2) |
| `FLAG_EXCLUDE_THRESHOLD` | Flags before exclusion from public views (default 3) |
| `PRICE_SUBMIT_LIMIT_PER_HOUR` | Default 10 |
| `PRICE_SUBMIT_LIMIT_PER_MARKET_PER_HOUR` | Default 5 |

Full reference values in `.env.example`.

## API

Everything is documented at `/api/docs` (Swagger, non-production only) and in the written **API Contract**, which is the source of truth if the two ever disagree. A Bruno collection generated from the OpenAPI spec lives in `bruno/`.

Live environments:

- Staging: `https://staging.marketcompare.name.ng/api/v1`
- Production: `https://api.marketcompare.name.ng/api/v1`

## Architecture notes

- **Error handling**: every thrown error passes through a global exception filter and comes out as `{ success, error: { code, message, details? } }`. See `src/common/errors/`.
- **The Price object** (`src/prices/price.mapper.ts`) is built once and reused by every endpoint that returns a price — submission, feed, comparison, trend — so the shape never drifts between them.
- **Analytics** dual-writes to Postgres (`analytics_events` table, queried directly for KPIs) and Mixpanel (funnels/retention). Neither write can block or fail the request that triggered it.
- **Auth**: phone + password, no SMS verification. Registration is gated by Cloudflare Turnstile. Login has a single failure shape (see comment in `auth.service.ts`) to prevent account enumeration.

## Scripts

```bash
    pnpm start:dev     # watch mode
    pnpm build
    pnpm lint           # biome check
    pnpm lint:fix        # biome check --write
    pnpm format         # biome format --write
    pnpm test            # unit tests
    pnpm test:cov        # with coverage
    pnpm test:e2e
```

## Testing

Unit tests cover phone normalization, auth (including the anti-enumeration property and captcha gating), and price submission's rejection paths. Comparison and trend are verified via `bruno/` and `http_check/` against real seeded data rather than heavily-mocked unit tests, since their logic lives mostly in raw SQL and Prisma queries that are cheaper to verify against a real database.

## Deployment

Hetzner VPS, nginx + pm2 + certbot. Three checkouts:

- `~/marketcompare` (branch `staging`) → staging API
- `~/marketcompare-prod` (branch `main`) → production API + frontend

Redeploy: `git pull && pnpm install --frozen-lockfile && pnpm prisma migrate deploy && pnpm build && pm2 restart <name>`.

## Docs

API Contract v1 · Backend Data Model v1.0 · ERD — shared in the team channel.

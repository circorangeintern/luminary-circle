# MarketCompare

Crowd-sourced local food price comparison for Nigerian markets.
Built for the Orange Internship Programme, Circo Digital Academy (Luminary-circle).

## Architecture

```
luminary-circle/
├── backend/       NestJS + Prisma + PostgreSQL + Redis
├── frontend/      React 19 + TypeScript + Vite 8
└── README.md
```

---

## Backend

NestJS REST API with Prisma 7 ORM, PostgreSQL (Neon), Redis rate-limiting, and JWT auth.

### Stack

NestJS · PostgreSQL (Neon) · Prisma 7 · Upstash Redis · JWT · Swagger

### Setup

```bash
cd backend
pnpm install
cp .env.example .env        # fill in values below
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed          # items, units, markets, 156 demo prices
pnpm start:dev
```

### Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon pooled connection (runtime) |
| `DIRECT_URL` | Neon direct connection (migrations only) |
| `JWT_SECRET` | 32+ characters |
| `JWT_EXPIRES_IN` | e.g. `1d`, `12h`, `30m` |
| `UPSTASH_REDIS_URL` | `rediss://` TCP URL (rate limiting) |
| `FRESHNESS_WINDOW_DAYS` | Stale-price threshold (default 7) |
| `FLAG_MARK_THRESHOLD` | Flags before a price is marked (default 2) |
| `FLAG_EXCLUDE_THRESHOLD` | Flags before exclusion (default 3) |

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm start:dev` | Watch mode |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | End-to-end tests |

### API Docs

Swagger UI at `http://localhost:3000/api/docs` (non-production only).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create account (displayName, phone, password) |
| POST | `/api/v1/auth/login` | No | Sign in (phone, password) |
| GET | `/api/v1/auth/me` | JWT | Current user info |
| GET | `/api/v1/items` | No | List all food items with units |
| GET | `/api/v1/markets` | No | List all markets |
| GET | `/api/v1/prices` | No | Query prices (itemId, unitId, marketId, page, pageSize) |
| POST | `/api/v1/prices` | JWT | Submit a new price |

---

## Frontend

React 19 SPA with Tailwind CSS, Recharts, and Axios.

### Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS · Recharts · Axios · React Router 7

### Setup

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL to the backend URL
npm run dev
```

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Backend API base URL |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint |

### Pages

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Home | No | Hero, price comparison, price trend |
| `/prices` | Prices | No | Compare & trend sections |
| `/prices/list` | PriceList | No | Full price data table |
| `/signin` | SignIn | No | Phone + password login |
| `/create-account` | CreateAccount | No | Registration form |
| `/submit` | SubmitPrice | Yes | Submit a new price |
| `/about` | About | No | About page |
| `/contact` | Contact | No | Contact page |

### Business Rules

- **Auth required** for price submission and flagging
- **Staleness**: prices 7+ days old are dimmed (server `isStale` field)
- **Flagging**: flagged prices are still shown but dimmed (server `isFlagged`/`flagCount`)
- **Seed data**: demo prices labelled "Source: NBS" (`source: SEED_DEMO`)
- **Empty states**: shown per page when no markets, items, or prices exist
- **Search**: type in the Hero search bar + Enter to filter products on the Prices page

---

## Deployed

Staging API: `https://staging.marketcompare.name.ng/api/v1`  
Staging Swagger: `https://staging.marketcompare.name.ng/api/docs`

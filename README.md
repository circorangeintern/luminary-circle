# MarketCompare

Crowd-sourced local food price comparison for Nigerian markets.
Built for the Orange Internship Programme, Circo Digital Academy (Luminary-circle).

## Architecture

```
luminary-circle/
├── frontend/      React 19 + TypeScript + Vite 8
└── README.md
```

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
| `/privacy-policy` | PrivacyPolicy | No | Privacy policy page |

### Business Rules

- **Auth required** for price submission and flagging
- **Staleness**: prices 7+ days old are dimmed (server `isStale` field)
- **Flagging**: flagged prices are still shown but dimmed (server `isFlagged`/`flagCount`)
- **Seed data**: demo prices labelled "Source: NBS" (`source: SEED_DEMO`)
- **Empty states**: shown per page when no markets, items, or prices exist
- **Search**: type in the Hero search bar + Enter to filter products on the Prices page
- **Captcha**: Cloudflare Turnstile required on account registration
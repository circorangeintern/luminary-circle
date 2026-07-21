# Market Compare — Frontend

React 19 + TypeScript + Vite 8 frontend for the Market Compare price comparison platform.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend API base URL |

## Project Layout

```
src/
├── components/       # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ComparePrices.tsx
│   ├── PriceTrend.tsx
│   ├── SubmissionBanner.tsx
│   └── SubmissionConfirmation.tsx
├── pages/            # Route-level page components
│   ├── Home.tsx
│   ├── Prices.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Directory.tsx
│   ├── SignIn.tsx
│   ├── CreateAccount.tsx
│   └── SubmitPrice.tsx
├── services/         # API client and types
│   └── api.ts
├── App.tsx           # Root component with routing
├── main.tsx          # Entry point
└── index.css         # Global styles and Tailwind theme
```

# Market Compare

A market price comparison platform that helps shoppers make informed decisions by providing real-time price comparisons across local markets. Built as part of the Orange Internship Program 2026.

## Project Structure

```
luminary-circle/
├── frontend/          # React + TypeScript + Vite frontend
└── README.md
```

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite 8** for build tooling
- **Tailwind CSS 4** for styling
- **React Router v7** for routing
- **Axios** for API communication
- **Recharts** for price trend charts
- **Oxlint** for linting

## Getting Started

### Prerequisites
- Node.js >= 18
- npm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
cd frontend
npm run build
```

### Lint

```bash
cd frontend
npm run lint
```

## API Configuration

The frontend connects to a backend API at `http://localhost:3000/api` by default. Override with the `VITE_API_URL` environment variable.

## Features

- **Price Comparison** – Compare food prices across multiple markets side-by-side
- **Price Trends** – Visualize historical price movements with interactive charts
- **Market Directory** – Browse markets and the products they offer
- **Price Submission** – Contribute price data to help the community
- **User Accounts** – Sign up and sign in (coming soon with backend integration)

## License

MIT


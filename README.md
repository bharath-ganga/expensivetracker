# FinFlow

FinFlow is a responsive personal finance manager for tracking day-to-day spending and planning longer-term financial goals. It combines a React and TypeScript interface with Supabase authentication, storage, and a row-level-secured PostgreSQL database.

## Features

- Dashboard with balances, cash-flow summaries, recent activity, budget progress, and monthly reports
- Income and expense tracking with categories, tags, recurring schedules, moods, and receipt uploads
- Monthly category budgets and spending analytics
- Calendar view for transactions and scheduled financial activity
- Savings goals with contribution history and progress tracking
- Bill reminders with recurring schedules and payment status
- Shared-expense splitting with participant settlement tracking
- Debt and IOU management, including partial payments and due dates
- Investment portfolio tracking for stocks, crypto, mutual funds, gold, and other assets
- Prioritized wishlist with prices, links, target dates, and purchase status
- Profile, currency, theme, and data-export settings
- Responsive desktop and mobile navigation

## Tech stack

- React 18, TypeScript, and Vite
- Tailwind CSS and shadcn/ui
- Supabase Auth, PostgreSQL, Storage, and Row Level Security
- TanStack Query and Zustand
- Recharts
- Vitest and ESLint

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project

### Install and run

```bash
git clone https://github.com/bharath-ganga/expensivetracker.git
cd expensivetracker
npm install
Copy-Item .env.example .env
npm run dev
```

On macOS or Linux, replace the PowerShell copy command with:

```bash
cp .env.example .env
```

Set these values in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Vite prints the local development URL after startup.

## Supabase setup

Run the SQL files in the Supabase SQL Editor in this order:

1. `supabase/migrations/202608290001_finflow_foundation.sql`
2. `supabase/migrations/202608290002_legacy_expense_compatibility.sql`

The foundation migration is idempotent and supports both fresh projects and upgrades without deleting existing financial records. It creates the application tables, database functions, receipt-storage bucket, and Row Level Security policies that isolate each user's data. The compatibility migration upgrades older expense schemas.

`supabase_schema.sql` remains available as a legacy consolidated schema reference. New installations should use the versioned migrations above.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript validation |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |
| `npm run check` | Run type-checking, linting, tests, and a production build |

For the manual end-to-end checklist, see [`docs/TESTING.md`](docs/TESTING.md).

## Security notes

- Never commit `.env` or service-role credentials.
- The browser app should use only the Supabase anonymous key.
- Apply the included Row Level Security policies before using real financial data.

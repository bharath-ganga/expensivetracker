# 💸 FinFlow: Premium Personal Finance Manager

**FinFlow** is a modern, responsive, and feature-rich personal finance tracking and management application built using React, TypeScript, Tailwind CSS, and Supabase. It empowers users to monitor transactions, budget smartly, manage debts, track investments, plan wishlists, and analyze their spending habits with premium interactive charts and calendar views.

---

## 🚀 Key Features

- **🔐 Supabase Authentication & Onboarding**: Seamless sign-up/login with personalized onboarding to capture monthly salary, pay date, and monthly savings goals.
- **📊 Premium Dashboard**: High-level dashboard showcasing overall balance, monthly salary, savings rate, recent transactions, category budgets, and income vs. expense progress.
- **💵 Smart Transaction Management**: Easily add, edit, and filter expenses and incomes, tag transactions, log mood, upload receipt URLs, and configure recurring schedules.
- **🎯 Category Budgeting**: Set custom monthly budgets for specific categories (e.g., Food, Travel, Entertainment) and track real-time consumption with interactive progress bars.
- **📅 Finance Calendar View**: Visual calendar showcasing transactions, bills, and due dates directly on their scheduled dates.
- **🤝 Debt & IOUs Ledger**: Keep track of borrowing and lending. Monitor who owes you or who you owe, track partial payments, due dates, and update statuses.
- **📈 Portfolio & Investments Tracker**: Log your stock, cryptocurrency, mutual fund, and gold portfolios with automated tracking of total invested amounts vs. current values.
- **✨ Wishlist Board (Buy Later)**: Prioritized list of desired purchases with target dates, links, prices, and status toggles.
- **⚙️ Settings & Customization**: Manage user profile details, toggle system themes (Light/Dark mode), and export financial data to JSON or CSV formats.

---

## 🛠️ Built With

- **Vite** – Fast development environment & build tool
- **React 18** & **TypeScript** – Component-based UI with strong static typing
- **Tailwind CSS** & **shadcn/ui** – A fully premium, responsive design system
- **Recharts** – Interactive and responsive charts for visual analytics
- **Zustand** – Light-weight state management
- **Supabase** – Backend-as-a-service providing user authentication and real-time database storage

---

## 📦 Database Schema Setup

If you are setting up your own Supabase instance, execute the comprehensive SQL script found in `supabase_schema.sql` via the Supabase SQL Editor. It configures the following:

- `profiles` table (salary, pay date, goals, onboarding)
- `expenses` table (amount, categories, description, date, recurring options)
- `debts` table (persons, type, borrow/due dates, paid/remaining amounts)
- `investments` table (portfolio name, type, invested amount, current value)
- `wishlist` table (priority, link, price, target dates)
- `monthly_reports` table (calculated budget scores, top category tracker)
- Complete **Row Level Security (RLS)** policies to ensure users can only access their own data.

---

## ⚙️ Getting Started

### 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **bun** / **yarn**

### 💻 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bharath-ganga/expensivetracker.git
   cd expensivetracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (using `.env.example` if available) and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local address (typically `http://localhost:8080` or `http://localhost:5173`).

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

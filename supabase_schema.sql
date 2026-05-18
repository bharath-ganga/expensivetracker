-- SpendSmart / FinFlow Complete Supabase Database Schema
-- Execute these commands in your Supabase SQL Editor to set up the entire database from scratch!

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. Profiles Table (User settings, salary, onboarding)
-- =========================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  monthly_salary NUMERIC DEFAULT 0,
  pay_date INTEGER DEFAULT 1,
  savings_goal_percent NUMERIC DEFAULT 20,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 2. Expenses Table (Core transactions)
-- =========================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  description TEXT NOT NULL,
  category_id TEXT DEFAULT 'General',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT, -- 'daily', 'weekly', 'monthly'
  tags TEXT[] DEFAULT '{}',
  mood TEXT DEFAULT 'neutral',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 3. Debts Table (IOUs and Borrowings)
-- =========================================================================
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  contact TEXT,
  amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  type TEXT NOT NULL, -- 'i_owe' or 'owed_to_me'
  borrowed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'settled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 4. Investments Table (Portfolio items)
-- =========================================================================
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Stocks', 'Crypto', 'Mutual Funds', 'Gold', etc.
  amount_invested NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 5. Wishlist Table (Buy Later products)
-- =========================================================================
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  estimated_price NUMERIC NOT NULL,
  priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  link TEXT,
  target_date DATE NOT NULL,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 6. Monthly Reports Table (Simulated financial report cards)
-- =========================================================================
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_spent NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_saved NUMERIC DEFAULT 0,
  budget_score NUMERIC DEFAULT 0,
  top_category TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- Row Level Security (RLS) Configuration
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS Policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
CREATE POLICY "Users can manage their own profile" 
ON profiles FOR ALL USING (auth.uid() = id);

-- 2. Expenses RLS Policies
DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
CREATE POLICY "Users can manage their own expenses" 
ON expenses FOR ALL USING (auth.uid() = user_id);

-- 3. Debts RLS Policies
DROP POLICY IF EXISTS "Users can manage their own debts" ON debts;
CREATE POLICY "Users can manage their own debts" 
ON debts FOR ALL USING (auth.uid() = user_id);

-- 4. Investments RLS Policies
DROP POLICY IF EXISTS "Users can manage their own investments" ON investments;
CREATE POLICY "Users can manage their own investments" 
ON investments FOR ALL USING (auth.uid() = user_id);

-- 5. Wishlist RLS Policies
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON wishlist;
CREATE POLICY "Users can manage their own wishlist" 
ON wishlist FOR ALL USING (auth.uid() = user_id);

-- 6. Monthly Reports RLS Policies
DROP POLICY IF EXISTS "Users can manage their own monthly reports" ON monthly_reports;
CREATE POLICY "Users can manage their own monthly reports" 
ON monthly_reports FOR ALL USING (auth.uid() = user_id);

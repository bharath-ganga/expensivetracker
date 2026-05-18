-- Execute these commands in your Supabase SQL Editor

-- 0. Profiles Table
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

-- 1. Debts Table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  contact TEXT,
  amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  type TEXT NOT NULL, -- 'i_owe' or 'owed_to_me'
  borrowed_date DATE NOT NULL,
  due_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'settled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Investments Table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount_invested NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Wishlist Table
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

-- 4. Monthly Reports Table
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

-- 5. Update Expenses Table to include Mood
-- Note: Assuming expenses table already exists
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS mood TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Set up Row Level Security (RLS) for new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Users can view and update their own profile" 
ON profiles FOR ALL USING (auth.uid() = id);

-- Policies for Debts
CREATE POLICY "Users can manage their own debts" 
ON debts FOR ALL USING (auth.uid() = user_id);

-- Policies for Investments
CREATE POLICY "Users can manage their own investments" 
ON investments FOR ALL USING (auth.uid() = user_id);

-- Policies for Wishlist
CREATE POLICY "Users can manage their own wishlist" 
ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Policies for Monthly Reports
CREATE POLICY "Users can view their own monthly reports" 
ON monthly_reports FOR ALL USING (auth.uid() = user_id);

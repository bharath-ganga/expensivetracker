export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  monthly_salary?: number;
  pay_date?: number;
  savings_goal_percent?: number;
  onboarding_complete?: boolean;
  default_currency?: CurrencyCode;
  budget_alerts_enabled?: boolean;
  reminder_notifications_enabled?: boolean;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  kind: 'expense' | 'income' | 'both';
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  category_ref?: string | null;
  amount: number;
  currency: CurrencyCode | string;
  description: string;
  date: string;
  receipt_url?: string | null;
  is_recurring: boolean;
  recurring_interval?: RecurringInterval | null;
  tags: string[];
  mood?: 'happy' | 'neutral' | 'guilty' | 'excited' | 'stressed' | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  categories?: Category | null;
}

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  currency: CurrencyCode | string;
  source: string;
  category_id?: string | null;
  date: string;
  is_recurring: boolean;
  recurring_interval?: RecurringInterval | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryBudget {
  id: string;
  user_id: string;
  category_name: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  status: 'active' | 'completed' | 'paused';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  note?: string | null;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  person_name: string;
  contact?: string | null;
  amount: number;
  paid_amount: number;
  type: 'i_owe' | 'owed_to_me';
  borrowed_date: string;
  due_date?: string | null;
  notes?: string | null;
  status: 'pending' | 'partial' | 'settled';
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  note?: string | null;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: string;
  amount_invested: number;
  current_value: number;
  start_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  item_name: string;
  estimated_price: number;
  priority: 'High' | 'Medium' | 'Low';
  link?: string | null;
  target_date?: string | null;
  is_purchased: boolean;
  purchased_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  amount?: number | null;
  due_date: string;
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly';
  status: 'pending' | 'paid' | 'dismissed';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SplitExpense {
  id: string;
  user_id: string;
  title: string;
  total_amount: number;
  paid_by: string;
  expense_date: string;
  notes?: string | null;
  status: 'open' | 'settled';
  created_at: string;
  updated_at: string;
}

export interface SplitParticipant {
  id: string;
  split_expense_id: string;
  user_id: string;
  participant_name: string;
  amount_owed: number;
  amount_paid: number;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyReport {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_spent: number;
  total_earned: number;
  total_saved: number;
  budget_score: number;
  top_category?: string | null;
  generated_at: string;
}

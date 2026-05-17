export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  monthly_salary?: number;
  pay_date?: number;
  savings_goal_percent?: number;
  onboarding_complete?: boolean;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  monthly_budget: number;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  description: string;
  date: string;
  receipt_url?: string;
  is_recurring: boolean;
  recurring_interval?: 'daily' | 'weekly' | 'monthly';
  tags: string[];
  created_at: string;
  
  // Joined relation for UI
  categories?: Category;
}

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  date: string;
  notes?: string;
  created_at: string;
}

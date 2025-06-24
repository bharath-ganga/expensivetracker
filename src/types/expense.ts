
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  userId: string;
}

export interface ExpenseFormData {
  title: string;
  amount: string;
  category: string;
  date: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Other'
] as const;

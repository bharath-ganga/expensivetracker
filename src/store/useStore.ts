import { create } from 'zustand';
import { User, Category, Expense, Income } from '@/types/database';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  currency: string;
  setCurrency: (currency: string) => void;

  categories: Category[];
  setCategories: (categories: Category[]) => void;
  
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  
  incomes: Income[];
  setIncomes: (incomes: Income[]) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  currency: 'INR',
  setCurrency: (currency) => set({ currency }),
  
  categories: [],
  setCategories: (categories) => set({ categories }),
  
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  
  incomes: [],
  setIncomes: (incomes) => set({ incomes }),
}));

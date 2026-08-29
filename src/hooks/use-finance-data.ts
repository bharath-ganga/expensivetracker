import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { Category, Expense, Income } from '@/types/database';

export const useFinanceData = (userId?: string) => {
  const { setExpenses, setIncomes, setCategories, setFinanceStatus } = useStore();

  const refresh = useCallback(async () => {
    if (!userId) {
      setExpenses([]);
      setIncomes([]);
      setCategories([]);
      setFinanceStatus(false);
      return;
    }

    setFinanceStatus(true);
    const [expensesResult, incomesResult, categoriesResult] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('incomes').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', userId).order('name'),
    ]);

    const error = expensesResult.error || incomesResult.error || categoriesResult.error;
    if (error) {
      setFinanceStatus(false, error.message);
      return;
    }

    setExpenses((expensesResult.data || []) as Expense[]);
    setIncomes((incomesResult.data || []) as Income[]);
    setCategories((categoriesResult.data || []) as Category[]);
    setFinanceStatus(false);
  }, [setCategories, setExpenses, setFinanceStatus, setIncomes, userId]);

  useEffect(() => {
    void refresh();
    if (!userId) return;

    const channel = supabase
      .channel(`finance:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incomes', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` }, refresh)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  return { refresh };
};

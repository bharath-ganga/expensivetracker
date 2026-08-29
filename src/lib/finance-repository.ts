import { supabase } from '@/lib/supabase';
import type { CurrencyCode, RecurringInterval } from '@/types/database';

export interface ExpenseInput {
  amount: number;
  currency: CurrencyCode | string;
  description: string;
  category_id: string;
  date: string;
  receipt_url?: string | null;
  is_recurring?: boolean;
  recurring_interval?: RecurringInterval | null;
  tags?: string[];
  mood?: 'happy' | 'neutral' | 'guilty' | 'excited' | 'stressed' | null;
  notes?: string | null;
}

export interface IncomeInput {
  amount: number;
  currency: CurrencyCode | string;
  source: string;
  category_id?: string;
  date: string;
  is_recurring?: boolean;
  recurring_interval?: RecurringInterval | null;
  notes?: string | null;
}

const ensurePositiveAmount = (amount: number) => {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than zero.');
};

export const financeRepository = {
  async createExpense(userId: string, input: ExpenseInput) {
    ensurePositiveAmount(input.amount);
    const { data, error } = await supabase.from('expenses').insert({
      user_id: userId,
      ...input,
      is_recurring: input.is_recurring ?? false,
      tags: input.tags ?? [],
    }).select('*').single();
    if (error) throw error;
    return data;
  },

  async updateExpense(userId: string, id: string, input: ExpenseInput) {
    ensurePositiveAmount(input.amount);
    const { data, error } = await supabase.from('expenses').update(input).eq('id', id).eq('user_id', userId).select('*').single();
    if (error) throw error;
    return data;
  },

  async deleteExpense(userId: string, id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  async createIncome(userId: string, input: IncomeInput) {
    ensurePositiveAmount(input.amount);
    const { data, error } = await supabase.from('incomes').insert({
      user_id: userId,
      ...input,
      is_recurring: input.is_recurring ?? false,
    }).select('*').single();
    if (error) throw error;
    return data;
  },

  async updateIncome(userId: string, id: string, input: IncomeInput) {
    ensurePositiveAmount(input.amount);
    const { data, error } = await supabase.from('incomes').update(input).eq('id', id).eq('user_id', userId).select('*').single();
    if (error) throw error;
    return data;
  },

  async deleteIncome(userId: string, id: string) {
    const { error } = await supabase.from('incomes').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  async uploadReceipt(userId: string, file: File) {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      throw new Error('Receipt must be an image or PDF.');
    }
    if (file.size > 8 * 1024 * 1024) throw new Error('Receipt must be smaller than 8 MB.');

    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('receipts').upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  },

  async createSignedReceiptUrl(path: string) {
    const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 60 * 10);
    if (error) throw error;
    return data.signedUrl;
  },
};

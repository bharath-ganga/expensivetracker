import { addMonths, differenceInCalendarDays, endOfMonth, startOfDay, subDays } from 'date-fns';

const dateForPayDay = (year: number, month: number, payDay: number) => {
  const monthEnd = endOfMonth(new Date(year, month, 1)).getDate();
  return new Date(year, month, Math.min(Math.max(payDay, 1), monthEnd));
};

export const getPayCycleBounds = (reference = new Date(), payDay = 1) => {
  const today = startOfDay(reference);
  let start = dateForPayDay(today.getFullYear(), today.getMonth(), payDay);
  if (today < start) {
    const previousMonth = addMonths(start, -1);
    start = dateForPayDay(previousMonth.getFullYear(), previousMonth.getMonth(), payDay);
  }
  const nextMonth = addMonths(start, 1);
  const nextStart = dateForPayDay(nextMonth.getFullYear(), nextMonth.getMonth(), payDay);
  const end = subDays(nextStart, 1);
  return {
    start,
    end,
    daysRemaining: Math.max(1, differenceInCalendarDays(end, today) + 1),
    totalDays: differenceInCalendarDays(end, start) + 1,
    elapsedDays: Math.max(1, differenceInCalendarDays(today, start) + 1),
  };
};

export const isDateInRange = (value: string, start: Date, end: Date) => {
  const date = startOfDay(new Date(`${value.slice(0, 10)}T00:00:00`));
  return date >= startOfDay(start) && date <= startOfDay(end);
};

export const calculateBudgetHealth = (spent: number, available: number) => {
  if (available <= 0) return 0;
  return Math.max(0, Math.min(100, 100 - (spent / available) * 100));
};

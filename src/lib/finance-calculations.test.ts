import { describe, expect, it } from 'vitest';
import { calculateBudgetHealth, getPayCycleBounds, isDateInRange } from './finance-calculations';

describe('getPayCycleBounds', () => {
  it('uses the current month when the pay day has passed', () => {
    const result = getPayCycleBounds(new Date(2026, 7, 29), 25);
    expect(result.start).toEqual(new Date(2026, 7, 25));
    expect(result.end).toEqual(new Date(2026, 8, 24));
    expect(result.daysRemaining).toBe(27);
  });

  it('uses the previous month when the next pay day has not arrived', () => {
    const result = getPayCycleBounds(new Date(2026, 7, 10), 25);
    expect(result.start).toEqual(new Date(2026, 6, 25));
    expect(result.end).toEqual(new Date(2026, 7, 24));
  });

  it('clamps pay days for short months', () => {
    const result = getPayCycleBounds(new Date(2026, 1, 28), 31);
    expect(result.start).toEqual(new Date(2026, 1, 28));
    expect(result.end).toEqual(new Date(2026, 2, 30));
  });
});

describe('finance calculations', () => {
  it('checks inclusive date ranges', () => {
    expect(isDateInRange('2026-08-25', new Date(2026, 7, 25), new Date(2026, 8, 24))).toBe(true);
    expect(isDateInRange('2026-09-25', new Date(2026, 7, 25), new Date(2026, 8, 24))).toBe(false);
  });

  it('clamps budget health between zero and one hundred', () => {
    expect(calculateBudgetHealth(20, 100)).toBe(80);
    expect(calculateBudgetHealth(150, 100)).toBe(0);
    expect(calculateBudgetHealth(0, 0)).toBe(0);
  });
});

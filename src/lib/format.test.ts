import { describe, expect, it } from 'vitest';
import { escapeCsvCell, formatCurrency, toDateInputValue } from './format';

describe('format utilities', () => {
  it('escapes quotes in CSV cells', () => {
    expect(escapeCsvCell('Coffee "large"')).toBe('"Coffee ""large"""');
  });

  it('falls back to INR for an unknown currency', () => {
    expect(formatCurrency(1250, 'UNKNOWN')).toContain('1,250');
  });

  it('creates an ISO date input value', () => {
    expect(toDateInputValue(new Date('2026-08-29T10:00:00.000Z'))).toBe('2026-08-29');
  });
});

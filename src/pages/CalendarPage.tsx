import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Receipt, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import type { Expense, Income } from '@/types/database';

type CalendarItem = (Expense & { kind: 'expense' }) | (Income & { kind: 'income' });

export const CalendarPage = () => {
  const { expenses, incomes } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const expensesByDate = useMemo(() => {
    const map = new Map<string, { spent: number, earned: number, items: CalendarItem[] }>();
    expenses.forEach(expense => {
      const dateStr = expense.date.split('T')[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, { spent: 0, earned: 0, items: [] });
      }
      const dayData = map.get(dateStr)!;
      dayData.spent += expense.amount;
      dayData.items.push({ ...expense, kind: 'expense' });
    });
    incomes.forEach(income => {
      const dateStr = income.date.split('T')[0];
      if (!map.has(dateStr)) map.set(dateStr, { spent: 0, earned: 0, items: [] });
      const dayData = map.get(dateStr)!;
      dayData.earned += income.amount;
      dayData.items.push({ ...income, kind: 'income' });
    });
    return map;
  }, [expenses, incomes]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar padding for start day
  const startDay = startOfMonth(currentMonth).getDay();
  const blanks = Array.from({ length: startDay }).map((_, i) => i);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cashflow Calendar</h1>
          <p className="text-muted-foreground">Track your daily spending and upcoming bills.</p>
        </div>
      </div>

      <div className="flex gap-6">
        <Card className="glass flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="border-2 border-border bg-background">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentMonth(new Date())} className="border-2 border-border bg-background">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="border-2 border-border bg-background">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="h-20 border border-border bg-secondary md:h-24" />
              ))}
              {daysInMonth.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayData = expensesByDate.get(dateStr) || { spent: 0, earned: 0, items: [] };
                
                // Color coding
                let colorClass = 'bg-secondary/30 hover:bg-secondary/50';
                if (dayData.spent > 0) {
                  if (dayData.spent > 2000) colorClass = 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30';
                  else if (dayData.spent > 500) colorClass = 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30';
                  else colorClass = 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30';
                }

                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentToday = isToday(date);

                return (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`relative flex h-20 flex-col border border-border p-2 text-left transition-colors md:h-24
                      ${colorClass} 
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                      ${isCurrentToday ? 'border-primary/50' : ''}
                    `}
                  >
                    <span className={`text-sm font-semibold ${isCurrentToday ? 'text-primary' : 'text-foreground'}`}>
                      {format(date, 'd')}
                    </span>
                    {(dayData.spent > 0 || dayData.earned > 0) && (
                      <div className="mt-auto flex flex-col font-mono text-[10px] font-bold">
                        {dayData.earned > 0 && <span className="text-primary">+₹{dayData.earned.toFixed(0)}</span>}
                        {dayData.spent > 0 && <span className="text-destructive">-₹{dayData.spent.toFixed(0)}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedDate && (
          <div className="w-80 hidden lg:block animate-in slide-in-from-right-4">
            <Card className="glass h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-border pb-2">
                <CardTitle className="text-lg">
                  {format(selectedDate, 'MMM d, yyyy')}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {(() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const dayData = expensesByDate.get(dateStr);
                  if (!dayData || dayData.items.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No expenses on this day.</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="grid grid-cols-2 border border-border">
                        <div className="p-3 bg-destructive text-white"><p className="text-xs uppercase">Spent</p><p className="font-bold">₹{dayData.spent.toFixed(2)}</p></div>
                        <div className="p-3 bg-primary text-primary-foreground"><p className="text-xs uppercase">Earned</p><p className="font-bold">₹{dayData.earned.toFixed(2)}</p></div>
                      </div>
                      <div className="space-y-3 mt-4">
                        {dayData.items.map(expense => (
                          <div key={expense.id} className="border border-border bg-background p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm">{expense.kind === 'expense' ? expense.description : expense.source}</p>
                                <p className="text-xs text-muted-foreground">{expense.category_id || 'General'}</p>
                              </div>
                              <span className={`font-bold text-sm ${expense.kind === 'income' ? 'text-primary' : 'text-destructive'}`}>{expense.kind === 'income' ? '+' : '-'}₹{expense.amount.toFixed(2)}</span>
                            </div>
                            {expense.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{expense.notes}"</p>}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { format, subMonths } from 'date-fns';

export const AnalyticsPage = () => {
  const { expenses, incomes } = useStore();

  const barData = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const month = subMonths(new Date(), 5 - index);
    const matchesMonth = (value: string) => {
      const date = new Date(value);
      return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    };
    return {
      name: format(month, 'MMM'),
      income: incomes.filter(item => matchesMonth(item.date)).reduce((sum, item) => sum + item.amount, 0),
      expenses: expenses.filter(item => matchesMonth(item.date)).reduce((sum, item) => sum + item.amount, 0),
    };
  }), [expenses, incomes]);

  const topCategories = useMemo(() => {
    const totals = expenses.reduce<Record<string, number>>((result, expense) => {
      const category = expense.category_id || 'General';
      result[category] = (result[category] || 0) + expense.amount;
      return result;
    }, {});
    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, amount], index) => ({
      name,
      amount,
      percent: total ? (amount / total) * 100 : 0,
      color: ['bg-primary', 'bg-blue-500', 'bg-pink-500', 'bg-orange-500', 'bg-slate-500'][index],
    }));
  }, [expenses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your financial habits.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* AI Insight Card */}
        <Card className="glass relative overflow-hidden border-2 border-primary bg-primary text-primary-foreground md:col-span-3">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Brain className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="h-6 w-6" />
              Financial Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-lg font-medium leading-relaxed max-w-3xl text-muted-foreground">
                Not enough data yet. Log some expenses to get your first AI financial insight!
              </p>
            ) : (
              <p className="text-lg font-medium leading-relaxed max-w-3xl">
                Based on your recent activity, you recently spent <span className="text-primary font-bold text-xl">₹{expenses[0]?.amount}</span> on {expenses[0]?.category_id || 'General'}. 
                Keep tracking to unlock deeper insights into your saving habits!
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="glass flex-1">
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {topCategories.length === 0 ? <p className="text-sm text-muted-foreground">No category data yet.</p> : topCategories.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-muted-foreground">₹{cat.amount}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden border border-border bg-secondary">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mood Insights */}
          <Card className="glass border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                😊 Emotional Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const moodData = expenses.filter(e => e.mood).reduce((acc: any, e) => {
                  if (!acc[e.mood]) acc[e.mood] = { count: 0, total: 0 };
                  acc[e.mood].count += 1;
                  acc[e.mood].total += e.amount;
                  return acc;
                }, {});

                if (Object.keys(moodData).length === 0) {
                  return <p className="text-sm text-muted-foreground">Log expenses with your mood to see insights here.</p>;
                }

                const mostFrequent = Object.entries(moodData).sort((a: any, b: any) => b[1].count - a[1].count)[0];
                const highestAvg = Object.entries(moodData).sort((a: any, b: any) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0];
                
                const emojiMap: Record<string, string> = {
                  happy: '😊 Happy',
                  neutral: '😐 Neutral',
                  guilty: '😟 Guilty',
                  excited: '🤩 Excited',
                  stressed: '😤 Stressed'
                };

                return (
                  <div className="space-y-4">
                    <div className="border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground mb-1">Your mood when spending most often:</p>
                      <p className="font-bold">{emojiMap[mostFrequent[0]]}</p>
                    </div>
                    <div className="border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground mb-1">You spend the most (avg) when:</p>
                      <p className="font-bold text-red-400">{emojiMap[highestAvg[0]]} — avg ₹{(highestAvg[1] as any).total / (highestAvg[1] as any).count}/session</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

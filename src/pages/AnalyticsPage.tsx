import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const AnalyticsPage = () => {
  const { expenses } = useStore();

  const barData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Apr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
  ];

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
        <Card className="glass md:col-span-3 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Brain className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="h-6 w-6" />
              AI Financial Insight
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

        <Card className="glass">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'Food', amount: 450, percent: 45, color: 'bg-primary' },
              { name: 'Transport', amount: 200, percent: 20, color: 'bg-blue-500' },
              { name: 'Shopping', amount: 150, percent: 15, color: 'bg-pink-500' },
              { name: 'Bills', amount: 100, percent: 10, color: 'bg-orange-500' },
              { name: 'Other', amount: 100, percent: 10, color: 'bg-muted' },
            ].map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-muted-foreground">₹{cat.amount}</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

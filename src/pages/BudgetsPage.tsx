import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { Link } from 'react-router-dom';
import { Brain, Edit2, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export const BudgetsPage = () => {
  const { user, expenses } = useStore();
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  if (!user?.monthly_salary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <div className="bg-primary/10 p-6 rounded-full">
          <Brain className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Smart Budget Planner is locked</h2>
        <p className="text-muted-foreground text-center max-w-md">
          To unlock the intelligent 50/30/20 budget planner and category limits, you need to set up your salary profile first.
        </p>
        <Link to="/onboarding">
          <Button size="lg" className="mt-4 gap-2">
            Set Up Salary Profile <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const salary = user.monthly_salary;
  const savingsPct = user.savings_goal_percent || 20;
  // 50/30/20 rule adjusted for custom savings %
  const needsPct = 50; 
  const wantsPct = 100 - needsPct - savingsPct;

  const needsAmount = salary * (needsPct / 100);
  const wantsAmount = salary * (wantsPct / 100);
  const savingsAmount = salary * (savingsPct / 100);

  // Calculate stats
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysLeft = Math.max(1, daysInMonth - currentDay);
  
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpent = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, salary - totalSpent);
  const dailyBudget = remainingBudget / daysLeft;
  const savedSoFar = Math.max(0, salary - totalSpent);
  const pacePercentage = (totalSpent / salary) * 100;
  const monthPercentage = (currentDay / daysInMonth) * 100;

  // Aggregate category spending
  const catSpent: Record<string, number> = {};
  currentMonthExpenses.forEach(e => {
    const cat = e.category_id || e.description || 'General';
    catSpent[cat] = (catSpent[cat] || 0) + e.amount;
  });

  // Mock category limits (In a real app, these would come from the database `budget_plan` jsonb)
  const categoryLimits = [
    { name: 'Food & Dining', icon: '🍔', limit: 8000, spent: catSpent['Food & Dining'] || catSpent['Food'] || 0 },
    { name: 'Transport', icon: '🚗', limit: 3000, spent: catSpent['Transport'] || 0 },
    { name: 'Entertainment', icon: '🎬', limit: 2500, spent: catSpent['Entertainment'] || 0 },
    { name: 'Shopping', icon: '🛍️', limit: 4000, spent: catSpent['Shopping'] || 0 },
    { name: 'Bills & Utilities', icon: '📱', limit: 5000, spent: catSpent['Bills & Utilities'] || catSpent['Bills'] || 0 },
  ];

  const handleSaveLimit = (catName: string) => {
    // Here you would save to Supabase
    toast.success(`Updated limit for ${catName} to ₹${editAmount}`);
    setEditingCat(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Budget Planner</h1>
        <p className="text-muted-foreground">Your intelligent 50/30/20 budget breakdown.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* SECTION A: Salary Breakdown */}
        <Card className="glass md:col-span-2">
          <CardHeader>
            <CardTitle>Salary Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Salary</p>
                <p className="text-3xl font-bold">₹{salary.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Savings Goal</p>
                <p className="text-xl font-bold text-emerald-500">{savingsPct}%</p>
              </div>
            </div>

            <div className="h-6 w-full rounded-full overflow-hidden flex">
              <div className="bg-blue-500 h-full" style={{ width: `${needsPct}%` }} title="Needs" />
              <div className="bg-amber-500 h-full" style={{ width: `${wantsPct}%` }} title="Wants" />
              <div className="bg-emerald-500 h-full" style={{ width: `${savingsPct}%` }} title="Savings" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-medium text-sm">Needs ({needsPct}%)</span>
                </div>
                <p className="text-lg font-bold">₹{needsAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Rent, Groceries, Bills</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-medium text-sm">Wants ({wantsPct}%)</span>
                </div>
                <p className="text-lg font-bold">₹{wantsAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Dining, Hobbies</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-medium text-sm">Savings ({savingsPct}%)</span>
                </div>
                <p className="text-lg font-bold">₹{savingsAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Investments, Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION C: Monthly Summary Card */}
        <Card className="glass bg-slate-900 text-white border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-300">💵 Salary</span>
              <span className="font-medium">₹{salary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-300">🛒 Total Spent</span>
              <span className="font-medium">₹{totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-300">💰 Saved So Far</span>
              <span className="font-medium text-emerald-400">₹{savedSoFar.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-300">📊 Days Left</span>
              <span className="font-medium">{daysLeft} days</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-300 font-semibold">💡 Daily Budget</span>
              <span className="font-bold text-blue-400 text-lg">₹{dailyBudget.toFixed(0)}/day</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION D: Spending Pace Indicator */}
      <Card className="glass border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min(100, pacePercentage)) / 100}
                  className={pacePercentage > monthPercentage ? "text-destructive" : pacePercentage > 80 ? "text-amber-500" : "text-emerald-500"} 
                />
              </svg>
              <div className="absolute font-bold text-xl">{pacePercentage.toFixed(0)}%</div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Pace Indicator</h3>
              {pacePercentage > 100 ? (
                <p className="text-destructive font-medium">🔴 Over budget! You've exceeded your monthly limit.</p>
              ) : pacePercentage > monthPercentage ? (
                <p className="text-amber-600 font-medium">🟡 Slow down! You've spent {pacePercentage.toFixed(0)}% of your salary with {daysLeft} days still left.</p>
              ) : (
                <p className="text-emerald-600 font-medium">🟢 You're doing great! At this pace you'll easily hit your savings goal.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION B: Category Budget Limits */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Category Budget Limits</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Your Limit</th>
                <th className="pb-3 font-medium">Spent</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {categoryLimits.map((cat, i) => {
                const percent = (cat.spent / cat.limit) * 100;
                const isOver = percent >= 100;
                const isNear = percent >= 80 && percent < 100;
                
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 flex items-center gap-3 font-medium">
                      <span className="text-xl">{cat.icon}</span> {cat.name}
                    </td>
                    <td className="py-4">
                      {editingCat === cat.name ? (
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <Input 
                            type="number" 
                            className="h-8" 
                            value={editAmount} 
                            onChange={(e) => setEditAmount(e.target.value)}
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => handleSaveLimit(cat.name)}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingCat(cat.name); setEditAmount(cat.limit.toString()); }}>
                          ₹{cat.limit.toLocaleString()}
                          <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-medium">₹{cat.spent.toLocaleString()}</td>
                    <td className="py-4">
                      {isOver ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> Over
                        </span>
                      ) : isNear ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5" /> Near Limit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Safe
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

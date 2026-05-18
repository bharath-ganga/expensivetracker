import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { ArrowDownIcon, ArrowUpIcon, CreditCard, DollarSign, Wallet, Brain, HeartPulse, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GreetingClock } from '@/components/GreetingClock';
import { MonthlyReportModal } from '@/components/MonthlyReportModal';

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

export const DashboardPage = () => {
  const { user, expenses, setExpenses } = useStore();
  const [totalSpent, setTotalSpent] = useState(0);
  const [lastMonthSpent, setLastMonthSpent] = useState(0);
  const [biggestExpense, setBiggestExpense] = useState(0);
  const [lastMonthBiggest, setLastMonthBiggest] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial expenses
    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!error && data) {
        setExpenses(data);
        calculateMetrics(data);
      }
    };

    fetchExpenses();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('expenses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          fetchExpenses(); // Re-fetch all on change to update charts easily
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setExpenses]);

  const calculateMetrics = (data: any[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let currentSpent = 0;
    let lastSpent = 0;
    let currentBiggest = 0;
    let lastBiggest = 0;

    data.forEach(d => {
      const dDate = new Date(d.date);
      if (dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear) {
        currentSpent += d.amount;
        if (d.amount > currentBiggest) currentBiggest = d.amount;
      } else if (dDate.getMonth() === lastMonth && dDate.getFullYear() === lastMonthYear) {
        lastSpent += d.amount;
        if (d.amount > lastBiggest) lastBiggest = d.amount;
      }
    });

    setTotalSpent(currentSpent);
    setLastMonthSpent(lastSpent);
    setBiggestExpense(currentBiggest);
    setLastMonthBiggest(lastBiggest);
  };

  const renderTrend = (current: number, previous: number, isExpense: boolean = true) => {
    if (current === 0 && previous === 0) {
      return <span className="text-muted-foreground text-xs">No data yet — add your first expense!</span>;
    }
    if (previous === 0) {
      return <span className="text-muted-foreground text-xs">No data from last month to compare</span>;
    }
    
    const percentChange = ((current - previous) / previous) * 100;
    if (percentChange === 0) {
      return <span className="text-muted-foreground text-xs">No change from last month</span>;
    }

    const isUp = percentChange > 0;
    // For expenses: going UP is bad (red), DOWN is good (green)
    // For savings/income: going UP is good (green), DOWN is bad (red)
    const isGood = isExpense ? !isUp : isUp;
    
    const colorClass = isGood ? 'text-emerald-500' : 'text-destructive';
    const Icon = isUp ? ArrowUpIcon : ArrowDownIcon;

    return (
      <span className="flex items-center gap-1 text-xs mt-1">
        <Icon className={`h-3 w-3 ${colorClass}`} />
        <span className={`${colorClass} font-medium`}>
          {isUp ? '+' : ''}{percentChange.toFixed(1)}%
        </span>
        <span className="text-muted-foreground">from last month</span>
      </span>
    );
  };

  // Process data for charts
  const categoryData = expenses.reduce((acc: any, curr) => {
    const cat = curr.description || 'Other'; 
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryData).map(key => ({
    name: key,
    value: categoryData[key]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const trendData = expenses.slice(0, 7).reverse().map(e => ({
    name: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
    amount: e.amount
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <GreetingClock name={user?.name?.split(' ')[0] || 'User'} />
        </div>
        <MonthlyReportModal />
      </div>

      {!user?.monthly_salary && (
        <Link to="/onboarding" className="block">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between hover:bg-primary/15 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Smart Budget Planner is locked!</h3>
                <p className="text-sm text-primary/80">💡 Set your salary to unlock Budget Planner</p>
              </div>
            </div>
            <span className="text-primary font-bold">→</span>
          </div>
        </Link>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent This Month</CardTitle>
            <div className="bg-primary/20 p-2 rounded-xl">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{totalSpent.toFixed(2)}</div>
            {renderTrend(totalSpent, lastMonthSpent, true)}
          </CardContent>
        </Card>

        {user?.monthly_salary ? (() => {
          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          const currentDay = new Date().getDate();
          const daysLeft = Math.max(1, daysInMonth - currentDay);
          const remainingBudget = Math.max(0, user.monthly_salary - totalSpent);
          const dailyBudget = remainingBudget / daysLeft;
          
          return (
            <Card className="glass relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Budget</CardTitle>
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">₹{dailyBudget.toFixed(0)}<span className="text-base font-normal text-muted-foreground">/day</span></div>
                <p className="text-xs text-muted-foreground mt-1">{daysLeft} days left in month</p>
              </CardContent>
            </Card>
          );
        })() : (
          <Card className="glass relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Wallet className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹0.00</div>
              {renderTrend(0, 0, false)}
            </CardContent>
          </Card>
        )}

        {user?.monthly_salary ? (() => {
          const savingsGoal = user.monthly_salary * ((user.savings_goal_percent || 20) / 100);
          const currentSavings = Math.max(0, user.monthly_salary - totalSpent);
          const progress = Math.min(100, Math.max(0, (currentSavings / savingsGoal) * 100));
          return (
            <Card className="glass relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Progress</CardTitle>
                <div className="bg-emerald-500/20 p-2 rounded-xl">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">₹{currentSavings.toFixed(0)}</div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Goal: ₹{savingsGoal.toFixed(0)}</p>
              </CardContent>
            </Card>
          );
        })() : (
          <Card className="glass relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Money Saved</CardTitle>
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Wallet className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹0.00</div>
              {renderTrend(0, 0, false)}
            </CardContent>
          </Card>
        )}

        {user?.monthly_salary ? (() => {
          const healthScore = Math.max(0, Math.min(100, 100 - ((totalSpent / user.monthly_salary) * 100)));
          const isExcellent = healthScore >= 80;
          const isGood = healthScore >= 60 && healthScore < 80;
          const scoreColor = isExcellent ? 'text-emerald-500' : isGood ? 'text-amber-500' : 'text-destructive';
          return (
            <Card className="glass relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Budget Health</CardTitle>
                <div className="bg-primary/20 p-2 rounded-xl">
                  <HeartPulse className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${scoreColor}`}>{healthScore.toFixed(0)}<span className="text-lg">/100</span></div>
                <p className={`text-xs mt-1 font-medium ${scoreColor}`}>
                  {isExcellent ? '🟢 Excellent Pace' : isGood ? '🟡 Good Pace' : '🔴 Needs Attention'}
                </p>
              </CardContent>
            </Card>
          );
        })() : (
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Biggest Expense</CardTitle>
              <div className="bg-destructive/20 p-2 rounded-xl">
                <CreditCard className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{biggestExpense.toFixed(2)}</div>
              {renderTrend(biggestExpense, lastMonthBiggest, true)}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="glass lg:col-span-4">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.length ? trendData : [{name: 'Mon', amount: 0}, {name: 'Tue', amount: 0}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center">
                <PieChart className="h-16 w-16 mb-2 opacity-20" />
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No expenses recorded yet. Click Add Expense to start!</p>
            ) : (
              expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl bg-background/30 hover:bg-background/50 transition-colors border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                      💳
                    </div>
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="font-bold text-foreground">
                    -₹{expense.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

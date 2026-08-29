import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
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
  const { user, expenses, incomes } = useStore();

  const { totalSpent, lastMonthSpent, biggestExpense, lastMonthBiggest, totalIncome, lastMonthIncome } = useMemo(() => {
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
    let currentIncome = 0;
    let previousIncome = 0;

    expenses.forEach(d => {
      const dDate = new Date(d.date);
      if (dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear) {
        currentSpent += d.amount;
        if (d.amount > currentBiggest) currentBiggest = d.amount;
      } else if (dDate.getMonth() === lastMonth && dDate.getFullYear() === lastMonthYear) {
        lastSpent += d.amount;
        if (d.amount > lastBiggest) lastBiggest = d.amount;
      }
    });

    incomes.forEach(income => {
      const incomeDate = new Date(income.date);
      if (incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear) currentIncome += income.amount;
      if (incomeDate.getMonth() === lastMonth && incomeDate.getFullYear() === lastMonthYear) previousIncome += income.amount;
    });

    return {
      totalSpent: currentSpent,
      lastMonthSpent: lastSpent,
      biggestExpense: currentBiggest,
      lastMonthBiggest: lastBiggest,
      totalIncome: currentIncome,
      lastMonthIncome: previousIncome,
    };
  }, [expenses, incomes]);

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
  const categoryData = expenses.reduce<Record<string, number>>((acc, curr) => {
    const cat = curr.category_id || 'Other';
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <GreetingClock name={user?.name?.split(' ')[0] || 'User'} />
        </div>
        <MonthlyReportModal />
      </div>

      {!user?.monthly_salary && (
        <Link to="/onboarding" className="block">
          <div className="bg-primary border border-foreground p-4 flex items-center justify-between text-primary-foreground hover:-translate-y-0.5 transition-transform cursor-pointer shadow-[4px_4px_0_hsl(var(--foreground))]">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground p-2 border border-foreground">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-mono font-bold uppercase">Smart Budget Planner is locked</h3>
                <p className="text-sm">Set your salary to unlock the budget engine.</p>
              </div>
            </div>
            <span className="font-mono font-bold">-&gt;</span>
          </div>
        </Link>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass relative overflow-hidden group border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent This Month</CardTitle>
            <div className="bg-primary p-2 border border-foreground">
              <DollarSign className="h-4 w-4 text-primary-foreground" />
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
            <Card className="glass relative overflow-hidden group border-t-4 border-t-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Budget</CardTitle>
                <div className="bg-blue-500 p-2 border border-foreground">
                  <Activity className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">₹{dailyBudget.toFixed(0)}<span className="text-base font-normal text-muted-foreground">/day</span></div>
                <p className="text-xs text-muted-foreground mt-1">{daysLeft} days left in month</p>
              </CardContent>
            </Card>
          );
        })() : (
          <Card className="glass relative overflow-hidden group border-t-4 border-t-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              <div className="bg-blue-500 p-2 border border-foreground">
                <Wallet className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{totalIncome.toFixed(2)}</div>
              {renderTrend(totalIncome, lastMonthIncome, false)}
            </CardContent>
          </Card>
        )}

        {user?.monthly_salary ? (() => {
          const savingsGoal = user.monthly_salary * ((user.savings_goal_percent || 20) / 100);
          const currentSavings = Math.max(0, user.monthly_salary - totalSpent);
          const progress = Math.min(100, Math.max(0, (currentSavings / savingsGoal) * 100));
          return (
            <Card className="glass relative overflow-hidden group border-t-4 border-t-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Progress</CardTitle>
                <div className="bg-emerald-500 p-2 border border-foreground">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">₹{currentSavings.toFixed(0)}</div>
                <div className="mt-2 h-2 w-full overflow-hidden border border-border bg-secondary">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Goal: ₹{savingsGoal.toFixed(0)}</p>
              </CardContent>
            </Card>
          );
        })() : (
          <Card className="glass relative overflow-hidden group border-t-4 border-t-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Money Saved</CardTitle>
              <div className="bg-emerald-500 p-2 border border-foreground">
                <Wallet className="h-4 w-4 text-white" />
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
            <Card className="glass relative overflow-hidden group border-t-4 border-t-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Budget Health</CardTitle>
                <div className="bg-primary p-2 border border-foreground">
                  <HeartPulse className="h-4 w-4 text-primary-foreground" />
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
              <div className="bg-destructive p-2 border border-foreground">
                <CreditCard className="h-4 w-4 text-white" />
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
                  contentStyle={{ backgroundColor: '#17181d', border: '1px solid #00e391', borderRadius: 0 }}
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
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#17181d', border: '1px solid #00e391', borderRadius: 0 }}
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
                <div key={expense.id} className="flex items-center justify-between p-4 bg-secondary hover:bg-primary/10 transition-colors border border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary flex items-center justify-center text-xl border border-foreground">
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

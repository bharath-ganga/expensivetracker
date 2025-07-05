
import { Expense, EXPENSE_CATEGORIES } from '@/types/expense';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export const ExpenseStats = ({ expenses }: ExpenseStatsProps) => {
  const categoryData = EXPENSE_CATEGORIES.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category,
      value: total,
      count: categoryExpenses.length
    };
  }).filter(item => item.value > 0);

  const monthlyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        amount: 0,
        count: 0
      };
    }
    
    acc[monthKey].amount += expense.amount;
    acc[monthKey].count += 1;
    
    return acc;
  }, {} as Record<string, { month: string; amount: number; count: number }>);

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const COLORS = [
    '#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981',
    '#6366F1', '#F97316', '#EC4899', '#84CC16'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-purple-600" />
            Spending by Category
          </CardTitle>
          <CardDescription>
            Breakdown of your expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{item.value.toFixed(2)}</div>
                      <div className="text-gray-500">{item.count} expense{item.count === 1 ? '' : 's'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Monthly Trends
          </CardTitle>
          <CardDescription>
            Your spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

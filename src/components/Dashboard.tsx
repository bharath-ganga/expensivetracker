
import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { Expense } from '@/types/expense';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { ExpenseStats } from './ExpenseStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [user.id]);

  const loadExpenses = () => {
    const savedExpenses = localStorage.getItem(`expenseTracker_expenses_${user.id}`);
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (error) {
        console.error('Error loading expenses:', error);
        setExpenses([]);
      }
    }
  };

  const saveExpenses = (newExpenses: Expense[]) => {
    localStorage.setItem(`expenseTracker_expenses_${user.id}`, JSON.stringify(newExpenses));
    setExpenses(newExpenses);
  };

  const addExpense = (expense: Expense) => {
    const newExpenses = [expense, ...expenses];
    saveExpenses(newExpenses);
    setShowForm(false);
  };

  const deleteExpense = (expenseId: string) => {
    const newExpenses = expenses.filter(expense => expense.id !== expenseId);
    saveExpenses(newExpenses);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs opacity-80">All time spending</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">This Month</CardTitle>
            <Calendar className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs opacity-80">{thisMonthExpenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Average</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs opacity-80">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Expense Form */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-purple-600" />
                Add New Expense
              </CardTitle>
              <CardDescription>
                Track your spending by adding new expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm onAddExpense={addExpense} userId={user.id} />
            </CardContent>
          </Card>
        </div>

        {/* Expense List and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {expenses.length > 0 && (
            <ExpenseStats expenses={expenses} />
          )}
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>
                {expenses.length === 0 
                  ? "No expenses yet. Add your first expense to get started!" 
                  : `${expenses.length} expense${expenses.length === 1 ? '' : 's'} recorded`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

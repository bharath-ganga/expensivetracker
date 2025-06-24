
import { Expense } from '@/types/expense';
import { ExpenseItem } from './ExpenseItem';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseList = ({ expenses, onDeleteExpense }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto bg-gray-100 p-4 rounded-full w-fit mb-4">
          <Receipt className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Start tracking your expenses by adding your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDeleteExpense}
        />
      ))}
    </div>
  );
};

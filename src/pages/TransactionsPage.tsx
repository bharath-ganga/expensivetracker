import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { Search, Filter, Receipt, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const TransactionsPage = () => {
  const { expenses, setExpenses } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete expense');
    } else {
      toast.success('Expense deleted');
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const filteredAndSortedExpenses = expenses
    .filter(e => 
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.amount.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your expenses.</p>
        </div>
      </div>

      <Card className="glass">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9 bg-background/50 border-white/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-background/50 border-white/10">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-4">
            {filteredAndSortedExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                <Receipt className="h-12 w-12 mb-4 opacity-20" />
                <p>No transactions found.</p>
              </div>
            ) : (
              filteredAndSortedExpenses.map((expense) => (
                <div key={expense.id} className="group flex items-center justify-between p-4 rounded-xl bg-background/30 hover:bg-background/50 transition-all border border-white/5 hover:border-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-xl shadow-inner">
                      💳
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{expense.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded-md text-xs">{expense.category_id || 'General'}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">-₹{expense.amount.toFixed(2)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

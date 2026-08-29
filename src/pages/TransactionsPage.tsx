import { useMemo, useState } from 'react';
import { Edit3, Filter, Loader2, Plus, Receipt, Search, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { financeRepository } from '@/lib/finance-repository';
import { formatCurrency, toDateInputValue } from '@/lib/format';
import { useStore } from '@/store/useStore';
import type { Expense, Income, RecurringInterval } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type TransactionKind = 'expense' | 'income';
type TransactionRecord = (Expense & { kind: 'expense' }) | (Income & { kind: 'income' });

const emptyForm = {
  kind: 'expense' as TransactionKind,
  title: '',
  amount: '',
  category: 'General',
  currency: 'INR',
  date: toDateInputValue(),
  notes: '',
  tags: '',
  mood: 'neutral',
  recurring_interval: 'none',
};

export const TransactionsPage = () => {
  const { user, expenses, incomes, setExpenses, setIncomes, financeLoading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [kindFilter, setKindFilter] = useState<'all' | TransactionKind>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<TransactionRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const pageSize = 10;

  const transactions = useMemo<TransactionRecord[]>(() => [
    ...expenses.map(expense => ({ ...expense, kind: 'expense' as const })),
    ...incomes.map(income => ({ ...income, kind: 'income' as const })),
  ], [expenses, incomes]);

  const filteredTransactions = useMemo(() => transactions
    .filter(transaction => {
      const title = transaction.kind === 'expense' ? transaction.description : transaction.source;
      return (kindFilter === 'all' || transaction.kind === kindFilter)
        && (!searchTerm || title.toLowerCase().includes(searchTerm.toLowerCase()) || String(transaction.amount).includes(searchTerm))
        && (!dateFrom || transaction.date >= dateFrom)
        && (!dateTo || transaction.date <= dateTo);
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    }), [dateFrom, dateTo, kindFilter, searchTerm, sortBy, transactions]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const visibleTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, currency: user?.default_currency || 'INR', date: toDateInputValue() });
    setIsOpen(true);
  };

  const openEdit = (transaction: TransactionRecord) => {
    setEditing(transaction);
    setForm({
      kind: transaction.kind,
      title: transaction.kind === 'expense' ? transaction.description : transaction.source,
      amount: String(transaction.amount),
      category: transaction.category_id || 'General',
      currency: transaction.currency || 'INR',
      date: transaction.date.slice(0, 10),
      notes: transaction.notes || '',
      tags: transaction.kind === 'expense' ? transaction.tags.join(', ') : '',
      mood: transaction.kind === 'expense' ? transaction.mood || 'neutral' : 'neutral',
      recurring_interval: transaction.is_recurring ? transaction.recurring_interval || 'monthly' : 'none',
    });
    setIsOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a title and an amount greater than zero.');
      return;
    }

    setIsSaving(true);
    try {
      const recurrence = form.recurring_interval === 'none' ? null : form.recurring_interval as RecurringInterval;
      if (form.kind === 'expense') {
        const input = {
          amount,
          currency: form.currency,
          description: form.title.trim(),
          category_id: form.category.trim() || 'General',
          date: form.date,
          notes: form.notes.trim() || null,
          is_recurring: Boolean(recurrence),
          recurring_interval: recurrence,
          tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          mood: form.mood as 'happy' | 'neutral' | 'guilty' | 'excited' | 'stressed',
        };
        const saved = editing?.kind === 'expense'
          ? await financeRepository.updateExpense(user.id, editing.id, input)
          : await financeRepository.createExpense(user.id, input);
        setExpenses(editing?.kind === 'expense'
          ? expenses.map(item => item.id === editing.id ? saved as Expense : item)
          : [saved as Expense, ...expenses]);
      } else {
        const input = {
          amount,
          currency: form.currency,
          source: form.title.trim(),
          category_id: form.category.trim() || 'Income',
          date: form.date,
          notes: form.notes.trim() || null,
          is_recurring: Boolean(recurrence),
          recurring_interval: recurrence,
        };
        const saved = editing?.kind === 'income'
          ? await financeRepository.updateIncome(user.id, editing.id, input)
          : await financeRepository.createIncome(user.id, input);
        setIncomes(editing?.kind === 'income'
          ? incomes.map(item => item.id === editing.id ? saved as Income : item)
          : [saved as Income, ...incomes]);
      }
      toast.success(editing ? 'Transaction updated.' : 'Transaction created.');
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (transaction: TransactionRecord) => {
    if (!user || !window.confirm('Delete this transaction permanently?')) return;
    try {
      if (transaction.kind === 'expense') {
        await financeRepository.deleteExpense(user.id, transaction.id);
        setExpenses(expenses.filter(item => item.id !== transaction.id));
      } else {
        await financeRepository.deleteIncome(user.id, transaction.id);
        setIncomes(incomes.filter(item => item.id !== transaction.id));
      }
      toast.success('Transaction deleted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete transaction.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary mb-2">// LEDGER</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage expenses and income in one ledger.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add transaction</Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ledger..." className="pl-9" value={searchTerm} onChange={event => { setSearchTerm(event.target.value); setPage(1); }} />
            </div>
            <Select value={kindFilter} onValueChange={(value: 'all' | TransactionKind) => { setKindFilter(value); setPage(1); }}>
              <SelectTrigger className="lg:w-40"><Filter className="h-4 w-4" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="expense">Expenses</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent>
            </Select>
            <Input type="date" aria-label="From date" value={dateFrom} onChange={event => { setDateFrom(event.target.value); setPage(1); }} />
            <Input type="date" aria-label="To date" value={dateTo} onChange={event => { setDateTo(event.target.value); setPage(1); }} />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="lg:w-44"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="date-desc">Newest first</SelectItem><SelectItem value="date-asc">Oldest first</SelectItem><SelectItem value="amount-desc">Highest amount</SelectItem><SelectItem value="amount-asc">Lowest amount</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {financeLoading ? (
            <div className="min-h-56 grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : visibleTransactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No matching transactions.</p></div>
          ) : (
            <div className="divide-y divide-border">
              {visibleTransactions.map(transaction => {
                const title = transaction.kind === 'expense' ? transaction.description : transaction.source;
                return (
                  <div key={`${transaction.kind}-${transaction.id}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 hover:bg-secondary">
                    <div className={`h-10 w-10 grid place-items-center border border-foreground ${transaction.kind === 'expense' ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'}`}>
                      {transaction.kind === 'expense' ? <TrendingDown /> : <TrendingUp />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{title}</p>
                      <p className="font-mono text-xs text-muted-foreground uppercase">{transaction.category_id || 'General'} · {new Date(transaction.date).toLocaleDateString()} {transaction.is_recurring ? '· RECURRING' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`font-mono font-bold mr-2 ${transaction.kind === 'expense' ? 'text-destructive' : 'text-primary'}`}>
                        {transaction.kind === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${title}`} onClick={() => openEdit(transaction)}><Edit3 /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${title}`} className="text-destructive" onClick={() => handleDelete(transaction)}><Trash2 /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border p-4 font-mono text-xs">
            <span>{filteredTransactions.length} RECORDS</span>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Prev</Button><span>{page}/{pageCount}</span><Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage(value => value + 1)}>Next</Button></div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit transaction' : 'New transaction'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label><Select value={form.kind} disabled={Boolean(editing)} onValueChange={(value: TransactionKind) => setForm(current => ({ ...current, kind: value, category: value === 'income' ? 'Income' : 'General' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Expense</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="transaction-date">Date</Label><Input id="transaction-date" type="date" value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} required /></div>
            </div>
            {form.kind === 'expense' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="transaction-tags">Tags</Label><Input id="transaction-tags" placeholder="work, travel" value={form.tags} onChange={event => setForm(current => ({ ...current, tags: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Mood</Label><Select value={form.mood} onValueChange={value => setForm(current => ({ ...current, mood: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="happy">Happy</SelectItem><SelectItem value="neutral">Neutral</SelectItem><SelectItem value="guilty">Guilty</SelectItem><SelectItem value="excited">Excited</SelectItem><SelectItem value="stressed">Stressed</SelectItem></SelectContent></Select></div>
              </div>
            )}
            <div className="space-y-2"><Label htmlFor="transaction-title">{form.kind === 'expense' ? 'Description' : 'Income source'}</Label><Input id="transaction-title" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} required /></div>
            <div className="grid grid-cols-[1fr_120px] gap-4">
              <div className="space-y-2"><Label htmlFor="transaction-amount">Amount</Label><Input id="transaction-amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} required /></div>
              <div className="space-y-2"><Label>Currency</Label><Select value={form.currency} onValueChange={value => setForm(current => ({ ...current, currency: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="transaction-category">Category</Label><Input id="transaction-category" value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Repeats</Label><Select value={form.recurring_interval} onValueChange={value => setForm(current => ({ ...current, recurring_interval: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Never</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="transaction-notes">Notes</Label><Textarea id="transaction-notes" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></div>
            <Button className="w-full" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : (editing ? 'Save changes' : 'Create transaction')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatCurrency, toDateInputValue } from '@/lib/format';
import { useStore } from '@/store/useStore';
import type { SplitExpense, SplitParticipant } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SplitWithParticipants = SplitExpense & { split_participants: SplitParticipant[] };

export const SplitExpensesPage = () => {
  const { user, currency } = useStore();
  const [splits, setSplits] = useState<SplitWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', total: '', paidBy: user?.name || '', date: toDateInputValue(), participants: '', notes: '' });

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('split_expenses').select('*, split_participants(*)').eq('user_id', user.id).order('expense_date', { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message); else setSplits((data || []) as SplitWithParticipants[]);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const createSplit = async (event: React.FormEvent) => {
    event.preventDefault();
    const participantNames = form.participants.split(',').map(value => value.trim()).filter(Boolean);
    const total = Number(form.total);
    if (!form.title.trim() || !form.paidBy.trim() || total <= 0 || participantNames.length === 0) return toast.error('Complete the title, amount, payer, and participants.');
    setSaving(true);
    const { error } = await supabase.rpc('create_split_expense', { p_title: form.title.trim(), p_total_amount: total, p_paid_by: form.paidBy.trim(), p_expense_date: form.date, p_notes: form.notes.trim() || null, p_participants: participantNames });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Split expense created.');
    setOpen(false);
    setForm({ title: '', total: '', paidBy: user?.name || '', date: toDateInputValue(), participants: '', notes: '' });
    void refresh();
  };

  const settleParticipant = async (participant: SplitParticipant) => {
    const { error } = await supabase.from('split_participants').update({ amount_paid: participant.amount_owed, is_settled: true }).eq('id', participant.id).eq('user_id', user?.id);
    if (error) return toast.error(error.message);
    const split = splits.find(item => item.id === participant.split_expense_id);
    if (split && split.split_participants.every(item => item.id === participant.id || item.is_settled)) {
      await supabase.from('split_expenses').update({ status: 'settled' }).eq('id', split.id).eq('user_id', user?.id);
    }
    void refresh();
  };

  const deleteSplit = async (split: SplitExpense) => {
    if (!window.confirm(`Delete split “${split.title}”?`)) return;
    const { error } = await supabase.from('split_expenses').delete().eq('id', split.id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else void refresh();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><p className="eyebrow text-primary mb-2">// SHARED_LEDGER</p><h1 className="text-3xl font-extrabold tracking-tight">Split Expenses</h1><p className="text-muted-foreground">Divide bills and track who has settled.</p></div><Button onClick={() => setOpen(true)}><Plus /> New split</Button></div>
      {loading ? <div className="min-h-64 grid place-items-center"><Loader2 className="animate-spin text-primary" /></div> : splits.length === 0 ? <Card><CardContent className="py-16 text-center"><Users className="h-12 w-12 mx-auto text-primary mb-4" /><h2 className="text-xl font-bold">No shared expenses</h2><p className="text-muted-foreground mt-2">Create a split for rent, dinner, travel, or any group bill.</p></CardContent></Card> : <div className="grid gap-5 lg:grid-cols-2">{splits.map(split => <Card key={split.id} className={`border-t-4 ${split.status === 'settled' ? 'border-t-primary' : 'border-t-blue-500'}`}><CardHeader><div className="flex justify-between"><div><p className="eyebrow text-muted-foreground">{split.status}</p><CardTitle className="mt-2">{split.title}</CardTitle></div><Button variant="ghost" size="icon" className="text-destructive" aria-label="Delete split" onClick={() => deleteSplit(split)}><Trash2 /></Button></div></CardHeader><CardContent className="space-y-4"><div className="flex justify-between border border-border bg-secondary p-3"><span>Paid by <strong>{split.paid_by}</strong></span><strong className="font-mono">{formatCurrency(split.total_amount, currency)}</strong></div><div className="divide-y divide-border border border-border">{split.split_participants.map(participant => <div key={participant.id} className="flex items-center gap-3 p-3"><div className={`h-8 w-8 grid place-items-center border border-foreground ${participant.is_settled ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>{participant.is_settled ? <Check /> : participant.participant_name.charAt(0).toUpperCase()}</div><div className="flex-1"><p className="font-medium">{participant.participant_name}</p><p className="font-mono text-xs text-muted-foreground">OWES {formatCurrency(participant.amount_owed, currency)}</p></div><Button variant="outline" size="sm" disabled={participant.is_settled} onClick={() => settleParticipant(participant)}>{participant.is_settled ? 'Settled' : 'Mark paid'}</Button></div>)}</div></CardContent></Card>)}</div>}
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Create split expense</DialogTitle></DialogHeader><form onSubmit={createSplit} className="space-y-4"><div className="space-y-2"><Label htmlFor="split-title">Title</Label><Input id="split-title" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} required /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="split-total">Total</Label><Input id="split-total" type="number" min="0.01" step="0.01" value={form.total} onChange={event => setForm(current => ({ ...current, total: event.target.value }))} required /></div><div className="space-y-2"><Label htmlFor="split-date">Date</Label><Input id="split-date" type="date" value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} required /></div></div><div className="space-y-2"><Label htmlFor="split-payer">Paid by</Label><Input id="split-payer" value={form.paidBy} onChange={event => setForm(current => ({ ...current, paidBy: event.target.value }))} required /></div><div className="space-y-2"><Label htmlFor="split-people">Participants</Label><Input id="split-people" placeholder="Asha, Ravi, Me" value={form.participants} onChange={event => setForm(current => ({ ...current, participants: event.target.value }))} required /><p className="text-xs text-muted-foreground">Comma-separated names; the bill is divided equally.</p></div><div className="space-y-2"><Label htmlFor="split-notes">Notes</Label><Textarea id="split-notes" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></div><Button className="w-full" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : 'Create split'}</Button></form></DialogContent></Dialog>
    </div>
  );
};

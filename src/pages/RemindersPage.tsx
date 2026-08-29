import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, Clock3, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatCurrency, toDateInputValue } from '@/lib/format';
import { useStore } from '@/store/useStore';
import type { Reminder } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const RemindersPage = () => {
  const { user, currency } = useStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', dueDate: toDateInputValue(), recurrence: 'none', notes: '' });

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('reminders').select('*').eq('user_id', user.id).order('due_date');
    setLoading(false);
    if (error) toast.error(error.message); else setReminders((data || []) as Reminder[]);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const createReminder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !form.title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('reminders').insert({ user_id: user.id, title: form.title.trim(), amount: form.amount ? Number(form.amount) : null, due_date: form.dueDate, recurrence: form.recurrence, notes: form.notes.trim() || null });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Reminder created.');
    setOpen(false);
    setForm({ title: '', amount: '', dueDate: toDateInputValue(), recurrence: 'none', notes: '' });
    void refresh();
  };

  const markPaid = async (reminder: Reminder) => {
    const status = reminder.status === 'paid' ? 'pending' : 'paid';
    const { error } = await supabase.from('reminders').update({ status }).eq('id', reminder.id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else void refresh();
  };

  const deleteReminder = async (reminder: Reminder) => {
    if (!window.confirm(`Delete reminder “${reminder.title}”?`)) return;
    const { error } = await supabase.from('reminders').delete().eq('id', reminder.id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else void refresh();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><p className="eyebrow text-primary mb-2">// SCHEDULE</p><h1 className="text-3xl font-extrabold tracking-tight">Bill Reminders</h1><p className="text-muted-foreground">Track upcoming and overdue payments.</p></div><Button onClick={() => setOpen(true)}><Plus /> Add reminder</Button></div>
      {loading ? <div className="min-h-64 grid place-items-center"><Loader2 className="animate-spin text-primary" /></div> : reminders.length === 0 ? <Card><CardContent className="py-16 text-center"><Bell className="h-12 w-12 text-primary mx-auto mb-4" /><h2 className="font-bold text-xl">No reminders scheduled</h2></CardContent></Card> : <div className="space-y-3">{reminders.map(reminder => {
        const overdue = reminder.status === 'pending' && reminder.due_date < toDateInputValue();
        return <Card key={reminder.id} className={`border-l-4 ${reminder.status === 'paid' ? 'border-l-primary opacity-60' : overdue ? 'border-l-destructive' : 'border-l-blue-500'}`}><CardContent className="p-4 flex items-center gap-4"><div className={`h-11 w-11 grid place-items-center border border-foreground ${overdue ? 'bg-destructive text-white' : 'bg-secondary'}`}>{reminder.status === 'paid' ? <Check /> : <Clock3 />}</div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={reminder.status === 'paid' ? 'font-bold line-through' : 'font-bold'}>{reminder.title}</h3>{overdue && <span className="eyebrow bg-destructive text-white px-2 py-1">OVERDUE</span>}</div><p className="font-mono text-xs text-muted-foreground">DUE {new Date(`${reminder.due_date}T00:00:00`).toLocaleDateString()} · {reminder.recurrence.toUpperCase()}</p></div>{reminder.amount != null && <p className="font-mono font-bold">{formatCurrency(reminder.amount, currency)}</p>}<Button variant="outline" size="sm" onClick={() => markPaid(reminder)}>{reminder.status === 'paid' ? 'Reopen' : 'Paid'}</Button><Button variant="ghost" size="icon" className="text-destructive" aria-label="Delete reminder" onClick={() => deleteReminder(reminder)}><Trash2 /></Button></CardContent></Card>;
      })}</div>}
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>New reminder</DialogTitle></DialogHeader><form onSubmit={createReminder} className="space-y-4"><div className="space-y-2"><Label htmlFor="reminder-title">Title</Label><Input id="reminder-title" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} required /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="reminder-amount">Amount</Label><Input id="reminder-amount" type="number" min="0" step="0.01" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} /></div><div className="space-y-2"><Label htmlFor="reminder-date">Due date</Label><Input id="reminder-date" type="date" value={form.dueDate} onChange={event => setForm(current => ({ ...current, dueDate: event.target.value }))} required /></div></div><div className="space-y-2"><Label>Repeats</Label><Select value={form.recurrence} onValueChange={value => setForm(current => ({ ...current, recurrence: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Never</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="reminder-notes">Notes</Label><Textarea id="reminder-notes" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></div><Button className="w-full" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : 'Create reminder'}</Button></form></DialogContent></Dialog>
    </div>
  );
};

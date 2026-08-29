import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Pause, PiggyBank, Plus, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatCurrency, toDateInputValue } from '@/lib/format';
import { useStore } from '@/store/useStore';
import type { SavingsGoal } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const GoalsPage = () => {
  const { user, currency } = useStore();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [contributionGoal, setContributionGoal] = useState<SavingsGoal | null>(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', notes: '' });
  const [contribution, setContribution] = useState({ amount: '', note: '' });

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setGoals((data || []) as SavingsGoal[]);
  }, [user]);

  useEffect(() => { void fetchGoals(); }, [fetchGoals]);

  const createGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const targetAmount = Number(form.targetAmount);
    if (!form.name.trim() || targetAmount <= 0) return toast.error('Enter a goal name and valid target amount.');
    setSaving(true);
    const { error } = await supabase.from('savings_goals').insert({
      user_id: user.id,
      name: form.name.trim(),
      target_amount: targetAmount,
      target_date: form.targetDate || null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Savings goal created.');
    setGoalOpen(false);
    setForm({ name: '', targetAmount: '', targetDate: '', notes: '' });
    void fetchGoals();
  };

  const addContribution = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contributionGoal) return;
    const amount = Number(contribution.amount);
    if (amount <= 0) return toast.error('Enter a contribution greater than zero.');
    setSaving(true);
    const { error } = await supabase.rpc('add_goal_contribution', { p_goal_id: contributionGoal.id, p_amount: amount, p_note: contribution.note || null });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Contribution added.');
    setContributionGoal(null);
    setContribution({ amount: '', note: '' });
    void fetchGoals();
  };

  const updateStatus = async (goal: SavingsGoal) => {
    const status = goal.status === 'paused' ? 'active' : 'paused';
    const { error } = await supabase.from('savings_goals').update({ status }).eq('id', goal.id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else void fetchGoals();
  };

  const deleteGoal = async (goal: SavingsGoal) => {
    if (!window.confirm(`Delete “${goal.name}” and its contribution history?`)) return;
    const { error } = await supabase.from('savings_goals').delete().eq('id', goal.id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else { toast.success('Goal deleted.'); void fetchGoals(); }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><p className="eyebrow text-primary mb-2">// TARGETS</p><h1 className="text-3xl font-extrabold tracking-tight">Savings Goals</h1><p className="text-muted-foreground">Build targets and record every contribution.</p></div>
        <Button onClick={() => setGoalOpen(true)}><Plus /> New goal</Button>
      </div>

      {loading ? <div className="min-h-64 grid place-items-center"><Loader2 className="animate-spin text-primary" /></div> : goals.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Target className="h-12 w-12 mx-auto text-primary mb-4" /><h2 className="text-xl font-bold">No savings goals yet</h2><p className="text-muted-foreground mt-2">Create a target for an emergency fund, trip, or major purchase.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {goals.map(goal => {
            const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
            return (
              <Card key={goal.id} className={`border-t-4 ${goal.status === 'completed' ? 'border-t-primary' : goal.status === 'paused' ? 'border-t-amber-500' : 'border-t-blue-500'}`}>
                <CardHeader><div className="flex justify-between gap-4"><div><p className="eyebrow text-muted-foreground">{goal.status}</p><CardTitle className="mt-2">{goal.name}</CardTitle></div><span className="font-mono text-sm">{progress.toFixed(0)}%</span></div></CardHeader>
                <CardContent className="space-y-5">
                  <div className="h-3 bg-secondary border border-border"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div>
                  <div className="flex justify-between"><div><p className="text-xs text-muted-foreground uppercase">Saved</p><p className="font-bold">{formatCurrency(goal.current_amount, currency)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground uppercase">Target</p><p className="font-bold">{formatCurrency(goal.target_amount, currency)}</p></div></div>
                  {goal.target_date && <p className="font-mono text-xs text-muted-foreground">TARGET_DATE: {new Date(`${goal.target_date}T00:00:00`).toLocaleDateString()}</p>}
                  <div className="flex gap-2 border-t border-border pt-4">
                    <Button className="flex-1" disabled={goal.status === 'completed'} onClick={() => setContributionGoal(goal)}><PiggyBank /> Contribute</Button>
                    <Button variant="outline" size="icon" aria-label={goal.status === 'paused' ? 'Resume goal' : 'Pause goal'} disabled={goal.status === 'completed'} onClick={() => updateStatus(goal)}>{goal.status === 'paused' ? <CheckCircle2 /> : <Pause />}</Button>
                    <Button variant="outline" size="icon" className="text-destructive" aria-label="Delete goal" onClick={() => deleteGoal(goal)}><Trash2 /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={goalOpen} onOpenChange={setGoalOpen}><DialogContent><DialogHeader><DialogTitle>Create savings goal</DialogTitle></DialogHeader><form onSubmit={createGoal} className="space-y-4"><div className="space-y-2"><Label htmlFor="goal-name">Goal name</Label><Input id="goal-name" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required /></div><div className="space-y-2"><Label htmlFor="goal-amount">Target amount</Label><Input id="goal-amount" type="number" min="1" step="0.01" value={form.targetAmount} onChange={event => setForm(current => ({ ...current, targetAmount: event.target.value }))} required /></div><div className="space-y-2"><Label htmlFor="goal-date">Target date</Label><Input id="goal-date" type="date" min={toDateInputValue()} value={form.targetDate} onChange={event => setForm(current => ({ ...current, targetDate: event.target.value }))} /></div><div className="space-y-2"><Label htmlFor="goal-notes">Notes</Label><Textarea id="goal-notes" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></div><Button className="w-full" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : 'Create goal'}</Button></form></DialogContent></Dialog>

      <Dialog open={Boolean(contributionGoal)} onOpenChange={open => !open && setContributionGoal(null)}><DialogContent><DialogHeader><DialogTitle>Contribute to {contributionGoal?.name}</DialogTitle></DialogHeader><form onSubmit={addContribution} className="space-y-4"><div className="space-y-2"><Label htmlFor="contribution-amount">Amount</Label><Input id="contribution-amount" type="number" min="0.01" step="0.01" value={contribution.amount} onChange={event => setContribution(current => ({ ...current, amount: event.target.value }))} required /></div><div className="space-y-2"><Label htmlFor="contribution-note">Note</Label><Input id="contribution-note" value={contribution.note} onChange={event => setContribution(current => ({ ...current, note: event.target.value }))} /></div><Button className="w-full" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : 'Add contribution'}</Button></form></DialogContent></Dialog>
    </div>
  );
};

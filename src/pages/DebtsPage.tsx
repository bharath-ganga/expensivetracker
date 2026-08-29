import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { CreditCard, Plus, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Banknote, Trash2 } from 'lucide-react';
import type { Debt } from '@/types/database';

export const DebtsPage = () => {
  const { user } = useStore();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [formData, setFormData] = useState({
    person_name: '',
    amount: '',
    type: 'i_owe',
    borrowed_date: new Date().toISOString().split('T')[0],
    notes: '',
    due_date: '',
  });

  const fetchDebts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('debts').select('*').eq('user_id', user.id).order('borrowed_date', { ascending: false });
    if (error) toast.error(error.message); else setDebts((data || []) as Debt[]);
  }, [user]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase.from('debts').insert([{
      user_id: user.id,
      person_name: formData.person_name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      borrowed_date: formData.borrowed_date,
      notes: formData.notes,
      due_date: formData.due_date || null,
      status: 'pending',
      paid_amount: 0
    }]);

    if (error) {
      toast.error('Failed to add debt');
    } else {
      toast.success('Debt recorded!');
      setIsOpen(false);
      fetchDebts();
    }
    setIsLoading(false);
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!paymentDebt) return;
    const { error } = await supabase.rpc('record_debt_payment', { p_debt_id: paymentDebt.id, p_amount: Number(paymentAmount), p_note: null });
    if (error) return toast.error(error.message);
    toast.success('Payment recorded.');
    setPaymentDebt(null);
    setPaymentAmount('');
    void fetchDebts();
  };

  const handleDelete = async (debt: Debt) => {
    if (!window.confirm(`Delete the debt record for ${debt.person_name}?`)) return;
    const { error } = await supabase.from('debts').delete().eq('id', debt.id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else void fetchDebts();
  };

  const iOwe = debts.filter(d => d.type === 'i_owe');
  const owedToMe = debts.filter(d => d.type === 'owed_to_me');

  const totalIOwe = iOwe.reduce((sum, d) => sum + Math.max(0, d.amount - d.paid_amount), 0);
  const totalOwedToMe = owedToMe.reduce((sum, d) => sum + Math.max(0, d.amount - d.paid_amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debt Tracker</h1>
          <p className="text-muted-foreground">Keep track of money you borrowed or lent.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Add Debt Record
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>New Debt Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="border-2 border-input bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="i_owe">I Borrowed Money (I Owe)</SelectItem>
                    <SelectItem value="owed_to_me">I Lent Money (Owed To Me)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Person Name</Label>
                <Input required className="border-2 border-input bg-background" value={formData.person_name} onChange={e => setFormData({...formData, person_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" required className="border-2 border-input bg-background" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" required className="border-2 border-input bg-background" value={formData.borrowed_date} onChange={e => setFormData({...formData, borrowed_date: e.target.value})} />
              </div>
              <div className="space-y-2"><Label>Due Date (Optional)</Label><Input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} /></div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Record'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-red-500">
              <span className="flex items-center gap-2"><ArrowDownToLine className="h-5 w-5" /> Money I Owe</span>
              <span>₹{totalIOwe.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {iOwe.length === 0 && <p className="text-muted-foreground text-sm">No debts here. Great job!</p>}
            {iOwe.map(debt => (
              <div key={debt.id} className={`flex items-center justify-between border border-border p-4 ${debt.status === 'settled' ? 'bg-secondary opacity-50' : 'bg-background'}`}>
                <div>
                  <h4 className="font-semibold">{debt.person_name}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(debt.borrowed_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-red-500">₹{Math.max(0, debt.amount - debt.paid_amount).toFixed(2)}</span>
                  {debt.status !== 'settled' && (
                    <Button variant="outline" size="sm" onClick={() => { setPaymentDebt(debt); setPaymentAmount(String(debt.amount - debt.paid_amount)); }}><Banknote /> Payment</Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(debt)}><Trash2 /></Button>
                  {debt.status === 'settled' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-emerald-500">
              <span className="flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5" /> Owed To Me</span>
              <span>₹{totalOwedToMe.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {owedToMe.length === 0 && <p className="text-muted-foreground text-sm">Nobody owes you money right now.</p>}
            {owedToMe.map(debt => (
              <div key={debt.id} className={`flex items-center justify-between border border-border p-4 ${debt.status === 'settled' ? 'bg-secondary opacity-50' : 'bg-background'}`}>
                <div>
                  <h4 className="font-semibold">{debt.person_name}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(debt.borrowed_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-500">₹{Math.max(0, debt.amount - debt.paid_amount).toFixed(2)}</span>
                  {debt.status !== 'settled' && (
                    <Button variant="outline" size="sm" onClick={() => { setPaymentDebt(debt); setPaymentAmount(String(debt.amount - debt.paid_amount)); }}><Banknote /> Payment</Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(debt)}><Trash2 /></Button>
                  {debt.status === 'settled' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Dialog open={Boolean(paymentDebt)} onOpenChange={open => !open && setPaymentDebt(null)}><DialogContent><DialogHeader><DialogTitle>Record payment · {paymentDebt?.person_name}</DialogTitle></DialogHeader><form onSubmit={handlePayment} className="space-y-4"><div className="space-y-2"><Label htmlFor="debt-payment">Payment amount</Label><Input id="debt-payment" type="number" min="0.01" max={paymentDebt ? paymentDebt.amount - paymentDebt.paid_amount : undefined} step="0.01" value={paymentAmount} onChange={event => setPaymentAmount(event.target.value)} required /></div><Button className="w-full">Record payment</Button></form></DialogContent></Dialog>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { CreditCard, Plus, ArrowDownToLine, ArrowUpFromLine, CheckCircle2 } from 'lucide-react';

export const DebtsPage = () => {
  const { user } = useStore();
  const [debts, setDebts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    person_name: '',
    amount: '',
    type: 'i_owe',
    borrowed_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchDebts = async () => {
    if (!user) return;
    // We mock fetch or create table if not exists, but let's assume it exists
    const { data } = await supabase.from('debts').select('*').eq('user_id', user.id);
    if (data) setDebts(data);
  };

  useEffect(() => {
    fetchDebts();
  }, [user]);

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

  const handleSettle = async (id: string) => {
    const { error } = await supabase.from('debts').update({ status: 'settled' }).eq('id', id);
    if (!error) {
      toast.success('Debt settled!');
      fetchDebts();
    }
  };

  const iOwe = debts.filter(d => d.type === 'i_owe');
  const owedToMe = debts.filter(d => d.type === 'owed_to_me');

  const totalIOwe = iOwe.filter(d => d.status !== 'settled').reduce((sum, d) => sum + d.amount, 0);
  const totalOwedToMe = owedToMe.filter(d => d.status !== 'settled').reduce((sum, d) => sum + d.amount, 0);

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
                  <SelectTrigger className="bg-background/50">
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
                <Input required className="bg-background/50" value={formData.person_name} onChange={e => setFormData({...formData, person_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" required className="bg-background/50" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" required className="bg-background/50" value={formData.borrowed_date} onChange={e => setFormData({...formData, borrowed_date: e.target.value})} />
              </div>
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
              <div key={debt.id} className={`p-4 rounded-xl border border-white/10 flex justify-between items-center ${debt.status === 'settled' ? 'opacity-50' : 'bg-background/50'}`}>
                <div>
                  <h4 className="font-semibold">{debt.person_name}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(debt.borrowed_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-red-500">₹{debt.amount}</span>
                  {debt.status !== 'settled' && (
                    <Button variant="outline" size="sm" onClick={() => handleSettle(debt.id)}>Settle</Button>
                  )}
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
              <div key={debt.id} className={`p-4 rounded-xl border border-white/10 flex justify-between items-center ${debt.status === 'settled' ? 'opacity-50' : 'bg-background/50'}`}>
                <div>
                  <h4 className="font-semibold">{debt.person_name}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(debt.borrowed_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-500">₹{debt.amount}</span>
                  {debt.status !== 'settled' && (
                    <Button variant="outline" size="sm" onClick={() => handleSettle(debt.id)}>Settle</Button>
                  )}
                  {debt.status === 'settled' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

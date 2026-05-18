import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { TrendingUp, Plus, TrendingDown } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

export const InvestmentsPage = () => {
  const { user } = useStore();
  const [investments, setInvestments] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Mutual Fund',
    amount_invested: '',
    current_value: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  const fetchInvestments = async () => {
    if (!user) return;
    const { data } = await supabase.from('investments').select('*').eq('user_id', user.id);
    if (data) setInvestments(data);
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase.from('investments').insert([{
      user_id: user.id,
      name: formData.name,
      type: formData.type,
      amount_invested: parseFloat(formData.amount_invested),
      current_value: parseFloat(formData.current_value),
      start_date: formData.start_date,
    }]);

    if (error) toast.error('Failed to add investment');
    else {
      toast.success('Investment added!');
      setIsOpen(false);
      fetchInvestments();
    }
    setIsLoading(false);
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalProfitLoss = totalCurrent - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  const pieData = investments.reduce((acc: any[], inv) => {
    const existing = acc.find(a => a.name === inv.type);
    if (existing) existing.value += inv.current_value;
    else acc.push({ name: inv.type, value: inv.current_value });
    return acc;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">Track your portfolio performance.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>New Investment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input required className="bg-background/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Nifty 50 Index Fund" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input required className="bg-background/50" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="e.g. Mutual Fund, Stock, Gold" />
              </div>
              <div className="space-y-2">
                <Label>Amount Invested</Label>
                <Input type="number" required className="bg-background/50" value={formData.amount_invested} onChange={e => setFormData({...formData, amount_invested: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Current Value</Label>
                <Input type="number" required className="bg-background/50" value={formData.current_value} onChange={e => setFormData({...formData, current_value: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" required className="bg-background/50" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Investment'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass md:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">₹{totalInvested.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold">₹{totalCurrent.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Total Returns</p>
              <div className={`flex items-center gap-2 text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {totalProfitLoss >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                ₹{Math.abs(totalProfitLoss).toFixed(2)} ({profitLossPercent.toFixed(2)}%)
              </div>
            </div>
          </CardContent>
          <CardContent>
            <div className="space-y-4 mt-6">
              {investments.map(inv => {
                const profit = inv.current_value - inv.amount_invested;
                const profitPercent = (profit / inv.amount_invested) * 100;
                const isPositive = profit >= 0;
                return (
                  <div key={inv.id} className="p-4 rounded-xl border border-white/10 bg-background/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">{inv.name}</h4>
                      <p className="text-xs text-muted-foreground">{inv.type} • Since {new Date(inv.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{inv.current_value.toFixed(2)}</p>
                      <p className={`text-sm flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(profit).toFixed(2)} ({Math.abs(profitPercent).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                );
              })}
              {investments.length === 0 && <p className="text-center text-muted-foreground py-8">No investments tracked yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <PieChart className="h-16 w-16 mb-2 opacity-20" />
                  No data
                </div>
              )}
          </CardContent>
          <CardContent>
            <div className="space-y-2">
              {pieData.map((data, idx) => (
                <div key={data.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span>{data.name}</span>
                  </div>
                  <span className="font-semibold">₹{data.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Plus, ExternalLink, ShoppingBag, CheckCircle2 } from 'lucide-react';

export const WishlistPage = () => {
  const { user, expenses } = useStore();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    item_name: '',
    estimated_price: '',
    priority: 'Medium',
    link: '',
    target_date: new Date().toISOString().split('T')[0],
  });

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase.from('wishlist').select('*').eq('user_id', user.id);
    if (data) setWishlist(data);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase.from('wishlist').insert([{
      user_id: user.id,
      item_name: formData.item_name,
      estimated_price: parseFloat(formData.estimated_price),
      priority: formData.priority,
      link: formData.link,
      target_date: formData.target_date,
      is_purchased: false,
    }]);

    if (error) toast.error('Failed to add to wishlist');
    else {
      toast.success('Added to wishlist!');
      setIsOpen(false);
      fetchWishlist();
    }
    setIsLoading(false);
  };

  const handleBuy = async (item: any) => {
    if (!user) return;
    
    // 1. Add to expenses
    const { error: expError } = await supabase.from('expenses').insert([{
      user_id: user.id,
      amount: item.estimated_price,
      description: item.item_name,
      category_id: 'Shopping', // Default
      date: new Date().toISOString().split('T')[0],
      currency: 'INR'
    }]);

    if (expError) {
      return toast.error('Failed to record expense');
    }

    // 2. Mark as purchased
    const { error } = await supabase.from('wishlist').update({ is_purchased: true }).eq('id', item.id);
    if (!error) {
      toast.success('Marked as purchased & added to expenses!');
      fetchWishlist();
    }
  };

  const unpurchased = wishlist.filter(w => !w.is_purchased);
  const totalNeeded = unpurchased.reduce((sum, w) => sum + w.estimated_price, 0);

  // Calculate current savings
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentSavings = user?.monthly_salary ? Math.max(0, user.monthly_salary - totalSpent) : 0;
  
  // Very rough estimate of months needed
  const averageSavingsPerMonth = user?.monthly_salary ? user.monthly_salary * ((user.savings_goal_percent || 20) / 100) : 0;
  const monthsToAfford = averageSavingsPerMonth > 0 ? Math.ceil(totalNeeded / averageSavingsPerMonth) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground">Things you want to buy later.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>New Wishlist Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input required className="bg-background/50" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Price (₹)</Label>
                <Input type="number" required className="bg-background/50" value={formData.estimated_price} onChange={e => setFormData({...formData, estimated_price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product Link (Optional)</Label>
                <Input type="url" className="bg-background/50" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Target Buy Date</Label>
                <Input type="date" required className="bg-background/50" value={formData.target_date} onChange={e => setFormData({...formData, target_date: e.target.value})} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving...' : 'Add to Wishlist'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Total needed: <span className="text-primary">₹{totalNeeded.toFixed(2)}</span></h3>
          <p className="text-muted-foreground">At your current savings rate, you can afford everything in ~<span className="font-bold text-foreground">{monthsToAfford} months</span>.</p>
        </div>
        <div className="bg-background/50 px-4 py-2 rounded-lg border border-white/5">
          <p className="text-sm text-muted-foreground">Current Savings</p>
          <p className="text-lg font-bold">₹{currentSavings.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unpurchased.map(item => (
          <Card key={item.id} className="glass flex flex-col overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-full h-1 ${item.priority === 'High' ? 'bg-red-500' : item.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-start">
                <span>{item.item_name}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-3xl font-bold text-primary mb-2">₹{item.estimated_price}</p>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span className="bg-background/50 px-2 py-1 rounded border border-white/5">{item.priority} Priority</span>
                <span className="bg-background/50 px-2 py-1 rounded border border-white/5">Target: {new Date(item.target_date).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-black/20 pt-4 border-t border-white/5">
              <Button onClick={() => handleBuy(item)} className="w-full gap-2" variant="outline">
                <ShoppingBag className="h-4 w-4" /> I Bought This!
              </Button>
            </CardFooter>
          </Card>
        ))}
        {unpurchased.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Your wishlist is empty. Add something you want to buy!</p>
          </div>
        )}
      </div>

      {wishlist.filter(w => w.is_purchased).length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" /> Already Purchased</h3>
          <div className="space-y-2">
            {wishlist.filter(w => w.is_purchased).map(item => (
              <div key={item.id} className="p-4 bg-background/30 rounded-xl border border-white/5 flex justify-between items-center opacity-60">
                <span className="line-through">{item.item_name}</span>
                <span>₹{item.estimated_price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

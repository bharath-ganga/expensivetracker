import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Plus, ExternalLink, ShoppingBag, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import type { WishlistItem } from '@/types/database';

export const WishlistPage = () => {
  const { user, expenses, currency } = useStore();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState<WishlistItem | null>(null);

  const [formData, setFormData] = useState({
    item_name: '',
    estimated_price: '',
    priority: 'Medium',
    link: '',
    target_date: new Date().toISOString().split('T')[0],
  });

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) toast.error(error.message); else setWishlist((data || []) as WishlistItem[]);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const payload = {
      user_id: user.id,
      item_name: formData.item_name,
      estimated_price: parseFloat(formData.estimated_price),
      priority: formData.priority,
      link: formData.link,
      target_date: formData.target_date,
      is_purchased: false,
    };
    const { error } = editing
      ? await supabase.from('wishlist').update(payload).eq('id', editing.id).eq('user_id', user.id)
      : await supabase.from('wishlist').insert(payload);

    if (error) toast.error('Failed to add to wishlist');
    else {
      toast.success(editing ? 'Wishlist item updated.' : 'Added to wishlist!');
      setIsOpen(false);
      setEditing(null);
      void fetchWishlist();
    }
    setIsLoading(false);
  };

  const handleBuy = async (item: WishlistItem) => {
    if (!user) return;
    const { error } = await supabase.rpc('purchase_wishlist_item', { p_item_id: item.id, p_currency: currency });
    if (!error) {
      toast.success('Marked as purchased & added to expenses!');
      void fetchWishlist();
    } else toast.error(error.message);
  };

  const openEdit = (item: WishlistItem) => {
    setEditing(item);
    setFormData({ item_name: item.item_name, estimated_price: String(item.estimated_price), priority: item.priority, link: item.link || '', target_date: item.target_date || new Date().toISOString().split('T')[0] });
    setIsOpen(true);
  };

  const deleteItem = async (item: WishlistItem) => {
    if (!window.confirm(`Delete “${item.item_name}”?`)) return;
    const { error } = await supabase.from('wishlist').delete().eq('id', item.id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else void fetchWishlist();
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
            <Button className="gap-2 bg-primary text-primary-foreground" onClick={() => { setEditing(null); setFormData({ item_name: '', estimated_price: '', priority: 'Medium', link: '', target_date: new Date().toISOString().split('T')[0] }); }}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Wishlist Item' : 'New Wishlist Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input required className="border-2 border-input bg-background" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Price (₹)</Label>
                <Input type="number" required className="border-2 border-input bg-background" value={formData.estimated_price} onChange={e => setFormData({...formData, estimated_price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger className="border-2 border-input bg-background">
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
                <Input type="url" className="border-2 border-input bg-background" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Target Buy Date</Label>
                <Input type="date" required className="border-2 border-input bg-background" value={formData.target_date} onChange={e => setFormData({...formData, target_date: e.target.value})} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving...' : (editing ? 'Update Item' : 'Add to Wishlist')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-2 border-foreground bg-primary p-6 text-primary-foreground shadow-[5px_5px_0_hsl(var(--foreground))] md:flex-row">
        <div>
          <p className="eyebrow mb-2">// PURCHASE QUEUE</p>
          <h3 className="text-xl font-bold">Total needed: ₹{totalNeeded.toFixed(2)}</h3>
          <p>At your current savings rate, you can afford everything in ~<span className="font-bold">{monthsToAfford} months</span>.</p>
        </div>
        <div className="border-2 border-primary-foreground bg-foreground px-5 py-3 text-background">
          <p className="font-mono text-xs uppercase tracking-widest">Current savings</p>
          <p className="text-xl font-black text-primary">₹{currentSavings.toFixed(2)}</p>
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
                <span className="border border-border bg-background px-2 py-1 font-mono text-xs uppercase">{item.priority} priority</span>
                <span className="border border-border bg-background px-2 py-1 font-mono text-xs uppercase">Target: {new Date(item.target_date).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter className="gap-2 border-t-2 border-border bg-secondary pt-4">
              <Button onClick={() => handleBuy(item)} className="flex-1 gap-2" variant="outline">
                <ShoppingBag className="h-4 w-4" /> I Bought This!
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit3 /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item)}><Trash2 /></Button>
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
              <div key={item.id} className="flex items-center justify-between border border-border bg-secondary p-4 opacity-60">
                <span className="line-through">{item.item_name}</span>
                <div className="flex items-center gap-3"><span>₹{item.estimated_price}</span><Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item)}><Trash2 /></Button></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

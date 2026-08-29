import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Utensils, ShoppingCart, Car, Zap, Home, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

const categories = [
  { name: 'Food', icon: Utensils, color: 'bg-orange-500' },
  { name: 'Shopping', icon: ShoppingCart, color: 'bg-blue-500' },
  { name: 'Transport', icon: Car, color: 'bg-green-500' },
  { name: 'Bills', icon: Zap, color: 'bg-yellow-500' },
  { name: 'Housing', icon: Home, color: 'bg-purple-500' },
  { name: 'Other', icon: MoreHorizontal, color: 'bg-slate-500' },
];

export const QuickAddWidget = () => {
  const { user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0].name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      return toast.error('Enter a valid amount');
    }
    
    setIsLoading(true);
    const { error } = await supabase.from('expenses').insert({
      user_id: user?.id,
      amount: Number(amount),
      description: 'Quick Add',
      category_id: category,
      date: new Date().toISOString()
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Added quickly! ⚡');
      setAmount('');
      setIsOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-72 bg-card shadow-[6px_6px_0_hsl(var(--foreground))] border border-border p-4 animate-in slide-in-from-bottom-5 fade-in z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Quick Add ⚡</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder="0"
                className="pl-8 h-16 text-3xl font-bold bg-muted/50 border-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col items-center justify-center border p-2 transition-colors ${category === cat.name ? 'border-foreground bg-primary text-primary-foreground' : 'border-border bg-muted hover:bg-secondary'}`}
                >
                  <cat.icon className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            <Button 
              className="w-full h-12 font-bold text-lg" 
              onClick={handleSave}
              disabled={isLoading || !amount}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground border-2 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))] flex items-center justify-center hover:-translate-y-0.5 transition-transform z-50"
      >
        <Plus className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </>
  );
};

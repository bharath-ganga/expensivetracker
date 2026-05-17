import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, Receipt, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export const AddExpenseModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useStore(state => state.user);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });

  const [openCategory, setOpenCategory] = useState(false);

  const categories = [
    { id: '1', name: 'Food & Dining', icon: '🍔' },
    { id: '2', name: 'Transport', icon: '🚗' },
    { id: '3', name: 'Shopping', icon: '🛍️' },
    { id: '4', name: 'Bills & Utilities', icon: '📱' },
    { id: '5', name: 'Entertainment', icon: '🎬' },
    { id: '6', name: 'Groceries', icon: '🛒' },
    { id: '7', name: 'Health & Fitness', icon: '🏋️' },
    { id: '8', name: 'Travel', icon: '✈️' },
    { id: '9', name: 'Education', icon: '📚' },
    { id: '10', name: 'Personal Care', icon: '💇' },
    { id: '11', name: 'Gifts & Donations', icon: '🎁' },
    { id: '12', name: 'Home Maintenance', icon: '🏠' },
    { id: '13', name: 'Pets', icon: '🐾' },
    { id: '14', name: 'Subscriptions', icon: '📺' },
    { id: '15', name: 'Insurance', icon: '🛡️' },
    { id: '16', name: 'Taxes', icon: '📜' },
    { id: '17', name: 'Debt Repayment', icon: '💳' },
    { id: '18', name: 'Investments', icon: '📈' },
    { id: '19', name: 'Clothing', icon: '👕' },
    { id: '20', name: 'Electronics', icon: '💻' },
    { id: '21', name: 'Hobbies', icon: '🎨' },
    { id: '22', name: 'Kids', icon: '🧸' },
    { id: '23', name: 'Office Supplies', icon: '📎' },
    { id: '24', name: 'Auto Maintenance', icon: '🔧' },
    { id: '25', name: 'Other', icon: '📦' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    // In a real app we'd fetch/use real category IDs. For now we just insert the data.
    const { error } = await supabase.from('expenses').insert([{
      user_id: user.id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      currency: 'INR'
    }]);

    if (error) {
      toast.error('Failed to add expense');
      console.error(error);
    } else {
      toast.success('Expense added successfully!');
      setIsOpen(false);
      setFormData({
        amount: '',
        description: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl h-12 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Add Expense</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] glass border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            New Expense
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10 text-lg font-semibold bg-background/50 border-white/10"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="What did you buy?"
              className="bg-background/50 border-white/10"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Category</Label>
              <Popover open={openCategory} onOpenChange={setOpenCategory}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCategory}
                    className="w-full justify-between bg-background/50 border-white/10 font-normal px-3"
                  >
                    {formData.category
                      ? (
                        <span className="flex items-center gap-2">
                          <span>{categories.find((c) => c.name === formData.category)?.icon}</span>
                          <span>{categories.find((c) => c.name === formData.category)?.name}</span>
                        </span>
                      )
                      : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 glass border-white/10 z-[100]" align="start">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat.id}
                            value={cat.name}
                            onSelect={(currentValue) => {
                              setFormData({ ...formData, category: cat.name });
                              setOpenCategory(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.category === cat.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                className="bg-background/50 border-white/10"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 h-11"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

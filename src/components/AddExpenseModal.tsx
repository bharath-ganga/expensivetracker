import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, Receipt, IndianRupee, Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

const moods = [
  { label: 'Happy', emoji: '😊', value: 'happy' },
  { label: 'Neutral', emoji: '😐', value: 'neutral' },
  { label: 'Guilty', emoji: '😟', value: 'guilty' },
  { label: 'Excited', emoji: '🤩', value: 'excited' },
  { label: 'Stressed', emoji: '😤', value: 'stressed' },
];

export const AddExpenseModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const user = useStore(state => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    mood: 'neutral'
  });

  const [openCategory, setOpenCategory] = useState(false);

  const categories = [
    { id: '1', name: 'Food & Dining', icon: '🍔' },
    { id: '2', name: 'Transport', icon: '🚗' },
    { id: '3', name: 'Shopping', icon: '🛍️' },
    { id: '4', name: 'Bills & Utilities', icon: '📱' },
    { id: '5', name: 'Entertainment', icon: '🎬' },
    { id: '6', name: 'Other', icon: '📦' },
  ];

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.info("Analyzing receipt with AI...");
    
    // Simulate API Call to Claude AI Vision
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        amount: '1250',
        description: 'Starbucks Coffee',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0]
      }));
      toast.success("Receipt scanned successfully!");
      setIsScanning(false);
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    const { error } = await supabase.from('expenses').insert([{
      user_id: user.id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      currency: 'INR',
      notes: formData.notes,
      mood: formData.mood
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
        notes: '',
        mood: 'neutral'
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
      
      <DialogContent className="sm:max-w-[425px] glass border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              New Expense
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {isScanning ? "Scanning..." : "Scan Receipt"}
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleScanReceipt}
            />
          </div>
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
                          <span>{categories.find((c) => c.name === formData.category)?.icon || '📦'}</span>
                          <span>{categories.find((c) => c.name === formData.category)?.name || formData.category}</span>
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

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Any details about this expense?"
              className="bg-background/50 border-white/10 resize-none h-20"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex gap-2 justify-between">
              {moods.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: m.value })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all flex-1 ${formData.mood === m.value ? 'bg-primary/20 border border-primary/50 scale-105' : 'bg-background/50 border border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] mt-1">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 h-11"
            disabled={isLoading || isScanning}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

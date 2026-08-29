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
import { useStore } from '@/store/useStore';
import { financeRepository } from '@/lib/finance-repository';

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
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    mood: 'neutral',
    receipt_url: ''
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

    if (!user) return;
    setIsScanning(true);
    try {
      const receiptPath = await financeRepository.uploadReceipt(user.id, file);
      setFormData(prev => ({ ...prev, receipt_url: receiptPath }));
      toast.success('Receipt attached. Enter the transaction details to continue.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to upload receipt.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await financeRepository.createExpense(user.id, {
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      currency: 'INR',
      category_id: formData.category,
      notes: formData.notes,
      mood: formData.mood as 'happy' | 'neutral' | 'guilty' | 'excited' | 'stressed',
      receipt_url: formData.receipt_url || null,
      is_recurring: false,
      tags: [],
      });
      toast.success('Expense added successfully!');
      setIsOpen(false);
      setFormData({
        amount: '',
        description: '',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        mood: 'neutral',
        receipt_url: ''
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add expense');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 w-full gap-2 border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] hover:bg-primary/90">
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Add Expense</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="glass max-h-[90vh] overflow-y-auto border-2 border-foreground sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              New Expense
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-2 border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {isScanning ? "Uploading..." : (formData.receipt_url ? "Receipt Attached" : "Attach Receipt")}
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
                className="border-2 border-input bg-background pl-10 text-lg font-semibold"
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
              className="border-2 border-input bg-background"
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
                    className="w-full justify-between border-2 border-input bg-background px-3 font-normal"
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
                <PopoverContent className="glass z-[100] w-[200px] border-2 border-foreground p-0" align="start">
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
                className="border-2 border-input bg-background"
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
              className="h-20 resize-none border-2 border-input bg-background"
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
                  className={`flex flex-1 flex-col items-center justify-center border-2 p-2 transition-colors ${formData.mood === m.value ? 'border-foreground bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] mt-1">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="mt-6 h-11 w-full border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] hover:bg-primary/90"
            disabled={isLoading || isScanning}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

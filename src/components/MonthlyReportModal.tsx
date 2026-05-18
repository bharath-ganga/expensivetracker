import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { Share2, Download, Trophy, Flame, Target } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { toast } from 'sonner';

export const MonthlyReportModal = () => {
  const { user, expenses } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  // We are calculating stats for the *previous* month
  const lastMonth = subMonths(new Date(), 1);
  const monthName = format(lastMonth, 'MMMM');
  const year = format(lastMonth, 'yyyy');

  const lastMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  });

  const totalSpent = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalEarned = user?.monthly_salary || 0;
  const totalSaved = Math.max(0, totalEarned - totalSpent);
  const savedPercent = totalEarned > 0 ? (totalSaved / totalEarned) * 100 : 0;

  const categories = lastMonthExpenses.reduce((acc: any, curr) => {
    acc[curr.category_id || 'General'] = (acc[curr.category_id || 'General'] || 0) + curr.amount;
    return acc;
  }, {});
  
  const biggestCategory = Object.entries(categories).sort((a: any, b: any) => b[1] - a[1])[0] || ['None', 0];

  const budgetScore = Math.max(0, Math.min(100, 100 - ((totalSpent / totalEarned) * 100)));

  const handleShare = () => {
    // In a real app we'd use html2canvas to capture `reportRef.current` and share
    toast.success('Report card image generated! (Simulation)');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">
          <Trophy className="h-4 w-4" />
          View {monthName} Report Card
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] glass p-0 overflow-hidden border-white/10">
        <div 
          ref={reportRef}
          className="bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 p-8 text-white relative"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/30 rounded-full blur-3xl -ml-10 -mb-10" />

          <div className="relative z-10 text-center mb-6">
            <h2 className="text-3xl font-black mb-1">Your {monthName} Report 📊</h2>
            <p className="text-white/70">SpendSmart Financial Summary</p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-white/80">💰 Total Spent</span>
              <span className="font-bold text-xl text-red-400">₹{totalSpent.toFixed(0)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-white/80">💵 Total Earned</span>
              <span className="font-bold text-xl">₹{totalEarned.toFixed(0)}</span>
            </div>

            <div className="flex justify-between items-center bg-emerald-500/20 p-3 rounded-xl backdrop-blur-sm border border-emerald-500/30">
              <span className="text-emerald-100 flex items-center gap-2"><Trophy className="h-4 w-4 text-emerald-400" /> Total Saved</span>
              <div className="text-right">
                <span className="font-bold text-xl text-emerald-400">₹{totalSaved.toFixed(0)}</span>
                <span className="text-xs ml-2 text-emerald-200">({savedPercent.toFixed(0)}%)</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-white/80">📉 Biggest Category</span>
              <div className="text-right">
                <span className="font-bold">{biggestCategory[0]}</span>
                <span className="text-xs ml-2 text-white/50">₹{Number(biggestCategory[1]).toFixed(0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/20 p-3 rounded-xl backdrop-blur-sm border border-primary/30 flex flex-col items-center justify-center text-center">
                <Target className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs text-white/80">Budget Score</span>
                <span className="font-black text-2xl text-primary">{budgetScore.toFixed(0)}/100</span>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-xl backdrop-blur-sm border border-orange-500/30 flex flex-col items-center justify-center text-center">
                <Flame className="h-6 w-6 text-orange-400 mb-1" />
                <span className="text-xs text-white/80">Streak</span>
                <span className="font-black text-2xl text-orange-400">3 Months</span>
              </div>
            </div>

            <div className="mt-6 text-center bg-white/10 p-4 rounded-xl border border-white/20">
              <p className="font-bold text-emerald-300 mb-1">Top Insight 🎉</p>
              <p className="text-sm text-white/90">"You saved ₹3,000 MORE than last month! Keep it up!"</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-background flex gap-4">
          <Button className="flex-1 gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share on Instagram
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

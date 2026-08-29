import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { Share2, Download, Trophy, Receipt, Target } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { toast } from 'sonner';

export const MonthlyReportModal = () => {
  const { user, expenses, incomes } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // We are calculating stats for the *previous* month
  const lastMonth = subMonths(new Date(), 1);
  const monthName = format(lastMonth, 'MMMM');
  const year = format(lastMonth, 'yyyy');

  const lastMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  });

  const totalSpent = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const recordedIncome = incomes.filter(item => {
    const date = new Date(item.date);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  }).reduce((sum, item) => sum + item.amount, 0);
  const totalEarned = recordedIncome || user?.monthly_salary || 0;
  const totalSaved = Math.max(0, totalEarned - totalSpent);
  const savedPercent = totalEarned > 0 ? (totalSaved / totalEarned) * 100 : 0;

  const categories = lastMonthExpenses.reduce((acc: any, curr) => {
    acc[curr.category_id || 'General'] = (acc[curr.category_id || 'General'] || 0) + curr.amount;
    return acc;
  }, {});
  
  const biggestCategory = Object.entries(categories).sort((a: any, b: any) => b[1] - a[1])[0] || ['None', 0];

  const budgetScore = totalEarned > 0 ? Math.max(0, Math.min(100, 100 - ((totalSpent / totalEarned) * 100))) : 0;

  const reportText = `${monthName} ${year} financial report\nEarned: ₹${totalEarned.toFixed(0)}\nSpent: ₹${totalSpent.toFixed(0)}\nSaved: ₹${totalSaved.toFixed(0)}\nBudget score: ${budgetScore.toFixed(0)}/100`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${monthName} financial report`, text: reportText });
      } else {
        await navigator.clipboard.writeText(reportText);
        toast.success('Report copied to clipboard.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('Unable to share this report.');
    }
  };

  const handleDownload = () => {
    const escapeXml = (value: string) => value.replace(/[<>&'"]/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" fill="#17181d"/><rect x="72" y="72" width="936" height="936" fill="#00e391"/><rect x="88" y="88" width="904" height="904" fill="#17181d"/><g fill="#f5f3ea" font-family="monospace"><text x="130" y="180" font-size="30">// FINFLOW_REPORT</text><text x="130" y="260" font-size="64" font-weight="700">${escapeXml(monthName.toUpperCase())} ${year}</text><text x="130" y="400" font-size="42">EARNED  ₹${totalEarned.toFixed(0)}</text><text x="130" y="500" font-size="42">SPENT   ₹${totalSpent.toFixed(0)}</text><text x="130" y="600" font-size="42">SAVED   ₹${totalSaved.toFixed(0)}</text><text x="130" y="740" font-size="52" fill="#00e391">SCORE ${budgetScore.toFixed(0)}/100</text><text x="130" y="890" font-size="28">TOP CATEGORY: ${escapeXml(String(biggestCategory[0]).toUpperCase())}</text></g></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `finflow-report-${year}-${format(lastMonth, 'MM')}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-2 border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground">
          <Trophy className="h-4 w-4" />
          View {monthName} Report Card
        </Button>
      </DialogTrigger>
      
      <DialogContent className="glass overflow-hidden border-2 border-foreground p-0 sm:max-w-[450px]">
        <div className="relative bg-foreground p-8 text-background">
          <div className="relative z-10 mb-6 border-b-2 border-primary pb-5">
            <p className="eyebrow mb-2 text-primary">// MONTHLY REPORT</p>
            <h2 className="mb-1 text-3xl font-black uppercase tracking-tight">{monthName} {year}</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-background/70">SpendSmart financial summary</p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between border border-background/40 bg-foreground p-3">
              <span className="text-background/80">Total spent</span>
              <span className="font-bold text-xl text-red-400">₹{totalSpent.toFixed(0)}</span>
            </div>
            
            <div className="flex items-center justify-between border border-background/40 bg-foreground p-3">
              <span className="text-background/80">Total earned</span>
              <span className="font-bold text-xl">₹{totalEarned.toFixed(0)}</span>
            </div>

            <div className="flex items-center justify-between border-2 border-primary bg-primary p-3 text-primary-foreground">
              <span className="flex items-center gap-2 font-bold"><Trophy className="h-4 w-4" /> Total saved</span>
              <div className="text-right">
                <span className="text-xl font-bold">₹{totalSaved.toFixed(0)}</span>
                <span className="ml-2 text-xs">({savedPercent.toFixed(0)}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between border border-background/40 bg-foreground p-3">
              <span className="text-background/80">Biggest category</span>
              <div className="text-right">
                <span className="font-bold">{biggestCategory[0]}</span>
                <span className="ml-2 text-xs text-background/50">₹{Number(biggestCategory[1]).toFixed(0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center border border-primary bg-foreground p-3 text-center">
                <Target className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs text-background/80">Budget score</span>
                <span className="font-black text-2xl text-primary">{budgetScore.toFixed(0)}/100</span>
              </div>
              <div className="flex flex-col items-center justify-center border border-background/40 bg-foreground p-3 text-center">
                <Receipt className="mb-1 h-6 w-6 text-background" />
                <span className="text-xs text-background/80">Transactions</span>
                <span className="text-2xl font-black text-background">{lastMonthExpenses.length}</span>
              </div>
            </div>

            <div className="mt-6 border border-background/40 bg-foreground p-4 text-center">
              <p className="mb-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">System insight</p>
              <p className="text-sm text-background/90">{totalEarned === 0 ? 'Add income records to unlock a savings insight.' : savedPercent >= 20 ? `Savings rate is ${savedPercent.toFixed(0)}%. You are above the 20% benchmark.` : `Savings rate is ${savedPercent.toFixed(0)}%. Review the largest category for the fastest improvement.`}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-background flex gap-4">
          <Button className="flex-1 gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share on Instagram
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

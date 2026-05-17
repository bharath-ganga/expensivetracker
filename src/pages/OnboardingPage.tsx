import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { IndianRupee, Calendar, Percent } from 'lucide-react';

export const OnboardingPage = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [salary, setSalary] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('1');
  const [savingsGoal, setSavingsGoal] = useState<number[]>([20]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    // In a full implementation, we'd upsert this to a 'profiles' table.
    // Since we don't have the table explicitly set up in Supabase SQL yet, 
    // we'll store it in user metadata via auth api to unblock the UI quickly
    // OR we can assume profiles table exists (as per the prompt).
    // Let's assume the profiles table exists.
    
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      monthly_salary: Number(salary),
      pay_date: Number(payDate),
      savings_goal_percent: savingsGoal[0],
      onboarding_complete: true,
      full_name: user.name
    });

    if (error) {
      toast.error('Failed to save settings. Make sure profiles table exists.');
      console.error(error);
    } else {
      // Update local store
      setUser({
        ...user,
        monthly_salary: Number(salary),
        pay_date: Number(payDate),
        savings_goal_percent: savingsGoal[0],
        onboarding_complete: true
      });
      toast.success('Budget plan created successfully!');
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const calculatedSavings = salary ? (Number(salary) * (savingsGoal[0] / 100)) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-lg shadow-xl border-slate-200 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-6 pt-10">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            👋 Welcome, {user?.name?.split(' ')[0] || 'Friend'}!
          </CardTitle>
          <CardDescription className="text-base mt-2 text-slate-500">
            Let's set up your monthly budget to get started.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-10 px-8">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="space-y-2">
              <Label className="text-base font-semibold text-slate-700">Monthly Salary / Income</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="number"
                  placeholder="50000"
                  className="pl-10 h-12 text-lg"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-slate-700">Pay Date (Day of the Month)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1"
                  className="pl-10 h-12 text-lg"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">When does your budget reset? (e.g. 1st of every month)</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <Percent className="h-4 w-4" /> Savings Goal
                </Label>
                <span className="font-bold text-primary text-lg">{savingsGoal[0]}%</span>
              </div>
              <Slider 
                value={savingsGoal} 
                onValueChange={setSavingsGoal} 
                max={50} 
                step={1} 
                className="py-4"
              />
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="text-sm font-medium text-slate-700 text-center">
                  You plan to save <span className="text-primary font-bold text-lg">₹{calculatedSavings.toFixed(0)}</span> per month.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg mt-4 font-semibold"
              disabled={isLoading || !salary}
            >
              {isLoading ? 'Saving...' : 'Let\'s Go →'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { Download, User as UserIcon, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { user, expenses, currency, setCurrency } = useStore();

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }

    const headers = ['Date,Description,Amount,Category,Currency\n'];
    const csvContent = expenses.map(e => 
      `${e.date},"${e.description}",${e.amount},${e.category_id || 'General'},${e.currency}`
    ).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fintracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV Exported Successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>
        <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name} className="bg-background/50 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email} disabled className="bg-background/30 border-white/5 text-muted-foreground" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your app experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h4>
              <div className="flex items-center justify-between bg-background/30 p-3 rounded-lg border border-white/5">
                <div>
                  <p className="font-medium text-sm">Budget Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when you reach 80% of budget.</p>
                </div>
                <div className="h-6 w-11 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/components/ThemeProvider';
import { Download, User as UserIcon, Bell, Shield, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { escapeCsvCell } from '@/lib/format';
import { Switch } from '@/components/ui/switch';

export const SettingsPage = () => {
  const { user, setUser, expenses, incomes, currency, setCurrency } = useStore();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [budgetAlerts, setBudgetAlerts] = useState(user?.budget_alerts_enabled ?? true);
  const [reminderNotifications, setReminderNotifications] = useState(user?.reminder_notifications_enabled ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setBudgetAlerts(user?.budget_alerts_enabled ?? true);
    setReminderNotifications(user?.reminder_notifications_enabled ?? true);
  }, [user]);

  const handleExportCSV = () => {
    if (expenses.length === 0 && incomes.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const rows = [
      ...expenses.map(item => [item.date, 'Expense', item.description, item.amount, item.category_id || 'General', item.currency]),
      ...incomes.map(item => [item.date, 'Income', item.source, item.amount, item.category_id || 'Income', item.currency]),
    ].sort((a, b) => String(b[0]).localeCompare(String(a[0])));
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Category', 'Currency'].map(escapeCsvCell).join(',');
    const csvContent = rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');

    const blob = new Blob([`${headers}\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fintracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV Exported Successfully!');
  };

  const handleExportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exported_at: new Date().toISOString(), expenses, incomes }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `finflow_export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveSettings = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    const [{ error: profileError }, { error: authError }] = await Promise.all([
      supabase.from('profiles').upsert({
        id: user.id,
        full_name: name.trim(),
        default_currency: currency,
        budget_alerts_enabled: budgetAlerts,
        reminder_notifications_enabled: reminderNotifications,
      }),
      supabase.auth.updateUser({ data: { full_name: name.trim() } }),
    ]);
    setSaving(false);
    const error = profileError || authError;
    if (error) return toast.error(error.message);
    setUser({ ...user, name: name.trim(), default_currency: currency as typeof user.default_currency, budget_alerts_enabled: budgetAlerts, reminder_notifications_enabled: reminderNotifications });
    toast.success('Settings saved.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={handleExportJson}><Download /> JSON</Button><Button onClick={handleExportCSV}><Download /> CSV</Button></div>
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
              <Input value={name} onChange={event => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email} disabled className="border-2 border-input bg-secondary text-muted-foreground" />
            </div>
            <Button className="w-full" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
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
              <Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> App Theme</Label>
              <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                <SelectTrigger className="border-2 border-input bg-background">
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent className="glass border-2 border-foreground">
                  <SelectItem value="light">☀️ Light Mode</SelectItem>
                  <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                  <SelectItem value="amoled">⚫ AMOLED Mode (Pure Black)</SelectItem>
                  <SelectItem value="system">💻 System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 border-t-2 border-border pt-2">
              <Label>Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="border-2 border-input bg-background">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="glass border-2 border-foreground">
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 border-t-2 border-border pt-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h4>
              <div className="flex items-center justify-between border border-border bg-secondary p-3">
                <div>
                  <p className="font-medium text-sm">Budget Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when you reach 80% of budget.</p>
                </div>
                <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} aria-label="Budget alerts" />
              </div>
              <div className="flex items-center justify-between bg-background p-3 border border-border"><div><p className="font-medium text-sm">Bill Reminders</p><p className="text-xs text-muted-foreground">Enable reminder notification preferences.</p></div><Switch checked={reminderNotifications} onCheckedChange={setReminderNotifications} aria-label="Bill reminder notifications" /></div>
              <Button className="w-full" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

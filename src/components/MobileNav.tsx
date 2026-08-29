import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Bell, Calendar, CreditCard, LayoutDashboard, LogOut, Menu, Receipt, Settings, ShoppingBag, Target, TrendingUp, Users, Wallet, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budgets', path: '/budgets', icon: Wallet },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Debts', path: '/debts', icon: CreditCard },
  { name: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'Wishlist', path: '/wishlist', icon: ShoppingBag },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Reminders', path: '/reminders', icon: Bell },
  { name: 'Split Expense', path: '/split', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = useStore(state => state.user);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-card px-4 flex items-center justify-between lg:hidden">
        <Link to="/" className="font-mono text-xl font-bold uppercase">Fin<span className="text-primary">/Flow</span></Link>
        <button className="h-10 w-10 grid place-items-center border border-border bg-background" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button>
      </header>
      {open && <div className="fixed inset-0 z-[70] bg-foreground/50 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 right-0 z-[80] w-[min(86vw,340px)] bg-card border-l border-border transition-transform lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!open}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border"><span className="eyebrow">NAVIGATION</span><button className="h-9 w-9 grid place-items-center border border-border" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div>
        <nav className="p-3 grid gap-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map(item => { const Icon = item.icon; const active = location.pathname === item.path; return <Link key={item.path} to={item.path} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 border ${active ? 'bg-primary text-primary-foreground border-foreground' : 'border-transparent hover:border-border hover:bg-secondary'}`}><Icon className="h-5 w-5" /><span className="font-medium">{item.name}</span></Link>; })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 border-t border-border p-4 bg-card"><p className="font-semibold truncate">{user?.name}</p><p className="text-xs text-muted-foreground truncate mb-3">{user?.email}</p><button className="flex items-center gap-2 text-destructive font-mono text-xs uppercase" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" /> Sign out</button></div>
      </aside>
    </>
  );
};

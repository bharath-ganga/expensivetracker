import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Calendar,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Target,
  Bell,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { AddExpenseModal } from './AddExpenseModal';

export const Sidebar = () => {
  const location = useLocation();
  const user = useStore(state => state.user);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 hidden flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-20 items-center border-b border-border px-5">
        <Link to="/" className="flex items-center gap-3 font-black tracking-wide text-2xl hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center h-10 w-10 bg-primary border border-foreground">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-mono font-bold tracking-[-0.06em] text-foreground flex items-center uppercase">
            Fin<span className="text-primary">/Flow</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6 px-4 flex flex-col gap-2">
        <div className="mb-4">
          <AddExpenseModal />
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 border-l-4 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wide transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border border-foreground'
                    : 'text-muted-foreground border border-transparent hover:border-border hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground opacity-70'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-secondary border border-border">
          <div className="h-10 w-10 bg-foreground text-background flex items-center justify-center font-mono font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 border-l-4 border-transparent px-4 py-3 font-mono text-xs font-bold uppercase tracking-wide text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

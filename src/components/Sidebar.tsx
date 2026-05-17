import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus
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
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 hidden flex-col glass border-r border-white/10 dark:border-white/5 lg:flex">
      <div className="flex h-20 items-center justify-center border-b border-white/10 dark:border-white/5 px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg shadow-primary/20">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-gradient">FinTracker</span>
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/15 text-primary shadow-[inset_0px_0px_20px_rgba(255,255,255,0.05)]' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground opacity-70'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 dark:border-white/5 p-4">
        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl bg-secondary/30 border border-white/5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center text-white font-bold shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

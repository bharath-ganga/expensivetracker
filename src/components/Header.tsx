
import { LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/auth';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center">
                Fin<span className="text-emerald-500 font-light">Flow</span>
              </h1>
              <p className="text-xs text-muted-foreground">Smart financial management</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">Welcome, {user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

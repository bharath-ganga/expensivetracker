import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Sidebar } from './Sidebar';
import { QuickAddWidget } from './QuickAddWidget';

export const Layout = () => {
  const { user, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileAndSetUser = async (sessionUser: any) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle();
      
    setUser({
      id: sessionUser.id,
      name: sessionUser.user_metadata.name || sessionUser.email?.split('@')[0] || 'User',
      email: sessionUser.email || '',
      monthly_salary: profile?.monthly_salary,
      pay_date: profile?.pay_date,
      savings_goal_percent: profile?.savings_goal_percent,
      onboarding_complete: profile?.onboarding_complete
    });
    setIsLoading(false);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfileAndSetUser(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfileAndSetUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col lg:pl-64 min-h-screen">
        {/* Mobile Header would go here */}
        <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
      <QuickAddWidget />
    </div>
  );
};

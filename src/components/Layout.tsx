import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Sidebar } from './Sidebar';
import { QuickAddWidget } from './QuickAddWidget';
import { useFinanceData } from '@/hooks/use-finance-data';
import { MobileNav } from '@/components/MobileNav';

export const Layout = () => {
  const { user, setUser, setCurrency, financeError } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  useFinanceData(user?.id);

  const fetchProfileAndSetUser = useCallback(async (sessionUser: SupabaseUser) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (error) {
      console.error('Unable to load profile:', error.message);
    }

    const metadataName = sessionUser.user_metadata.full_name || sessionUser.user_metadata.name;
    const fallbackName = metadataName || sessionUser.email?.split('@')[0] || 'User';

    if (!profile && !error) {
      await supabase.from('profiles').upsert({
        id: sessionUser.id,
        full_name: fallbackName,
      });
    }
      
    setUser({
      id: sessionUser.id,
      name: profile?.full_name || fallbackName,
      email: sessionUser.email || '',
      avatar_url: profile?.avatar_url || sessionUser.user_metadata.avatar_url,
      monthly_salary: profile?.monthly_salary,
      pay_date: profile?.pay_date,
      savings_goal_percent: profile?.savings_goal_percent,
      onboarding_complete: profile?.onboarding_complete ?? false,
      default_currency: profile?.default_currency || 'INR',
      budget_alerts_enabled: profile?.budget_alerts_enabled ?? true,
      reminder_notifications_enabled: profile?.reminder_notifications_enabled ?? true,
    });
    setCurrency(profile?.default_currency || 'INR');
    setIsLoading(false);
  }, [setCurrency, setUser]);

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
  }, [fetchProfileAndSetUser, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin border-4 border-foreground border-t-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.onboarding_complete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.onboarding_complete && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col lg:pl-64 min-h-screen">
        <MobileNav />
        <main className="flex-1 p-4 pb-24 md:p-8 lg:p-10 animate-in fade-in duration-500">
          {financeError && (
            <div role="alert" className="mb-6 border border-destructive bg-destructive text-destructive-foreground p-3 font-mono text-xs">
              DATA_SYNC_ERROR: {financeError}
            </div>
          )}
          <Outlet />
        </main>
      </div>
      <QuickAddWidget />
    </div>
  );
};

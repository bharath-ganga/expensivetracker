import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { AuthPage } from "@/pages/AuthPage";
import { UpdatePasswordPage } from "@/pages/UpdatePasswordPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { BudgetsPage } from "@/pages/BudgetsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { DebtsPage } from "@/pages/DebtsPage";
import { InvestmentsPage } from "@/pages/InvestmentsPage";
import { WishlistPage } from "@/pages/WishlistPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { RemindersPage } from "@/pages/RemindersPage";
import { SplitExpensesPage } from "@/pages/SplitExpensesPage";
import NotFound from "@/pages/NotFound";
import { hasInitialPasswordRecoveryUrl, supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const PasswordRecoveryRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (hasInitialPasswordRecoveryUrl) {
      navigate('/auth/update-password', { replace: true });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/auth/update-password', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="fintracker-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="system" />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <PasswordRecoveryRedirect />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/investments" element={<InvestmentsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/split" element={<SplitExpensesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

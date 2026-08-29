import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Eye, EyeOff, Loader2, BarChart3, ShieldCheck, Terminal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export const AuthPage = () => {
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill all required fields");
    }

    setIsLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setIsLoading(false);
        return toast.error("Passwords do not match");
      }
      if (!name) {
        setIsLoading(false);
        return toast.error("Name is required for sign up");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        toast.success("Account created successfully!");
        navigate('/onboarding', { replace: true });
      } else {
        toast.success("Account created. Check your email to verify your address, then sign in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed in successfully!");
        navigate('/', { replace: true });
      }
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return toast.error("Please enter your email first to reset password");
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent!");
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-background p-4 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl border-2 border-foreground bg-card shadow-[10px_10px_0_hsl(var(--foreground))] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between border-r-2 border-foreground bg-primary p-10 text-primary-foreground lg:flex">
          <div>
            <div className="mb-16 flex items-center gap-3 font-mono text-sm font-bold uppercase tracking-[0.18em]">
              <span className="grid h-10 w-10 place-items-center border-2 border-current bg-foreground text-primary"><Terminal /></span>
              Finance control system
            </div>
            <p className="eyebrow mb-4">// PERSONAL LEDGER OS</p>
            <h1 className="max-w-xl text-6xl font-black leading-[0.95] tracking-[-0.05em]">Every rupee.<br />One clear signal.</h1>
            <p className="mt-7 max-w-lg border-l-4 border-current pl-5 text-lg font-medium">Track cashflow, expose spending patterns, and turn financial decisions into measurable systems.</p>
          </div>
          <div className="grid grid-cols-2 border-2 border-current bg-foreground text-background">
            <div className="border-r-2 border-primary p-5"><BarChart3 className="mb-5 h-7 w-7 text-primary" /><p className="font-mono text-xs uppercase tracking-widest">Realtime analytics</p></div>
            <div className="p-5"><ShieldCheck className="mb-5 h-7 w-7 text-primary" /><p className="font-mono text-xs uppercase tracking-widest">Private by design</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-10">
      <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader className="px-0 pb-8 pt-0 text-left">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center border-2 border-foreground bg-primary text-primary-foreground"><Wallet className="h-6 w-6" /></span>
            <span className="font-mono text-sm font-bold uppercase tracking-widest">SpendSmart</span>
          </div>
          <p className="eyebrow mb-3 text-primary">AUTH / SECURE ACCESS</p>
          <CardTitle className="text-4xl font-black tracking-[-0.04em] text-foreground">{isSignUp ? 'Create your account' : 'Welcome back'}</CardTitle>
          <CardDescription className="mt-3 text-base text-muted-foreground">
            {isSignUp ? 'Initialize your personal finance workspace.' : 'Sign in to continue to your finance command center.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-0 pb-8">
          <div className="space-y-6">
            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="h-12 w-full border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0_hsl(var(--foreground))] hover:bg-secondary"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="font-mono text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? "Create account" : "Sign in")}
              </Button>
            </form>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t-2 border-border bg-secondary px-4 py-5">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-primary hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </CardFooter>
      </Card>
        </section>
      </div>
    </main>
  );
};

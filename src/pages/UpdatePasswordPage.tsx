import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RecoveryState = 'loading' | 'ready' | 'invalid';

export const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('loading');
  const [recoveryError, setRecoveryError] = useState('');

  useEffect(() => {
    let mounted = true;
    let resolved = false;
    let fallbackTimer: number | undefined;

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
    const urlError = url.searchParams.get('error_description') || hashParams.get('error_description');
    const hasRecoveryPayload = url.searchParams.has('code')
      || hashParams.has('access_token')
      || hashParams.get('type') === 'recovery';

    const cleanRecoveryUrl = () => {
      const cleanUrl = new URL(window.location.href);
      ['code', 'error', 'error_code', 'error_description', 'type'].forEach(param => cleanUrl.searchParams.delete(param));
      cleanUrl.hash = '';
      window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}`);
    };

    const markReady = () => {
      if (!mounted) return;
      resolved = true;
      setRecoveryError('');
      setRecoveryState('ready');
      cleanRecoveryUrl();
    };

    const markInvalid = (message?: string) => {
      if (!mounted || resolved) return;
      resolved = true;
      setRecoveryError(message || 'This recovery link is invalid or has expired.');
      setRecoveryState('invalid');
      cleanRecoveryUrl();
    };

    if (urlError) {
      markInvalid(urlError);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY' || session) {
        markReady();
      } else if (event === 'INITIAL_SESSION' && !hasRecoveryPayload) {
        markInvalid();
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted || resolved) return;

      if (data.session) {
        markReady();
        return;
      }

      if (error) {
        markInvalid(error.message);
        return;
      }

      // URL token detection can finish just after the first session read.
      fallbackTimer = window.setTimeout(async () => {
        const { data: retryData, error: retryError } = await supabase.auth.getSession();
        if (!mounted || resolved) return;
        if (retryData.session) markReady();
        else markInvalid(retryError?.message);
      }, 1500);
    });

    return () => {
      mounted = false;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsLoading(false);
      toast.error(error.message);
      return;
    }

    await supabase.auth.signOut();
    toast.success('Password updated successfully. Sign in with your new password.');
    navigate('/auth', { replace: true });
  };

  if (recoveryState === 'loading') {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <Card className="w-full max-w-md border-t-4 border-t-primary">
        <CardHeader>
          <div className="h-11 w-11 grid place-items-center bg-primary text-primary-foreground border border-foreground mb-4">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            {recoveryState === 'ready'
              ? 'Choose a secure password for your account.'
              : 'This recovery link cannot be used. Request a new one from the sign-in page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recoveryState === 'ready' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm password</Label>
                <Input id="confirm-new-password" type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{recoveryError || 'The link may have expired or already been used.'}</p>
              </div>
              <Button className="w-full" onClick={() => navigate('/auth', { replace: true })}>Request another reset link</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

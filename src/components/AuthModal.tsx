import { useState } from 'react';
import { X, Lock, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signUpWithUsernamePassword, signInWithUsernamePassword } from '../lib/customAuth';

/**
 * Username/password authentication modal.
 * Supports both sign-up and sign-in flows with validation.
 */
export default function AuthModal() {
  const { authModalOpen, closeAuthModal, signIn, profile, signOut } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim().toLowerCase();

    // Validation
    if (trimmedUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters');
      setStatus('error');
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(trimmedUsername)) {
      setErrorMsg('Username can only contain letters, numbers, underscores, and hyphens');
      setStatus('error');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setStatus('error');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMsg('');

      let result;
      if (mode === 'signup') {
        result = await signUpWithUsernamePassword(trimmedUsername, password, displayName || undefined);
      } else {
        result = await signInWithUsernamePassword(trimmedUsername, password);
      }

      if (result.error) {
        setErrorMsg(result.error);
        setStatus('error');
        return;
      }

      // Success
      setStatus('success');
      setTimeout(() => {
        // Reload page to refresh auth state
        window.location.reload();
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const signedIn = Boolean(profile?.name && !profile?.isGuest);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-primary-900/70 backdrop-blur-sm"
        onClick={closeAuthModal}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <button
          onClick={closeAuthModal}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={12} className="text-primary-600" />
        </button>

        <div className="p-6">
          {signedIn ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <h2 className="font-heading text-lg font-bold text-primary-900 mb-0.5">
                Signed in
              </h2>
              <p className="font-body text-xs text-primary-500 mb-4">
                Reading as{' '}
                <span className="font-semibold">@{profile?.name}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={closeAuthModal}
                  className="flex-1 font-body text-xs font-semibold py-2.5 rounded-lg bg-primary-900 text-white hover:bg-primary-800"
                >
                  Back to books
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    closeAuthModal();
                  }}
                  className="flex-1 font-body text-xs font-semibold py-2.5 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center mb-3">
                <Lock size={18} className="text-accent-600" />
              </div>
              <h2 className="font-heading text-lg font-bold text-primary-900 mb-0.5">
                {mode === 'signin' ? 'Sign in to Book Bingo' : 'Create your account'}
              </h2>
              <p className="font-body text-xs text-primary-500 mb-4 leading-snug">
                {mode === 'signin'
                  ? 'Enter your username and password to continue'
                  : 'Set up a username and password to get started'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Username */}
                <label className="block">
                  <span className="font-body text-[10px] font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <User size={11} />
                    Username
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="john_reader"
                    className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
                    disabled={status === 'loading' || status === 'success'}
                    autoComplete="username"
                  />
                  <span className="font-body text-[9px] text-primary-400 mt-0.5 block">
                    3+ characters, letters, numbers, - and _
                  </span>
                </label>

                {/* Display Name (signup only) */}
                {mode === 'signup' && (
                  <label className="block">
                    <span className="font-body text-[10px] font-semibold text-primary-600 uppercase tracking-wider mb-1 block">
                      Display name (optional)
                    </span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jamie Reader"
                      className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
                      disabled={status === 'loading' || status === 'success'}
                    />
                  </label>
                )}

                {/* Password */}
                <label className="block">
                  <span className="font-body text-[10px] font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Lock size={11} />
                    Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
                    disabled={status === 'loading' || status === 'success'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <span className="font-body text-[9px] text-primary-400 mt-0.5 block">
                    6+ characters
                  </span>
                </label>

                {/* Confirm Password (signup only) */}
                {mode === 'signup' && (
                  <label className="block">
                    <span className="font-body text-[10px] font-semibold text-primary-600 uppercase tracking-wider mb-1 block">
                      Confirm password
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
                      disabled={status === 'loading' || status === 'success'}
                      autoComplete="new-password"
                    />
                  </label>
                )}

                {/* Success message */}
                {status === 'success' && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                    <p className="font-body text-xs text-emerald-800 flex items-start gap-1.5">
                      <CheckCircle2 size={14} className="mt-0.5 flex-none" />
                      {mode === 'signup'
                        ? 'Account created! Signing you in...'
                        : 'Signed in successfully!'}
                    </p>
                  </div>
                )}

                {/* Error message */}
                {errorMsg && status === 'error' && (
                  <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
                    <p className="font-body text-xs text-rose-800 flex items-start gap-1.5">
                      <AlertCircle size={14} className="mt-0.5 flex-none" />
                      {errorMsg}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full font-body font-semibold text-sm py-2.5 rounded-lg bg-primary-900 text-white hover:bg-primary-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 size={14} /> Success!
                    </>
                  ) : (
                    mode === 'signin' ? 'Sign in' : 'Create account'
                  )}
                </button>
              </form>

              {/* Mode toggle */}
              <div className="mt-4 text-center border-t border-primary-100 pt-4">
                <p className="font-body text-xs text-primary-600 mb-2">
                  {mode === 'signin'
                    ? "Don't have an account?"
                    : 'Already have an account?'}
                </p>
                <button
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrorMsg('');
                    setStatus('idle');
                  }}
                  className="font-body text-xs font-semibold text-accent-600 hover:text-accent-700"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in instead'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

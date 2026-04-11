import { useState } from 'react';
import { X, Lock, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signUpWithUsernamePassword, signInWithUsernamePassword } from '../lib/customAuth';

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

      setStatus('success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const signedIn = Boolean(profile?.name && !profile?.isGuest);

  const inputStyle = {
    background: 'rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.2)',
    color: '#fff',
    borderRadius: '0.5rem',
  };
  const inputFocusStyle = {
    outline: 'none',
    borderColor: 'rgba(167,139,250,0.5)',
    background: 'rgba(124,58,237,0.1)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(8,5,17,0.8)' }}
        onClick={closeAuthModal}
      />
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(29,16,56,0.98) 0%, rgba(15,11,26,0.99) 100%)',
          border: '1px solid rgba(124,58,237,0.25)',
          boxShadow: '0 24px 60px rgba(124,58,237,0.25)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)' }}
        />

        <button
          onClick={closeAuthModal}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
          aria-label="Close"
        >
          <X size={12} className="text-white/60" />
        </button>

        <div className="p-6">
          {signedIn ? (
            <>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <CheckCircle2 size={18} className="text-emerald-400" />
              </div>
              <h2 className="font-heading text-lg font-bold text-white mb-0.5">
                Signed in
              </h2>
              <p className="font-body text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Reading as{' '}
                <span className="font-semibold text-primary-400">@{profile?.name}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={closeAuthModal}
                  className="flex-1 font-body text-xs font-semibold py-2.5 rounded-lg text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                >
                  Back to books
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    closeAuthModal();
                  }}
                  className="flex-1 font-body text-xs font-semibold py-2.5 rounded-lg transition-colors"
                  style={{
                    border: '1px solid rgba(124,58,237,0.25)',
                    color: 'rgba(255,255,255,0.6)',
                    background: 'transparent',
                  }}
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                <Lock size={18} className="text-primary-400" />
              </div>
              <h2 className="font-heading text-lg font-bold text-white mb-0.5">
                {mode === 'signin' ? 'Sign in to BookBingo' : 'Create your account'}
              </h2>
              <p className="font-body text-xs mb-5 leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {mode === 'signin'
                  ? 'Enter your username and password to continue'
                  : 'Set up a username and password to get started'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1" style={{ color: 'rgba(167,139,250,0.8)' }}>
                    <User size={11} />
                    Username
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="john_reader"
                    className="w-full px-3 py-2 text-sm placeholder:text-white/25"
                    style={inputStyle}
                    onFocus={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputFocusStyle)}
                    onBlur={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputStyle)}
                    disabled={status === 'loading' || status === 'success'}
                    autoComplete="username"
                  />
                  <span className="font-body text-[9px] mt-0.5 block" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    3+ characters, letters, numbers, - and _
                  </span>
                </label>

                {mode === 'signup' && (
                  <label className="block">
                    <span className="font-body text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'rgba(167,139,250,0.8)' }}>
                      Display name (optional)
                    </span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jamie Reader"
                      className="w-full px-3 py-2 text-sm placeholder:text-white/25"
                      style={inputStyle}
                      onFocus={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputFocusStyle)}
                      onBlur={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputStyle)}
                      disabled={status === 'loading' || status === 'success'}
                    />
                  </label>
                )}

                <label className="block">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1" style={{ color: 'rgba(167,139,250,0.8)' }}>
                    <Lock size={11} />
                    Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm placeholder:text-white/25"
                    style={inputStyle}
                    onFocus={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputFocusStyle)}
                    onBlur={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputStyle)}
                    disabled={status === 'loading' || status === 'success'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <span className="font-body text-[9px] mt-0.5 block" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    6+ characters
                  </span>
                </label>

                {mode === 'signup' && (
                  <label className="block">
                    <span className="font-body text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'rgba(167,139,250,0.8)' }}>
                      Confirm password
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm placeholder:text-white/25"
                      style={inputStyle}
                      onFocus={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputFocusStyle)}
                      onBlur={(e) => Object.assign((e.currentTarget as HTMLElement).style, inputStyle)}
                      disabled={status === 'loading' || status === 'success'}
                      autoComplete="new-password"
                    />
                  </label>
                )}

                {status === 'success' && (
                  <div
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                  >
                    <p className="font-body text-xs text-emerald-300 flex items-start gap-1.5">
                      <CheckCircle2 size={14} className="mt-0.5 flex-none" />
                      {mode === 'signup'
                        ? 'Account created! Signing you in...'
                        : 'Signed in successfully!'}
                    </p>
                  </div>
                )}

                {errorMsg && status === 'error' && (
                  <div
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <p className="font-body text-xs text-red-300 flex items-start gap-1.5">
                      <AlertCircle size={14} className="mt-0.5 flex-none" />
                      {errorMsg}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full font-body font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 mt-4 text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                  }}
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

              <div
                className="mt-4 text-center pt-4"
                style={{ borderTop: '1px solid rgba(124,58,237,0.15)' }}
              >
                <p className="font-body text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
                  className="font-body text-xs font-semibold text-primary-400 transition-colors hover:text-primary-300"
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

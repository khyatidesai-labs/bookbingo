import { useState } from 'react';
import { X, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Email-based sign in. When the user is currently browsing as an anonymous
 * guest, we upgrade that session in place via `updateUser({ email })` so
 * their saved books, bingo cards, and reading state all carry over with
 * the SAME auth.uid. Otherwise we fall back to the magic-link OTP flow.
 *
 * The copy shifts based on whether we're upgrading or creating — an
 * upgrade shows "confirm your email to finish", while a cold sign-in
 * shows "check your inbox for a magic link".
 */
export default function AuthModal() {
  const { authModalOpen, closeAuthModal, signIn, profile, signOut } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [wasUpgrade, setWasUpgrade] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      setErrorMsg('Please enter a valid email.');
      setStatus('error');
      return;
    }
    try {
      setStatus('sending');
      setErrorMsg('');
      const result = await signIn(trimmed, name.trim() || undefined);
      setWasUpgrade(result.upgraded);
      setStatus('sent');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed.';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const signedIn = Boolean(profile?.email);

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
                <span className="font-semibold">{profile?.name ?? profile?.email}</span>
                <br />
                <span className="text-primary-400">{profile?.email}</span>
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
                <Mail size={18} className="text-accent-600" />
              </div>
              <h2 className="font-heading text-lg font-bold text-primary-900 mb-0.5">
                Sign in to Book Bingo
              </h2>
              <p className="font-body text-xs text-primary-500 mb-4 leading-snug">
                One click to upgrade your guest session. Saved books, bingo
                cards and reading state all carry over.
              </p>

              <label className="block mb-3">
                <span className="font-body text-[10px] font-semibold text-primary-600 uppercase tracking-wider">
                  Display name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jamie Reader"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-primary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
                  disabled={status === 'sending' || status === 'sent'}
                />
              </label>

              <label className="block mb-4">
                <span className="font-body text-[10px] font-semibold text-primary-600 uppercase tracking-wider">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-primary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
                  disabled={status === 'sending' || status === 'sent'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSend();
                  }}
                />
              </label>

              {status === 'sent' ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 mb-3">
                  <p className="font-body text-xs text-emerald-800 flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 size={14} className="mt-0.5 flex-none" />
                    {wasUpgrade
                      ? 'Check your inbox and click the confirmation link. Your session stays linked — no re-signup needed.'
                      : "Check your inbox for a magic link. Clicking it will sign you in."}
                  </p>
                </div>
              ) : null}

              {errorMsg && status === 'error' ? (
                <p className="font-body text-xs text-rose-600 mb-3">{errorMsg}</p>
              ) : null}

              <button
                onClick={handleSend}
                disabled={status === 'sending' || status === 'sent'}
                className="w-full font-body font-semibold text-sm py-2.5 rounded-lg bg-primary-900 text-white hover:bg-primary-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending…
                  </>
                ) : status === 'sent' ? (
                  'Link sent'
                ) : (
                  'Send magic link'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

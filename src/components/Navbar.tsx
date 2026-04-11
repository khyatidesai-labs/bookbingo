import { useState, useEffect } from 'react';
import { Menu, X, Bookmark, LogIn, BookMarked } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openSavedDrawer, savedBooks, openAuthModal, profile, unreadCount } = useApp();
  const isSignedIn = Boolean(profile?.email);
  const initial = (profile?.name ?? profile?.email ?? 'R').slice(0, 1).toUpperCase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Shelf', id: 'shelf' },
    { label: 'Trending', id: 'trending' },
    { label: 'Discover', id: 'discover' },
    { label: 'Bingo', id: 'bingo' },
    { label: 'Community', id: 'community' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-primary-900/98 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-6 flex items-center justify-between h-16">

        {/* Logo — bold editorial mark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg shadow-accent-700/40 group-hover:shadow-accent-600/60 transition-shadow duration-300">
              <BookMarked size={17} className="text-white" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-bold text-lg tracking-tight text-white leading-none">
              Book<span className="text-accent-400">Bingo</span>
            </span>
            <span className="font-body text-[9px] text-white/40 tracking-[0.2em] uppercase font-medium mt-0.5">
              Read Together
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/8">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-[11px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 text-white/60 hover:text-white hover:bg-white/10"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right cluster */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={openSavedDrawer}
            className="relative font-body text-[11px] font-medium transition-all duration-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
            aria-label="My reading list"
          >
            <Bookmark size={12} />
            My List
            {savedBooks.length > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0 rounded-full min-w-[18px] text-center bg-accent-500 text-white">
                {savedBooks.length}
              </span>
            )}
          </button>

          {isSignedIn ? (
            <button
              onClick={openAuthModal}
              className="relative flex items-center gap-1.5"
              aria-label="Account"
            >
              <span className="relative">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-700 text-white text-xs font-bold flex items-center justify-center ring-2 ring-accent-400/30 shadow-lg shadow-accent-700/30">
                  {initial}
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-primary-900" />
                )}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="font-body text-[11px] font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
            >
              <LogIn size={11} />
              Sign in
            </button>
          )}

          <button
            onClick={() => scrollTo('bingo')}
            className="font-body text-[11px] font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-lg shadow-accent-700/40 hover:shadow-accent-600/60 flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #E8820C 50%, #C2610A 100%)',
              color: 'white',
            }}
          >
            <span className="text-xs">✦</span>
            Start Bingo
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/80 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-900/98 backdrop-blur-xl border-t border-white/8 px-6 py-5 flex flex-col gap-3">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-sm font-medium text-white/70 text-left hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { openSavedDrawer(); setMenuOpen(false); }}
            className="font-body text-sm font-medium text-white/70 text-left hover:text-white flex items-center gap-2"
          >
            <Bookmark size={13} />
            My List ({savedBooks.length})
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </button>
          <button
            onClick={() => { openAuthModal(); setMenuOpen(false); }}
            className="font-body text-sm font-medium text-white/70 text-left hover:text-white flex items-center gap-2"
          >
            <LogIn size={13} />
            {isSignedIn ? profile?.email : 'Sign in'}
          </button>
          <button
            onClick={() => scrollTo('bingo')}
            className="font-body text-sm font-bold px-5 py-2.5 rounded-full w-full text-white mt-1"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #E8820C 50%, #C2610A 100%)',
            }}
          >
            Start Bingo
          </button>
        </div>
      )}
    </nav>
  );
}

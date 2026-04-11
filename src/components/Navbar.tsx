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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl' : 'bg-transparent'}`}
      style={scrolled ? {
        background: 'rgba(15, 11, 26, 0.95)',
        borderBottom: '1px solid rgba(124, 58, 237, 0.25)',
        boxShadow: '0 4px 30px rgba(124, 58, 237, 0.15)',
      } : undefined}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-6 flex items-center justify-between h-16">

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', boxShadow: '0 4px 15px rgba(124,58,237,0.5)' }}
            >
              <BookMarked size={17} className="text-white" />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-bold text-xl tracking-tight text-white leading-none">
              Book<span className="text-gradient-purple">Bingo</span>
            </span>
            <span className="font-body text-[9px] text-white/35 tracking-[0.2em] uppercase font-medium mt-0.5">
              Read Together
            </span>
          </div>
        </button>

        <div
          className="hidden md:flex items-center gap-0.5 rounded-full px-2 py-1.5"
          style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)' }}
        >
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-[11px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 text-white/55 hover:text-white hover:bg-white/10"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={openSavedDrawer}
            className="relative font-body text-[11px] font-medium transition-all duration-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-white/55 hover:text-white hover:bg-white/8"
            style={{ border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <Bookmark size={12} />
            My List
            {savedBooks.length > 0 && (
              <span
                className="text-[9px] font-bold px-1.5 py-0 rounded-full min-w-[18px] text-center text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
              >
                {savedBooks.length}
              </span>
            )}
          </button>

          {isSignedIn ? (
            <button onClick={openAuthModal} className="relative">
              <span
                className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center ring-2 ring-primary-600/40"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}
              >
                {initial}
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-pink border-2 border-[#0F0B1A]" />
              )}
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="font-body text-[11px] font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-white/55 hover:text-white hover:bg-white/8"
              style={{ border: '1px solid rgba(124,58,237,0.25)' }}
            >
              <LogIn size={11} />
              Sign in
            </button>
          )}

          <button
            onClick={() => scrollTo('bingo')}
            className="font-body text-[11px] font-bold px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 text-white"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              boxShadow: '0 4px 15px rgba(124,58,237,0.5)',
            }}
          >
            <span className="text-xs">✦</span>
            Start Bingo
          </button>
        </div>

        <button
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden backdrop-blur-xl px-6 py-5 flex flex-col gap-3"
          style={{ background: 'rgba(15, 11, 26, 0.97)', borderTop: '1px solid rgba(124,58,237,0.2)' }}
        >
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-sm font-medium text-white/60 text-left hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { openSavedDrawer(); setMenuOpen(false); }}
            className="font-body text-sm font-medium text-white/60 text-left hover:text-white flex items-center gap-2"
          >
            <Bookmark size={13} />
            My List ({savedBooks.length})
          </button>
          <button
            onClick={() => { openAuthModal(); setMenuOpen(false); }}
            className="font-body text-sm font-medium text-white/60 text-left hover:text-white flex items-center gap-2"
          >
            <LogIn size={13} />
            {isSignedIn ? profile?.name : 'Sign in'}
          </button>
          <button
            onClick={() => scrollTo('bingo')}
            className="font-body text-sm font-bold px-5 py-2.5 rounded-full w-full text-white mt-1"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
          >
            Start Bingo
          </button>
        </div>
      )}
    </nav>
  );
}

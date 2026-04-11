import { useState, useEffect } from 'react';
import { BookOpen, Menu, X, Bookmark, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Sticky glass navbar. On top of the hero it's transparent; once the user
 * scrolls past ~40px it collapses into a white blurred bar with a thin
 * bottom border. The right side differs for signed-in vs. guest users:
 *
 *   - Guest: "Sign in" button
 *   - Signed-in: circular avatar pill showing the user's first initial,
 *     with a red dot when there are unread recommendations
 */
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-sm border-b border-primary-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-accent-500 to-accent-700 rounded-md flex items-center justify-center shadow-sm">
            <BookOpen size={14} className="text-white" />
          </div>
          <span
            className={`font-heading font-bold text-base tracking-tight transition-colors duration-200 ${
              scrolled ? 'text-primary-900' : 'text-white'
            }`}
          >
            Book Bingo
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Shelf', id: 'shelf' },
            { label: 'Trending', id: 'trending' },
            { label: 'Discover', id: 'discover' },
            { label: 'Bingo', id: 'bingo' },
            { label: 'Community', id: 'community' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`font-body text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-200 ${
                scrolled
                  ? 'text-primary-600 hover:text-primary-900 hover:bg-primary-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right cluster */}
        <div className="hidden md:flex items-center gap-2">
          {/* My list button */}
          <button
            onClick={openSavedDrawer}
            className={`relative font-body text-xs font-medium transition-colors duration-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
              scrolled
                ? 'text-primary-600 hover:text-primary-900 hover:bg-primary-50'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            aria-label="My reading list"
          >
            <Bookmark size={13} />
            My List
            {savedBooks.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0 rounded-full min-w-[18px] text-center ${
                  scrolled ? 'bg-accent-500 text-white' : 'bg-white text-primary-900'
                }`}
              >
                {savedBooks.length}
              </span>
            )}
          </button>

          {/* Auth state */}
          {isSignedIn ? (
            <button
              onClick={openAuthModal}
              className="relative flex items-center gap-1.5"
              aria-label="Account"
            >
              <span className="relative">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white/80 shadow-sm">
                  {initial}
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white" />
                )}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className={`font-body text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                scrolled
                  ? 'bg-primary-900 text-white hover:bg-primary-800'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <LogIn size={12} />
              Sign in
            </button>
          )}

          <button
            onClick={() => scrollTo('bingo')}
            className="font-body text-xs font-semibold px-4 py-1.5 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors duration-200 shadow-sm"
          >
            Start Bingo
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X size={20} className={scrolled ? 'text-primary-900' : 'text-white'} />
          ) : (
            <Menu size={20} className={scrolled ? 'text-primary-900' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-primary-100 px-6 py-4 flex flex-col gap-3">
          {[
            { label: 'Shelf', id: 'shelf' },
            { label: 'Trending', id: 'trending' },
            { label: 'Discover', id: 'discover' },
            { label: 'Bingo', id: 'bingo' },
            { label: 'Community', id: 'community' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-sm font-medium text-primary-700 text-left hover:text-accent-500"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              openSavedDrawer();
              setMenuOpen(false);
            }}
            className="font-body text-sm font-medium text-primary-700 text-left hover:text-accent-500 flex items-center gap-2"
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
            onClick={() => {
              openAuthModal();
              setMenuOpen(false);
            }}
            className="font-body text-sm font-medium text-primary-700 text-left hover:text-accent-500 flex items-center gap-2"
          >
            <LogIn size={13} />
            {isSignedIn ? profile?.email : 'Sign in'}
          </button>
          <button
            onClick={() => scrollTo('bingo')}
            className="font-body text-sm font-semibold px-5 py-2.5 bg-accent-500 text-white rounded-full hover:bg-accent-600 w-full"
          >
            Start Bingo
          </button>
        </div>
      )}
    </nav>
  );
}

import { useEffect, useState } from 'react';
import { Flame, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BookCard from './BookCard';
import type { Book } from '../types';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/new-releases`;
const LS_KEY = 'bookbingo.newReleases';
const TTL_MS = 30 * 60 * 1000;

interface CachedReleases { books: Book[]; ts: number; }

function readCache(): Book[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { books, ts } = JSON.parse(raw) as CachedReleases;
    if (Date.now() - ts < TTL_MS) return books;
  } catch {}
  return null;
}

function writeCache(books: Book[]): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ books, ts: Date.now() })); } catch {}
}

async function fetchNewReleasesFromEdge(): Promise<Book[]> {
  const res = await fetch(EDGE_URL, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Edge function error: ${res.status}`);
  const data = await res.json();
  return (data.books ?? []) as Book[];
}

export default function NewLaunchesSection() {
  const { openBook, setDynamicBook } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadNewReleases = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = readCache();
      if (cached) { setBooks(cached); setLoading(false); return; }
    }
    setLoading(true);
    setError(false);
    try {
      const newBooks = await fetchNewReleasesFromEdge();
      writeCache(newBooks);
      setBooks(newBooks);
    } catch {
      const cached = readCache();
      if (cached) { setBooks(cached); } else { setError(true); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNewReleases();
    // Refresh from edge function every 30 minutes in the background.
    const interval = setInterval(() => void loadNewReleases(true), TTL_MS);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="new-launches"
      className="py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0B1A 0%, #1A1030 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-96 h-64 rounded-full blur-3xl opacity-[0.07]" style={{ background: 'radial-gradient(circle, #C084FC, transparent)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-primary-400" />
              <span className="font-body text-primary-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                Latest Releases
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              New Launches This Week
            </h2>
          </div>
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
          >
            <Sparkles size={12} className="text-primary-400" />
            <span className="font-body text-[10px] font-semibold text-white/55">Fresh from publishers</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] rounded-xl mb-2 shimmer-bg" style={{ border: '1px solid rgba(124,58,237,0.12)' }} />
                <div className="h-3 rounded shimmer-bg mb-1.5 w-3/4" />
                <div className="h-3 rounded shimmer-bg w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}
          >
            <p className="font-body text-white/45 mb-4">Could not load new releases.</p>
            <button
              onClick={() => void loadNewReleases(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                tag="New"
                onClick={() => { setDynamicBook(book); openBook(book.id); }}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}
          >
            <p className="font-body text-white/45 mb-4">No new releases found.</p>
            <button
              onClick={() => void loadNewReleases(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="font-body text-white/30 text-sm">
            Discover more in the{' '}
            <button
              onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
            >
              Browse section
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

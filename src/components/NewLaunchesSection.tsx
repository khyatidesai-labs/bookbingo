import { useEffect, useState } from 'react';
import { Flame, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BookCard from './BookCard';
import type { Book } from '../types';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/new-releases`;

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
  const { openBook } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadNewReleases = async () => {
    setLoading(true);
    setError(false);
    try {
      const newBooks = await fetchNewReleasesFromEdge();
      setBooks(newBooks);
    } catch (err) {
      console.error('Failed to load new releases:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewReleases();
    const interval = setInterval(loadNewReleases, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="new-launches" className="py-10 bg-gradient-to-br from-accent-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-accent-500" />
              <span className="font-body text-accent-500 text-[11px] font-semibold uppercase tracking-[0.2em]">
                Latest Releases
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-900">
              New Launches This Week
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-100">
            <Sparkles size={12} className="text-accent-600" />
            <span className="font-body text-[10px] font-semibold text-accent-600">
              Fresh from publishers
            </span>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-primary-100 rounded-xl aspect-[2/3] mb-3" />
                <div className="bg-primary-100 rounded h-3 mb-2 w-3/4" />
                <div className="bg-primary-100 rounded h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-primary-100">
            <p className="font-body text-primary-500 mb-4">
              Could not load new releases.
            </p>
            <button
              onClick={loadNewReleases}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 text-accent-700 text-sm font-semibold hover:bg-accent-200 transition-colors"
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
                onClick={() => openBook(book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-primary-100">
            <p className="font-body text-primary-500 mb-4">No new releases found.</p>
            <button
              onClick={loadNewReleases}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 text-accent-700 text-sm font-semibold hover:bg-accent-200 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <p className="font-body text-primary-500 text-sm">
            Discover more in the <a href="#discover" className="font-semibold text-accent-600 hover:text-accent-700">Browse section</a>
          </p>
        </div>
      </div>
    </section>
  );
}

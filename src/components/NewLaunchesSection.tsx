import { useEffect, useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchNewReleases } from '../lib/openLibraryService';
import BookCard from './BookCard';
import type { Book } from '../types';

/**
 * New Launches Section
 * Shows the latest books released, fetched from Open Library API
 * Updates weekly to show fresh releases
 */
export default function NewLaunchesSection() {
  const { openBook } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNewReleases = async () => {
      setLoading(true);
      const newBooks = await fetchNewReleases();
      setBooks(newBooks.slice(0, 10)); // Show top 10 new releases
      setLoading(false);
    };

    loadNewReleases();

    // Refresh every 24 hours
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
          <div className="text-center py-16">
            <p className="font-body text-primary-500">
              Fetching latest releases from Open Library...
            </p>
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
            <p className="font-body text-primary-500">
              Could not load new releases. Check your connection.
            </p>
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

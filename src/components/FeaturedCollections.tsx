import { useState, useEffect } from 'react';
import { ArrowRight, X, ArrowLeft, Loader2 } from 'lucide-react';
import type { Book } from '../types';
import { BOOKS } from '../data/books';
import { fetchBooksWithFallback } from '../lib/bookCache';

const collections = [
  {
    title: 'Shadows of Sicily',
    subtitle: 'Travel & Photography',
    description: 'Cobblestone streets, light, architecture, and quiet longing.',
    tags: ['Travel', 'Photography'],
    bookCount: 18,
    image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Design Thinking',
    subtitle: 'For Creatives & Builders',
    description: 'The systems behind beautiful, functional things.',
    tags: ['Design', 'Systems'],
    bookCount: 24,
    image: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Midnight Philosophy',
    subtitle: 'Late Night Thinkers',
    description: 'Questions that keep you up at night, answered.',
    tags: ['Philosophy', 'Essays'],
    bookCount: 31,
    image: 'https://images.pexels.com/photos/3646180/pexels-photo-3646180.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

// Correct matching logic - count books with exact genre/mood matches
function countBooksForCollection(collection: typeof collections[0]): number {
  return BOOKS.filter((book) => {
    // Check if book has ALL collection tags in its genres or moods
    const hasAllTags = collection.tags.every((tag) => {
      const tagLower = tag.toLowerCase();
      return (
        book.genres.some((g) => g.toLowerCase() === tagLower) ||
        book.moods?.some((m) => m.toLowerCase() === tagLower)
      );
    });
    return hasAllTags;
  }).length;
}

export default function FeaturedCollections() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewingBooks, setViewingBooks] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});
  const [brokenCovers, setBrokenCovers] = useState<Set<string>>(new Set());

  // Calculate matched counts for all collections
  useEffect(() => {
    const counts: Record<string, number> = {};

    collections.forEach((collection) => {
      counts[collection.title] = countBooksForCollection(collection);
    });

    setCollectionCounts(counts);
  }, []);

  // Calculate matched count when collection is selected
  useEffect(() => {
    if (!selectedCollection) return;

    const collection = collections.find((c) => c.title === selectedCollection);
    if (!collection) return;

    const localCount = collectionCounts[selectedCollection] || 0;
    // Fall back to the collection's bookCount when no local matches exist
    // (books will be fetched from OpenLibrary)
    setMatchedCount(localCount > 0 ? localCount : collection.bookCount);
  }, [selectedCollection, collectionCounts]);

  const loadBooks = async (collectionTitle: string) => {
    const collection = collections.find((c) => c.title === collectionTitle);
    if (!collection) return;

    setLoading(true);
    try {
      // First, try to get books from local database
      let matchedBooks = BOOKS.filter((book) => {
        const hasAllTags = collection.tags.every((tag) => {
          const tagLower = tag.toLowerCase();
          return (
            book.genres.some((g) => g.toLowerCase() === tagLower) ||
            book.moods?.some((m) => m.toLowerCase() === tagLower)
          );
        });
        return hasAllTags;
      });

      // If no local matches, fetch from Open Library with caching
      if (matchedBooks.length === 0) {
        const cacheKey = collectionTitle.toLowerCase().replace(/\s+/g, '-');
        const fetchedBooks = await fetchBooksWithFallback(collection.tags, cacheKey);
        matchedBooks = fetchedBooks;
      }

      const limited = matchedBooks.slice(0, collection.bookCount);
      setBrokenCovers(new Set());
      setBooks(limited);
      // Update matchedCount to reflect the actual number of books loaded
      setMatchedCount(limited.length);
      setViewingBooks(true);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm" onClick={() => {
            setSelectedCollection(null);
            setViewingBooks(false);
            setBooks([]);
          }} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                if (viewingBooks) {
                  setViewingBooks(false);
                  setBooks([]);
                } else {
                  setSelectedCollection(null);
                }
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors"
            >
              {viewingBooks ? <ArrowLeft size={14} className="text-primary-600" /> : <X size={14} className="text-primary-600" />}
            </button>

            {!viewingBooks && collections.find((c) => c.title === selectedCollection) && (
              <>
                <img
                  src={collections.find((c) => c.title === selectedCollection)!.image}
                  alt={selectedCollection}
                  className="w-full h-48 object-cover rounded-2xl mb-6"
                />
                <h2 className="font-heading text-2xl font-bold text-primary-900 mb-1">
                  {selectedCollection}
                </h2>
                <p className="font-body text-primary-500 text-sm mb-4">
                  {collections.find((c) => c.title === selectedCollection)!.subtitle}
                </p>
                <p className="font-body text-primary-700 text-sm mb-4">
                  {collections.find((c) => c.title === selectedCollection)!.description}
                </p>
                <div className="flex gap-2 flex-wrap mb-6">
                  {collections.find((c) => c.title === selectedCollection)!.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-body text-xs px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(124,58,237,0.15)',
                        border: '1px solid rgba(124,58,237,0.25)',
                        color: 'rgba(124,58,237,0.9)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => loadBooks(selectedCollection)}
                  disabled={loading}
                  className="w-full font-body font-semibold text-sm bg-primary-900 hover:bg-primary-800 disabled:bg-primary-300 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Explore ${matchedCount} Book${matchedCount === 1 ? '' : 's'}`
                  )}
                </button>
              </>
            )}

            {viewingBooks && (
              <>
                <h2 className="font-heading text-2xl font-bold text-primary-900 mb-1">
                  Books in {selectedCollection}
                </h2>
                <p className="font-body text-sm text-primary-500 mb-5">
                  {books.length} book{books.length === 1 ? '' : 's'}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {books.map((book) => (
                    <div key={book.id} className="group cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-primary-100">
                        {book.cover && !brokenCovers.has(book.id) ? (
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onLoad={(e) => {
                              // OpenLibrary returns 1px placeholder for missing covers
                              if ((e.currentTarget as HTMLImageElement).naturalHeight <= 1) {
                                setBrokenCovers((prev) => new Set([...prev, book.id]));
                              }
                            }}
                            onError={() => setBrokenCovers((prev) => new Set([...prev, book.id]))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                            <span className="text-3xl font-bold text-primary-300">
                              {book.title[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-primary-900 text-xs line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                      <p className="font-body text-[10px] text-primary-500">
                        {book.author}
                      </p>
                    </div>
                  ))}
                </div>
                {books.length === 0 && !loading && (
                  <p className="text-center text-primary-500 py-8">
                    No books found for this collection.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <section
        className="py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0F0B1A 0%, #1A1030 100%)' }}
      >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-2">
          <div>
            <span className="font-body text-primary-400 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Editorial Picks
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mt-0.5">
              Curated Collections
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <button
              key={col.title}
              onClick={() => setSelectedCollection(col.title)}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
              style={{
                border: '1px solid rgba(124,58,237,0.18)',
                background: 'rgba(29,16,56,0.6)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1030]/90 via-[#1A1030]/30 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="font-body text-[9px] font-semibold text-white/60 uppercase tracking-wider mb-0.5">
                    {col.subtitle}
                  </p>
                  <h3 className="font-heading text-sm font-bold text-white leading-tight line-clamp-1">
                    {col.title}
                  </h3>
                </div>
              </div>

              <div className="p-3.5">
                <p className="font-body text-[11px] leading-snug line-clamp-2 mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {col.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {col.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body text-[9px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.25)',
                          color: 'rgba(167,139,250,0.9)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 font-body text-[10px] font-semibold text-primary-400 group-hover:text-primary-300 transition-colors">
                    {(collectionCounts[col.title] || col.bookCount)}
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}

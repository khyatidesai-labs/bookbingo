import { TrendingUp, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const TTL_MS = 30 * 60 * 1000;

function trendingCacheKey(profession?: string, moods?: string[]): string {
  return `bookbingo.trending.${profession ?? ''}.${(moods ?? []).slice().sort().join(',')}`;
}

function readTrendingCache(key: string): import('../types').Book[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { books, ts } = JSON.parse(raw) as { books: import('../types').Book[]; ts: number };
    if (Date.now() - ts < TTL_MS) return books;
  } catch {}
  return null;
}

function writeTrendingCache(key: string, books: import('../types').Book[]): void {
  try { localStorage.setItem(key, JSON.stringify({ books, ts: Date.now() })); } catch {}
}
import { PROFESSION_BY_ID } from '../data/professions';
import { MOOD_BY_ID } from '../data/moods';
import BookCard from './BookCard';
import type { Book } from '../types';

export default function TrendingNow() {
  const {
    selectedProfession,
    selectedMoods,
    setProfession,
    toggleMood,
    clearFilters,
    openBook,
    setDynamicBook,
  } = useApp();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleBooks, setVisibleBooks] = useState<Book[]>([]);
  const [filtering, setFiltering] = useState(false);

  const hasFilters = Boolean(selectedProfession || selectedMoods.length);
  const activeProfession = selectedProfession ? PROFESSION_BY_ID[selectedProfession] : null;

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = trendingCacheKey(selectedProfession, selectedMoods);

    // Serve from cache first so the UI feels instant.
    const cached = readTrendingCache(cacheKey);
    if (cached) {
      setBooks(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const loadBooks = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

        const body: Record<string, unknown> = {};
        if (selectedProfession) body.profession = selectedProfession;
        if (selectedMoods.length > 0) body.moods = selectedMoods;

        const res = await fetch(`${supabaseUrl}/functions/v1/trending-books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!controller.signal.aborted) {
          const freshBooks = data.books ?? [];
          writeTrendingCache(cacheKey, freshBooks);
          setBooks(freshBooks);
        }
      } catch {
        // Cache already served (if available); don't wipe it on error.
        if (!controller.signal.aborted && !cached) setBooks([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    // Only hit the edge function if cache is missing or stale.
    if (!cached) void loadBooks();
    // Background refresh after TTL.
    const timer = setTimeout(() => { if (!controller.signal.aborted) void loadBooks(); }, TTL_MS);

    return () => { controller.abort(); clearTimeout(timer); };
  }, [selectedProfession, selectedMoods]);

  useEffect(() => {
    if (books.length === 0) {
      setVisibleBooks([]);
      setFiltering(false);
      return;
    }
    setFiltering(true);
    const promises = books.map(
      (book) =>
        new Promise<boolean>((resolve) => {
          if (!book.cover || book.cover.includes('picsum.photos')) {
            resolve(false);
            return;
          }
          const img = new Image();
          img.onload = () => resolve(img.naturalHeight > 1);
          img.onerror = () => resolve(false);
          img.src = book.cover;
        }),
    );
    Promise.all(promises).then((results) => {
      setVisibleBooks(books.filter((_, i) => results[i]));
      setFiltering(false);
    });
  }, [books]);

  return (
    <section
      id="trending"
      className="py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0B1A 0%, #1A1030 50%, #0F0B1A 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-[0.07]" style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {hasFilters ? <Sparkles size={13} className="text-primary-400" /> : <TrendingUp size={13} className="text-primary-400" />}
              <span className="font-body text-primary-400 text-[10px] font-semibold uppercase tracking-[0.2em]">
                {hasFilters ? 'Matched for you' : 'Right now'}
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight">
              {hasFilters ? 'Your recommendations' : 'Trending this week'}
            </h2>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeProfession && (
                <button
                  onClick={() => setProfession(undefined)}
                  className="group font-body text-[11px] font-medium pl-2 pr-1.5 py-1 rounded-full flex items-center gap-1.5 text-white transition-all"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)' }}
                >
                  <span>{activeProfession.icon}</span>
                  {activeProfession.name}
                  <X size={10} className="text-white/50 group-hover:text-white" />
                </button>
              )}
              {selectedMoods.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMood(m)}
                  className="group font-body text-[11px] font-medium pl-2 pr-1.5 py-1 rounded-full flex items-center gap-1.5 text-white transition-all"
                  style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.35)' }}
                >
                  {MOOD_BY_ID[m].title}
                  <X size={10} className="text-white/50 group-hover:text-white" />
                </button>
              ))}
              <button
                onClick={clearFilters}
                className="font-body text-[11px] font-semibold text-white/35 hover:text-white px-2 py-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {(loading || filtering) ? (
          <div className="flex gap-4 pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-none w-36">
                <div className="aspect-[2/3] rounded-xl mb-2 shimmer-bg" style={{ border: '1px solid rgba(124,58,237,0.12)' }} />
                <div className="h-3 rounded shimmer-bg mb-1.5 w-3/4" />
                <div className="h-3 rounded shimmer-bg w-1/2" />
              </div>
            ))}
          </div>
        ) : visibleBooks.length === 0 ? (
          <div
            className="text-center py-14 rounded-2xl"
            style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}
          >
            <p className="font-heading font-semibold text-white/60 text-sm">No matches for that combination.</p>
            <p className="font-body text-white/35 text-xs mt-1">Try removing a mood or switching profession.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {visibleBooks.slice(0, 7).map((book) => (
              <div key={book.id} className="snap-start">
                <BookCard
                  book={book}
                  tag={hasFilters ? 'For you' : 'Trending'}
                  onClick={() => { setDynamicBook(book); openBook(book.id); }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

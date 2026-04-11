import { useState, useEffect } from 'react';
import { Compass, Briefcase, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { PROFESSIONS } from '../data/professions';
import { MOODS } from '../data/moods';
import { CHALLENGE_BY_ID } from '../data/bingoChallenges';
import BookCard from './BookCard';
import type { Book } from '../types';

type Tab = 'profession' | 'mood' | 'challenge';

const PROFESSION_IMAGES: Record<string, string> = {
  designer: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=400',
  developer: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
  entrepreneur: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
  lawyer: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=400',
  doctor: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400',
  educator: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400',
  scientist: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400',
};

function mapDbBook(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    isbn: '',
    cover: (row.cover_url as string) || '',
    description: (row.description as string) || '',
    pages: (row.page_count as number) || 200,
    year: (row.year as number) || 0,
    genres: (row.genres as string[]) || [],
    moods: (row.mood_tags as string[]) || [],
    professions: (row.professions as string[]) || [],
    tags: [],
  };
}

async function fetchByProfession(profession: string): Promise<Book[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('books')
    .select('*')
    .contains('professions', [profession])
    .order('title')
    .limit(20);
  return (data ?? []).map(mapDbBook);
}

async function fetchByMood(mood: string): Promise<Book[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('books')
    .select('*')
    .contains('mood_tags', [mood])
    .order('title')
    .limit(20);
  return (data ?? []).map(mapDbBook);
}

async function fetchByGenreKeywords(keywords: string[]): Promise<Book[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('books')
    .select('*')
    .overlaps('genres', keywords)
    .order('title')
    .limit(20);
  return (data ?? []).map(mapDbBook);
}

const CHALLENGE_GENRE_MAP: Record<string, string[]> = {
  default: ['literary', 'classic', 'nonfiction', 'fantasy', 'scifi', 'thriller', 'mystery'],
};

export default function DiscoverSection() {
  const { openBook, setDynamicBook } = useApp();
  const [tab, setTab] = useState<Tab>('profession');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const challenges = Object.values(CHALLENGE_BY_ID).slice(0, 16);

  useEffect(() => {
    if (!selectedFilter) { setBooks([]); return; }
    setLoading(true);
    const load = async () => {
      let results: Book[] = [];
      if (tab === 'profession') {
        results = await fetchByProfession(selectedFilter);
      } else if (tab === 'mood') {
        results = await fetchByMood(selectedFilter);
      } else {
        const ch = CHALLENGE_BY_ID[selectedFilter];
        const keywords = ch
          ? ch.label.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
          : CHALLENGE_GENRE_MAP.default;
        results = await fetchByGenreKeywords(keywords.length ? keywords : CHALLENGE_GENRE_MAP.default);
      }
      setBooks(results);
      setLoading(false);
    };
    load();
  }, [selectedFilter, tab]);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setSelectedFilter(null);
    setBooks([]);
  };

  const handleBookClick = (book: Book) => {
    setDynamicBook(book);
    openBook(book.id);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profession', label: 'Profession', icon: <Briefcase size={13} /> },
    { id: 'mood', label: 'Mood', icon: <Sparkles size={13} /> },
    { id: 'challenge', label: 'Challenge', icon: <Trophy size={13} /> },
  ];

  return (
    <section
      id="discover"
      className="py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A1030 0%, #0F0B1A 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Compass size={14} className="text-primary-400" />
              <span className="font-body text-primary-400 text-[10px] font-semibold uppercase tracking-[0.2em]">
                Browse &amp; Discover
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Find your next book
            </h2>
          </div>

          <div
            className="flex items-center gap-1 rounded-xl p-1"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className="flex items-center gap-1.5 font-body text-xs font-medium px-3.5 py-2 rounded-lg transition-all duration-200"
                style={
                  tab === t.id
                    ? {
                        background: 'rgba(124,58,237,0.6)',
                        color: '#fff',
                        boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
                      }
                    : { color: 'rgba(255,255,255,0.45)' }
                }
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'profession' && (
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-hide">
            {PROFESSIONS.map((prof) => {
              const active = selectedFilter === prof.id;
              const img = PROFESSION_IMAGES[prof.id];
              return (
                <button
                  key={prof.id}
                  onClick={() => setSelectedFilter(active ? null : prof.id)}
                  className="flex-none relative h-24 w-40 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1"
                  style={{
                    border: active
                      ? '2px solid rgba(167,139,250,0.7)'
                      : '1px solid rgba(124,58,237,0.18)',
                    boxShadow: active ? '0 4px 20px rgba(124,58,237,0.4)' : '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  <img src={img} alt={prof.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {active && (
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35), transparent 60%)' }}
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between">
                    <div className="text-left">
                      <p className="font-heading text-white font-bold text-xs leading-tight">{prof.name}</p>
                      <p className="font-body text-white/55 text-[9px] mt-0.5">{prof.tag}</p>
                    </div>
                    <span className="text-base">{prof.icon}</span>
                  </div>
                  {active && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 2px 8px rgba(124,58,237,0.6)' }}
                    >
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {tab === 'mood' && (
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-hide">
            {MOODS.map((mood) => {
              const active = selectedFilter === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedFilter(active ? null : mood.id)}
                  className="flex-none relative h-24 w-44 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1"
                  style={{
                    border: active
                      ? '2px solid rgba(167,139,250,0.7)'
                      : '1px solid rgba(124,58,237,0.18)',
                    boxShadow: active ? '0 4px 20px rgba(124,58,237,0.4)' : '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  <img src={mood.image} alt={mood.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${mood.gradient} opacity-70`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {active && (
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35), transparent 60%)' }}
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="font-heading text-white font-bold text-xs leading-tight">{mood.title}</p>
                    <p className="font-body text-white/55 text-[9px] mt-0.5 line-clamp-1">{mood.description}</p>
                  </div>
                  {active && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 2px 8px rgba(124,58,237,0.6)' }}
                    >
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {tab === 'challenge' && (
          <div className="flex gap-2 pb-2 -mx-6 px-6 flex-wrap">
            {challenges.map((ch) => {
              const active = selectedFilter === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedFilter(active ? null : ch.id)}
                  className="flex-none flex items-center gap-1.5 font-body text-xs font-medium px-3.5 py-2 rounded-full transition-all duration-200"
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                          color: '#fff',
                          boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
                          border: '1px solid transparent',
                        }
                      : {
                          background: 'rgba(124,58,237,0.1)',
                          color: 'rgba(255,255,255,0.6)',
                          border: '1px solid rgba(124,58,237,0.2)',
                        }
                  }
                >
                  <Trophy size={11} style={{ opacity: active ? 0.8 : 0.6 }} />
                  {ch.label}
                  {active && <ChevronRight size={11} style={{ opacity: 0.7 }} />}
                </button>
              );
            })}
          </div>
        )}

        {selectedFilter && (
          <div className="mt-8">
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
            ) : books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-10 rounded-2xl"
                style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}
              >
                <p className="font-body text-white/45 text-sm">No books found for this selection.</p>
              </div>
            )}
          </div>
        )}

        {!selectedFilter && (
          <p className="mt-6 font-body text-xs text-white/30 text-center">
            {tab === 'profession'
              ? 'Select a profession above to see curated books.'
              : tab === 'mood'
              ? 'Pick a mood to find matching books.'
              : 'Choose a challenge to discover books.'}
          </p>
        )}
      </div>
    </section>
  );
}

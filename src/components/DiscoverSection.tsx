import { useState, useEffect } from 'react';
import { Compass, Briefcase, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  fetchBooksByProfession,
  fetchBooksByMood,
  searchBooks,
} from '../lib/openLibraryService';
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
      if (tab === 'profession') results = await fetchBooksByProfession(selectedFilter);
      else if (tab === 'mood') results = await fetchBooksByMood(selectedFilter);
      else {
        const ch = CHALLENGE_BY_ID[selectedFilter];
        if (ch) results = await searchBooks(ch.label);
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
    <section id="discover" className="py-12 bg-white border-t border-primary-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header + tabs inline */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-primary-400" />
              <h2 className="font-heading text-xl font-bold text-primary-900">Discover</h2>
            </div>
            <div className="flex items-center gap-1 bg-primary-50 rounded-xl p-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`flex items-center gap-1.5 font-body text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    tab === t.id
                      ? 'bg-white text-primary-900 shadow-sm'
                      : 'text-primary-400 hover:text-primary-700'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profession chips — horizontal scroll with images */}
        {tab === 'profession' && (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
            {PROFESSIONS.map((prof) => {
              const active = selectedFilter === prof.id;
              const img = PROFESSION_IMAGES[prof.id];
              return (
                <button
                  key={prof.id}
                  onClick={() => setSelectedFilter(active ? null : prof.id)}
                  className={`flex-none relative h-20 w-36 rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.03] ${
                    active ? 'ring-2 ring-primary-900 ring-offset-2' : ''
                  }`}
                >
                  <img src={img} alt={prof.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between">
                    <div className="text-left">
                      <p className="font-heading text-white font-bold text-xs leading-tight">{prof.name}</p>
                      <p className="font-body text-white/60 text-[9px] mt-0.5">{prof.tag}</p>
                    </div>
                    <span className="text-base">{prof.icon}</span>
                  </div>
                  {active && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                      <span className="text-primary-900 text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Mood chips — horizontal scroll with images */}
        {tab === 'mood' && (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
            {MOODS.map((mood) => {
              const active = selectedFilter === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedFilter(active ? null : mood.id)}
                  className={`flex-none relative h-20 w-40 rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.03] ${
                    active ? 'ring-2 ring-primary-900 ring-offset-2' : ''
                  }`}
                >
                  <img src={mood.image} alt={mood.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${mood.gradient} opacity-80`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="font-heading text-white font-bold text-xs leading-tight">{mood.title}</p>
                    <p className="font-body text-white/65 text-[9px] mt-0.5 line-clamp-1">{mood.description}</p>
                  </div>
                  {active && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                      <span className="text-primary-900 text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Challenge chips — horizontal scroll */}
        {tab === 'challenge' && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 flex-wrap" style={{ scrollbarWidth: 'none' }}>
            {challenges.map((ch) => {
              const active = selectedFilter === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedFilter(active ? null : ch.id)}
                  className={`flex-none flex items-center gap-1.5 font-body text-xs font-medium px-3 py-2 rounded-full border transition-all ${
                    active
                      ? 'bg-primary-900 text-white border-primary-900'
                      : 'bg-white text-primary-700 border-primary-200 hover:border-primary-400'
                  }`}
                >
                  <Trophy size={11} className={active ? 'text-white/70' : 'text-primary-400'} />
                  {ch.label}
                  {active && <ChevronRight size={11} className="text-white/60" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Results */}
        {selectedFilter && (
          <div className="mt-8">
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
            ) : books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {books.slice(0, 20).map((book) => (
                  <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-primary-50 rounded-2xl">
                <p className="font-body text-primary-500 text-sm">No books found. Try another selection.</p>
              </div>
            )}
          </div>
        )}

        {!selectedFilter && (
          <p className="mt-6 font-body text-xs text-primary-400 text-center">
            {tab === 'profession' ? 'Select a profession above to see curated books.' :
             tab === 'mood' ? 'Pick a mood to find matching books.' :
             'Choose a challenge to discover books.'}
          </p>
        )}
      </div>
    </section>
  );
}
